"use server"

import { deleteSessionCookie } from "@/lib/session-utils"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import pool from "@/lib/db"
import { getFullUserSession } from "@/lib/auth"
import { z } from "zod"
import { cache } from "react"
import { InsuranceHolder } from "@/interfaces/insurance-holder"
import { SearchParams } from "@/interfaces/search-params-props" 
import { RowDataPacket } from 'mysql2';

interface MainStats extends RowDataPacket {
    totalHolders: number;
    activePolicies: number;
    inactivePolicies: number;
    expiredPolicies: number;
    totalInsuredValue: number;
    totalUsedCoverage: number;
    averagePolicyValue: number;
    coverageUsagePercentage: number;
    averageAge: number;
    femaleHolders: number;
    maleHolders: number;
    expiringIn30Days: number;
    expiringIn31_90Days: number;
    newPoliciesLast30Days: number;
}

interface DistributionRow extends RowDataPacket {
    name: string;
    value: number;
}

type DistributionMap = Record<string, number>;

export interface InsuranceHoldersStats {
    generalMetrics: {
        totalHolders: number;
        activePolicies: number;
        inactivePolicies: number;
        expiredPolicies: number;
    };
    financialMetrics: {
        totalInsuredValue: number;
        totalUsedCoverage: number;
        averagePolicyValue: number;
        coverageUsagePercentage: number;
    };
    demographics: {
        averageAge: number;
        femaleHolders: number;
        maleHolders: number;
    };
    distributions: {
        byCompany: DistributionMap;
        byPolicyType: DistributionMap;
        byCity: DistributionMap;
        byAgeGroup: DistributionMap;
    };
    actionableInsights: {
        expiringIn30Days: number;
        expiringIn31_90Days: number;
        newPoliciesLast30Days: number;
    };
}

// Esquema de validación para el formulario de usuario
const userSchema = z.object({
    id: z.string().optional(),
    email: z.string().email("Correo electrónico inválido."),
    name: z.string().min(1, "El nombre es requerido."),
    role: z.enum(["Superusuario", "Administrador", "Analista", "Médico Auditor"], {
        errorMap: () => ({ message: "Rol inválido." }),
    }),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional().or(z.literal("")),
    assignedStates: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
})

// Esquema de validación para el formulario de caso
const caseSchema = z.object({
    id: z.string().optional(),
    client: z.string().min(1, "El cliente es requerido."),
    date: z.string().min(1, "La fecha es requerida."),
    sinisterNo: z.string().optional().nullable(),
    idNumber: z.string().optional().nullable(),
    ciTitular: z.string().optional().nullable(),
    ciPatient: z.string().min(1, "La CI del paciente es requerida."),
    patientName: z.string().min(1, "El nombre del paciente es requerido."),
    patientPhone: z.string().min(1, "El teléfono del paciente es requerido."),
    assignedAnalystId: z.string().optional().nullable(),
    status: z.string().min(1, "El estado es requerido."),
    doctor: z.string().optional().nullable(),
    schedule: z.string().optional().nullable(),
    consultory: z.string().optional().nullable(),
    results: z.string().optional().nullable(),
    auditNotes: z.string().optional().nullable(),
    clinicCost: z.preprocess(
        (val) => (val === "" ? null : Number(val)),
        z.number().min(0, "El costo clínico no puede ser negativo.").nullable().optional(),
    ),
    cgmServiceCost: z.preprocess(
        (val) => (val === "" ? null : Number(val)),
        z.number().min(0, "El costo de servicio test no puede ser negativo.").nullable().optional(),
    ),
    totalInvoiceAmount: z.preprocess(
        (val) => (val === "" ? null : Number(val)),
        z.number().min(0, "El monto total de la factura no puede ser negativo.").nullable().optional(),
    ),
    invoiceGenerated: z.boolean().optional(),
    creatorName: z.string().optional().nullable(),
    creatorEmail: z.string().email("Correo electrónico del creador inválido.").optional().nullable(),
    creatorPhone: z.string().optional().nullable(),
    patientOtherPhone: z.string().optional().nullable(),
    patientFixedPhone: z.string().optional().nullable(),
    patientBirthDate: z.string().optional().nullable(),
    patientAge: z.preprocess(
        (val) => (val === "" ? null : Number(val)),
        z.number().int().min(0, "La edad no puede ser negativa.").nullable().optional(),
    ),
    patientGender: z.string().optional().nullable(),
    collective: z.string().optional().nullable(),
    diagnosis: z.string().optional().nullable(),
    provider: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    holderCI: z.string().optional().nullable(),
    services: z
        .array(
            z.object({
                procedure: z.string(),
                quantity: z.number(),
                unitCost: z.number(),
                totalCost: z.number(),
            }),
        )
        .optional()
        .nullable(),
    typeOfRequirement: z.string().optional().nullable(),
})

// Esquema de validación para el formulario de baremo
const baremoSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "El nombre del baremo es requerido."),
    clinicName: z.string().min(1, "El nombre de la clínica es requerido."),
    effectiveDate: z.string().min(1, "La fecha efectiva es requerida."),
    procedures: z
        .array(
            z.object({
                code: z.string().min(1, "El código es requerido."),
                description: z.string().min(1, "La descripción es requerida."),
                cost: z.preprocess((val) => Number(val), z.number().min(0, "El costo no puede ser negativo.")),
            }),
        )
        .min(1, "Debe haber al menos un procedimiento."),
})

// Esquema de validación para el formulario de pago
const paymentSchema = z.object({
    id: z.string().optional(),
    invoiceId: z.string().min(1, "El ID de la factura es requerido."),
    amount: z.preprocess((val) => Number(val), z.number().min(0.01, "El monto debe ser mayor que cero.")),
    paymentDate: z.string().min(1, "La fecha de pago es requerida."),
    status: z.string().min(1, "El estado del pago es requerido."),
    notes: z.string().optional().nullable(),
})

const ITEMS_PER_PAGE = 10;

export const fetchFilteredInsuranceHolders = cache(
    async (
        filters: SearchParams
    ): Promise<{ holders: InsuranceHolder[], total: number }> => {
        const session = await getFullUserSession();
        if (!session) {
            return {
                holders: [],
                total: 0
            };
        }
        
        const {
            currentPage = 1,
            query,
            policyStatus,
            insuranceCompany,
            policyType,
            city
        } = filters;

        const offset = (currentPage - 1) * ITEMS_PER_PAGE;

        try {
            // --- 1. Construir la base de la consulta y los filtros ---
            const whereClauses: string[] = [];
            const params: (string | number)[] = [];

            if (query) {
                const searchTerm = `%${query}%`;
                whereClauses.push(`(name LIKE ? OR ci LIKE ? OR phone LIKE ? OR email LIKE ? OR policyNumber LIKE ?)`);
                params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            }
            if (policyStatus) {
                whereClauses.push(`policyStatus = ?`);
                params.push(policyStatus);
            }
            if (insuranceCompany) {
                whereClauses.push(`insuranceCompany = ?`);
                params.push(insuranceCompany);
            }
            if (policyType) {
                whereClauses.push(`policyType = ?`);
                params.push(policyType);
            }
            if (city) {
                whereClauses.push(`city = ?`);
                params.push(city);
            }

            // --- 2. Crear la cláusula WHERE para ambas consultas ---
            const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

            // --- 3. Definir ambas consultas (conteo y datos) ---

            // Consulta para obtener el número total de registros FILTRADOS
            const countSql = `SELECT COUNT(*) AS total FROM insurance_holders ${whereSql}`;
            
            // Consulta para obtener los datos paginados y FILTRADOS
            const dataSql = `
                SELECT 
                    id, ci, name, phone, email, policyNumber, insuranceCompany, 
                    policyType, policyStatus, coverageType, maxCoverageAmount, 
                    usedCoverageAmount, isActive
                FROM 
                    insurance_holders
                ${whereSql}
                ORDER BY name ASC 
                LIMIT ? 
                OFFSET ?
            `;
            
            // Los parámetros para el conteo son los mismos que para el WHERE de los datos
            const countParams = [...params];
            // A los parámetros de los datos, añadimos los de paginación
            const dataParams = [...params, String(ITEMS_PER_PAGE), String(offset)];

            // --- 4. Ejecutar ambas consultas en paralelo ---
            const [countResult, dataResult]: [any, any] = await Promise.all([
                pool.execute(countSql, countParams),
                pool.execute(dataSql, dataParams)
            ]);

            const total = countResult[0][0].total || 0;
            const holders = dataResult[0];

            const insuranceHolders = holders.map((row: any) => ({
                ...row,
                isActive: Boolean(row.isActive),
                // Puedes dejar estos valores en 0 o calcularlos si es necesario
                totalCases: 0,
                totalPatients: 0,
            }));

            return {
                holders: insuranceHolders,
                total: total,
            };

        } catch (error) {
            console.error('Error de base de datos al obtener titulares:', error);
            throw new Error('Failed to fetch insurance holders.');
        }
    }
);


/**
 * Calcula y devuelve un conjunto completo de métricas para el dashboard de seguros.
 * @returns Un objeto con métricas generales, financieras, demográficas y distribuciones.
 */
export const fetchInsuranceHoldersStats = cache(async (): Promise<InsuranceHoldersStats> => {
    const session = await getFullUserSession();
    if (!session) {
        // Retorno para cuando no hay sesión. Debe coincidir con la interfaz.
        return {
        generalMetrics: { totalHolders: 0, activePolicies: 0, inactivePolicies: 0, expiredPolicies: 0 },
        financialMetrics: { totalInsuredValue: 0, totalUsedCoverage: 0, averagePolicyValue: 0, coverageUsagePercentage: 0 },
        demographics: { averageAge: 0, femaleHolders: 0, maleHolders: 0 },
        distributions: { byCompany: {}, byPolicyType: {}, byCity: {}, byAgeGroup: {} },
        actionableInsights: { expiringIn30Days: 0, expiringIn31_90Days: 0, newPoliciesLast30Days: 0 }
        };
    }

    try {
        const statsQuery = `
        SELECT 
            COUNT(*) AS totalHolders,
            SUM(CASE WHEN policyStatus = 'Activo' THEN 1 ELSE 0 END) AS activePolicies,
            SUM(CASE WHEN policyStatus = 'Inactivo' THEN 1 ELSE 0 END) AS inactivePolicies,
            SUM(CASE WHEN policyStatus = 'Vencido' THEN 1 ELSE 0 END) AS expiredPolicies,
            SUM(maxCoverageAmount) AS totalInsuredValue,
            SUM(usedCoverageAmount) AS totalUsedCoverage,
            AVG(maxCoverageAmount) AS averagePolicyValue,
            (SUM(usedCoverageAmount) / NULLIF(SUM(maxCoverageAmount), 0)) * 100 AS coverageUsagePercentage,
            AVG(age) AS averageAge,
            SUM(CASE WHEN gender = 'Femenino' THEN 1 ELSE 0 END) AS femaleHolders,
            SUM(CASE WHEN gender = 'Masculino' THEN 1 ELSE 0 END) AS maleHolders,
            SUM(CASE WHEN policyEndDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS expiringIn30Days,
            SUM(CASE WHEN policyEndDate BETWEEN DATE_ADD(CURDATE(), INTERVAL 31 DAY) AND DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) AS expiringIn31_90Days,
            SUM(CASE WHEN policyStartDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS newPoliciesLast30Days
        FROM insurance_holders;
        `;

        const byCompanyQuery = "SELECT insuranceCompany as name, COUNT(*) as value FROM insurance_holders GROUP BY insuranceCompany ORDER BY value DESC;";
        const byPolicyTypeQuery = "SELECT policyType as name, COUNT(*) as value FROM insurance_holders GROUP BY policyType ORDER BY value DESC;";
        const byCityQuery = "SELECT city as name, COUNT(*) as value FROM insurance_holders GROUP BY city ORDER BY value DESC LIMIT 10;";
        const byAgeGroupQuery = `
            SELECT 
                CASE
                    WHEN age < 25 THEN 'Menos de 25'
                    WHEN age BETWEEN 25 AND 34 THEN '25-34 años'
                    WHEN age BETWEEN 35 AND 44 THEN '35-44 años'
                    WHEN age BETWEEN 45 AND 54 THEN '45-54 años'
                    WHEN age >= 55 THEN '55 o más'
                END as name,
                COUNT(*) as value
            FROM insurance_holders
            -- CAMBIO: Agrupamos por la expresión completa, no por el alias.
            GROUP BY
                CASE
                    WHEN age < 25 THEN 'Menos de 25'
                    WHEN age BETWEEN 25 AND 34 THEN '25-34 años'
                    WHEN age BETWEEN 35 AND 44 THEN '35-44 años'
                    WHEN age BETWEEN 45 AND 54 THEN '45-54 años'
                    WHEN age >= 55 THEN '55 o más'
                END
            ORDER BY name;
        `;

        
        const [
        mainStatsResponse,
        byCompanyResponse,
        byPolicyTypeResponse,
        byCityResponse,
        byAgeGroupResponse
        ] = await Promise.all([
        pool.execute<MainStats[]>(statsQuery),
        pool.execute<DistributionRow[]>(byCompanyQuery),
        pool.execute<DistributionRow[]>(byPolicyTypeQuery),
        pool.execute<DistributionRow[]>(byCityQuery),
        pool.execute<DistributionRow[]>(byAgeGroupQuery)
        ]);
        
        const mainStats = mainStatsResponse[0][0];
        const byCompanyResult = byCompanyResponse[0];
        const byPolicyTypeResult = byPolicyTypeResponse[0];
        const byCityResult = byCityResponse[0];
        const byAgeGroupResult = byAgeGroupResponse[0];

        const arrayToObject = (arr: DistributionRow[]): DistributionMap => arr.reduce((obj, item) => {
            obj[item.name] = item.value;
            return obj;
        }, {} as DistributionMap);

        return {
        generalMetrics: {
            totalHolders: Number(mainStats.totalHolders) || 0,
            activePolicies: Number(mainStats.activePolicies) || 0,
            inactivePolicies: Number(mainStats.inactivePolicies) || 0,
            expiredPolicies: Number(mainStats.expiredPolicies) || 0,
        },
        financialMetrics: {
            totalInsuredValue: Number(mainStats.totalInsuredValue) || 0,
            totalUsedCoverage: Number(mainStats.totalUsedCoverage) || 0,
            averagePolicyValue: Number(mainStats.averagePolicyValue) || 0,
            coverageUsagePercentage: Number(mainStats.coverageUsagePercentage) || 0,
        },
        demographics: {
            averageAge: Math.round(Number(mainStats.averageAge)) || 0,
            femaleHolders: Number(mainStats.femaleHolders) || 0,
            maleHolders: Number(mainStats.maleHolders) || 0,
        },
        distributions: {
            byCompany: arrayToObject(byCompanyResult),
            byPolicyType: arrayToObject(byPolicyTypeResult),
            byCity: arrayToObject(byCityResult),
            byAgeGroup: arrayToObject(byAgeGroupResult),
        },
        actionableInsights: {
            expiringIn30Days: Number(mainStats.expiringIn30Days) || 0,
            expiringIn31_90Days: Number(mainStats.expiringIn31_90Days) || 0,
            newPoliciesLast30Days: Number(mainStats.newPoliciesLast30Days) || 0,
        }
        };
    } catch (error) {
        console.error('Database Error fetching stats:', error);
        // Retorna un objeto vacío con la estructura de la interfaz en caso de error.
        return {
            generalMetrics: { totalHolders: 0, activePolicies: 0, inactivePolicies: 0, expiredPolicies: 0 },
            financialMetrics: { totalInsuredValue: 0, totalUsedCoverage: 0, averagePolicyValue: 0, coverageUsagePercentage: 0 },
            demographics: { averageAge: 0, femaleHolders: 0, maleHolders: 0 },
            distributions: { byCompany: {}, byPolicyType: {}, byCity: {}, byAgeGroup: {} },
            actionableInsights: { expiringIn30Days: 0, expiringIn31_90Days: 0, newPoliciesLast30Days: 0 }
        };
    }
});


export async function updateUser(prevState: any, formData: FormData) {
    const session = await getFullUserSession()
    if (!session || (session.role !== "Superusuario" && session.role !== "Administrador")) {
        return { success: false, message: "No autorizado." }
    }

    const data = {
        id: formData.get("id"),
        email: formData.get("email"),
        name: formData.get("name"),
        role: formData.get("role"),
        password: formData.get("password"),
        assignedStates: JSON.parse((formData.get("assignedStates") as string) || "[]"),
        isActive: formData.get("isActive") === "true",
    }

    const validatedFields = userSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación.",
        }
    }

    const { id, email, name, role, password, assignedStates, isActive } = validatedFields.data

    if (!id) {
        return { success: false, message: "ID de usuario no proporcionado." }
    }

    if (isActive === undefined) {
        return { success: false, message: "El estado de actividad es requerido." }
    }

    try {
        let query = "UPDATE users SET email = ?, name = ?, role = ?, assignedStates = ?, isActive = ? WHERE id = ?"
        let params: (string | boolean | string[])[] = [email, name, role, JSON.stringify(assignedStates), isActive, id]

        if (password) {
            const hashedPassword = await hash(password, 10)
            query =
                "UPDATE users SET email = ?, name = ?, role = ?, password = ?, assignedStates = ?, isActive = ? WHERE id = ?"
            params = [email, name, role, hashedPassword, JSON.stringify(assignedStates), isActive, id]
        }

        await pool.execute(query, params)
        revalidatePath("/users")
        return { success: true, message: "Usuario actualizado exitosamente." }
    } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
            return { success: false, message: "El correo electrónico ya está registrado." }
        }
        console.error("Error updating user:", error)
        return { success: false, message: "Error al actualizar el usuario." }
    }
}

export async function deleteUser(userId: string) {
    const session = await getFullUserSession()
    if (!session || session.role !== "Superusuario") {
        return { success: false, message: "No autorizado." }
    }

    try {
        // Check if the user is assigned to any cases
        const [caseRows]: any = await pool.execute("SELECT COUNT(*) AS count FROM cases WHERE assignedAnalystId = ?", [
            userId,
        ])

        if (caseRows[0].count > 0) {
            return { success: false, message: "No se puede eliminar el usuario porque tiene casos asignados." }
        }

        await pool.execute("DELETE FROM users WHERE id = ?", [userId])
        revalidatePath("/users")
        return { success: true, message: "Usuario eliminado exitosamente." }
    } catch (error) {
        console.error("Error deleting user:", error)
        return { success: false, message: "Error al eliminar el usuario." }
    }
}

export async function createCase(prevState: any, formData: FormData) {
    const session = await getFullUserSession()
    if (!session) {
        return { success: false, message: "No autorizado." }
    }

    const data = {
        client: formData.get("client"),
        date: formData.get("date"),
        sinisterNo: formData.get("sinisterNo"),
        idNumber: formData.get("idNumber"),
        ciTitular: formData.get("ciTitular"),
        ciPatient: formData.get("ciPatient"),
        patientName: formData.get("patientName"),
        patientPhone: formData.get("patientPhone"),
        assignedAnalystId: formData.get("assignedAnalystId") || null,
        status: formData.get("status"),
        doctor: formData.get("doctor"),
        schedule: formData.get("schedule"),
        consultory: formData.get("consultory"),
        results: formData.get("results"),
        auditNotes: formData.get("auditNotes"),
        clinicCost: formData.get("clinicCost"),
        cgmServiceCost: formData.get("cgmServiceCost"),
        totalInvoiceAmount: formData.get("totalInvoiceAmount"),
        invoiceGenerated: formData.get("invoiceGenerated") === "true",
        creatorName: session.name,
        creatorEmail: session.email,
        creatorPhone: formData.get("creatorPhone"),
        patientOtherPhone: formData.get("patientOtherPhone"),
        patientFixedPhone: formData.get("patientFixedPhone"),
        patientBirthDate: formData.get("patientBirthDate"),
        patientAge: formData.get("patientAge"),
        patientGender: formData.get("patientGender"),
        collective: formData.get("collective"),
        diagnosis: formData.get("diagnosis"),
        provider: formData.get("provider"),
        state: formData.get("state"),
        city: formData.get("city"),
        address: formData.get("address"),
        holderCI: formData.get("holderCI"),
        services: formData.get("services") ? JSON.parse(formData.get("services") as string) : [],
        typeOfRequirement: formData.get("typeOfRequirement"),
    }

    const validatedFields = caseSchema.safeParse(data)

    if (!validatedFields.success) {
        console.error("Validation errors:", validatedFields.error.flatten().fieldErrors)
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación al crear el caso.",
        }
    }

    const {
        client,
        date,
        sinisterNo,
        idNumber,
        ciTitular,
        ciPatient,
        patientName,
        patientPhone,
        assignedAnalystId,
        status,
        doctor,
        schedule,
        consultory,
        results,
        auditNotes,
        clinicCost,
        cgmServiceCost,
        totalInvoiceAmount,
        invoiceGenerated,
        creatorName,
        creatorEmail,
        creatorPhone,
        patientOtherPhone,
        patientFixedPhone,
        patientBirthDate,
        patientAge,
        patientGender,
        collective,
        diagnosis,
        provider,
        state,
        city,
        address,
        holderCI,
        services,
        typeOfRequirement,
    } = validatedFields.data

    try {
        const id = uuidv4()
        await pool.execute(
            `INSERT INTO cases (
        id, client, date, sinisterNo, idNumber, ciTitular, ciPatient, patientName, patientPhone,
        assignedAnalystId, status, doctor, schedule, consultory, results, auditNotes,
        clinicCost, cgmServiceCost, totalInvoiceAmount, invoiceGenerated, creatorName,
        creatorEmail, creatorPhone, patientOtherPhone, patientFixedPhone, patientBirthDate,
        patientAge, patientGender, collective, diagnosis, provider, state, city, address,
        holderCI, services, typeOfRequirement
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                client,
                date,
                sinisterNo,
                idNumber,
                ciTitular,
                ciPatient,
                patientName,
                patientPhone,
                assignedAnalystId,
                status,
                doctor,
                schedule,
                consultory,
                results,
                auditNotes,
                clinicCost,
                cgmServiceCost,
                totalInvoiceAmount,
                invoiceGenerated,
                creatorName,
                creatorEmail,
                creatorPhone,
                patientOtherPhone,
                patientFixedPhone,
                patientBirthDate,
                patientAge,
                patientGender,
                collective,
                diagnosis,
                provider,
                state,
                city,
                address,
                holderCI,
                JSON.stringify(services),
                typeOfRequirement,
            ],
        )
        revalidatePath("/cases")
        revalidatePath("/dashboard")
        revalidatePath("/analyst-dashboard")
        revalidatePath("/auditor-dashboard")
        return { success: true, message: "Caso creado exitosamente.", caseId: id }
    } catch (error) {
        console.error("Error creating case:", error)
        return { success: false, message: "Error al crear el caso." }
    }
}

export async function updateCase(prevState: any, formData: FormData) {
    const session = await getFullUserSession()
    if (!session) {
        return { success: false, message: "No autorizado." }
    }

    const data = {
        id: formData.get("id"),
        client: formData.get("client"),
        date: formData.get("date"),
        sinisterNo: formData.get("sinisterNo"),
        idNumber: formData.get("idNumber"),
        ciTitular: formData.get("ciTitular"),
        ciPatient: formData.get("ciPatient"),
        patientName: formData.get("patientName"),
        patientPhone: formData.get("patientPhone"),
        assignedAnalystId: formData.get("assignedAnalystId") || null,
        status: formData.get("status"),
        doctor: formData.get("doctor"),
        schedule: formData.get("schedule"),
        consultory: formData.get("consultory"),
        results: formData.get("results"),
        auditNotes: formData.get("auditNotes"),
        clinicCost: formData.get("clinicCost"),
        cgmServiceCost: formData.get("cgmServiceCost"),
        totalInvoiceAmount: formData.get("totalInvoiceAmount"),
        invoiceGenerated: formData.get("invoiceGenerated") === "true",
        creatorName: formData.get("creatorName"),
        creatorEmail: formData.get("creatorEmail"),
        creatorPhone: formData.get("creatorPhone"),
        patientOtherPhone: formData.get("patientOtherPhone"),
        patientFixedPhone: formData.get("patientFixedPhone"),
        patientBirthDate: formData.get("patientBirthDate"),
        patientAge: formData.get("patientAge"),
        patientGender: formData.get("patientGender"),
        collective: formData.get("collective"),
        diagnosis: formData.get("diagnosis"),
        provider: formData.get("provider"),
        state: formData.get("state"),
        city: formData.get("city"),
        address: formData.get("address"),
        holderCI: formData.get("holderCI"),
        services: formData.get("services") ? JSON.parse(formData.get("services") as string) : [],
        typeOfRequirement: formData.get("typeOfRequirement"),
    }

    const validatedFields = caseSchema.safeParse(data)

    if (!validatedFields.success) {
        console.error("Validation errors:", validatedFields.error.flatten().fieldErrors)
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación al actualizar el caso.",
        }
    }

    const {
        id,
        client,
        date,
        sinisterNo,
        idNumber,
        ciTitular,
        ciPatient,
        patientName,
        patientPhone,
        assignedAnalystId,
        status,
        doctor,
        schedule,
        consultory,
        results,
        auditNotes,
        clinicCost,
        cgmServiceCost,
        totalInvoiceAmount,
        invoiceGenerated,
        creatorName,
        creatorEmail,
        creatorPhone,
        patientOtherPhone,
        patientFixedPhone,
        patientBirthDate,
        patientAge,
        patientGender,
        collective,
        diagnosis,
        provider,
        state,
        city,
        address,
        holderCI,
        services,
        typeOfRequirement,
    } = validatedFields.data

    if (!id) {
        return { success: false, message: "ID de caso no proporcionado." }
    }

    try {
        await pool.execute(
            `UPDATE cases SET
        client = ?, date = ?, sinisterNo = ?, idNumber = ?, ciTitular = ?, ciPatient = ?, patientName = ?, patientPhone = ?,
        assignedAnalystId = ?, status = ?, doctor = ?, schedule = ?, consultory = ?, results = ?, auditNotes = ?,
        clinicCost = ?, cgmServiceCost = ?, totalInvoiceAmount = ?, invoiceGenerated = ?, creatorName = ?,
        creatorEmail = ?, creatorPhone = ?, patientOtherPhone = ?, patientFixedPhone = ?, patientBirthDate = ?,
        patientAge = ?, patientGender = ?, collective = ?, diagnosis = ?, provider = ?, state = ?, city = ?, address = ?,
        holderCI = ?, services = ?, typeOfRequirement = ?
      WHERE id = ?`,
            [
                client,
                date,
                sinisterNo,
                idNumber,
                ciTitular,
                ciPatient,
                patientName,
                patientPhone,
                assignedAnalystId,
                status,
                doctor,
                schedule,
                consultory,
                results,
                auditNotes,
                clinicCost,
                cgmServiceCost,
                totalInvoiceAmount,
                invoiceGenerated,
                creatorName,
                creatorEmail,
                creatorPhone,
                patientOtherPhone,
                patientFixedPhone,
                patientBirthDate,
                patientAge,
                patientGender,
                collective,
                diagnosis,
                provider,
                state,
                city,
                address,
                holderCI,
                JSON.stringify(services),
                typeOfRequirement,
                id,
            ],
        )
        revalidatePath(`/cases/${id}`)
        revalidatePath("/cases")
        revalidatePath("/dashboard")
        revalidatePath("/analyst-dashboard")
        revalidatePath("/auditor-dashboard")
        return { success: true, message: "Caso actualizado exitosamente." }
    } catch (error) {
        console.error("Error updating case:", error)
        return { success: false, message: "Error al actualizar el caso." }
    }
}

export async function deleteCase(caseId: string) {
    const session = await getFullUserSession()
    if (!session || (session.role !== "Superusuario" && session.role !== "Administrador")) {
        return { success: false, message: "No autorizado." }
    }

    try {
        await pool.execute("DELETE FROM cases WHERE id = ?", [caseId])
        revalidatePath("/cases")
        revalidatePath("/dashboard")
        revalidatePath("/analyst-dashboard")
        revalidatePath("/auditor-dashboard")
        return { success: true, message: "Caso eliminado exitosamente." }
    } catch (error) {
        console.error("Error deleting case:", error)
        return { success: false, message: "Error al eliminar el caso." }
    }
}

export async function createBaremo(prevState: any, formData: FormData) {
    const session = await getFullUserSession()
    if (!session || (session.role !== "Superusuario" && session.role !== "Administrador")) {
        return { success: false, message: "No autorizado." }
    }

    const data = {
        name: formData.get("name"),
        clinicName: formData.get("clinicName"),
        effectiveDate: formData.get("effectiveDate"),
        procedures: JSON.parse((formData.get("procedures") as string) || "[]"),
    }

    const validatedFields = baremoSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación.",
        }
    }

    const { name, clinicName, effectiveDate, procedures } = validatedFields.data

    try {
        const id = uuidv4()
        await pool.execute("INSERT INTO baremos (id, name, clinicName, effectiveDate, procedures) VALUES (?, ?, ?, ?, ?)", [
            id,
            name,
            clinicName,
            effectiveDate,
            JSON.stringify(procedures),
        ])
        revalidatePath("/baremos")
        return { success: true, message: "Baremo creado exitosamente." }
    } catch (error) {
        console.error("Error creating baremo:", error)
        return { success: false, message: "Error al crear el baremo." }
    }
}

export async function updateBaremo(prevState: any, formData: FormData) {
    const session = await getFullUserSession()
    if (!session || (session.role !== "Superusuario" && session.role !== "Administrador")) {
        return { success: false, message: "No autorizado." }
    }

    const data = {
        id: formData.get("id"),
        name: formData.get("name"),
        clinicName: formData.get("clinicName"),
        effectiveDate: formData.get("effectiveDate"),
        procedures: JSON.parse((formData.get("procedures") as string) || "[]"),
    }

    const validatedFields = baremoSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación.",
        }
    }

    const { id, name, clinicName, effectiveDate, procedures } = validatedFields.data

    if (!id) {
        return { success: false, message: "ID de baremo no proporcionado." }
    }

    try {
        await pool.execute("UPDATE baremos SET name = ?, clinicName = ?, effectiveDate = ?, procedures = ? WHERE id = ?", [
            name,
            clinicName,
            effectiveDate,
            JSON.stringify(procedures),
            id,
        ])
        revalidatePath("/baremos")
        return { success: true, message: "Baremo actualizado exitosamente." }
    } catch (error) {
        console.error("Error updating baremo:", error)
        return { success: false, message: "Error al actualizar el baremo." }
    }
}

export async function deleteBaremo(baremoId: string) {
    const session = await getFullUserSession()
    if (!session || (session.role !== "Superusuario" && session.role !== "Administrador")) {
        return { success: false, message: "No autorizado." }
    }

    try {
        await pool.execute("DELETE FROM baremos WHERE id = ?", [baremoId])
        revalidatePath("/baremos")
        return { success: true, message: "Baremo eliminado exitosamente." }
    } catch (error) {
        console.error("Error deleting baremo:", error)
        return { success: false, message: "Error al eliminar el baremo." }
    }
}

export async function createPayment(prevState: any, formData: FormData) {
    const session = await getFullUserSession()
    if (!session) {
        return { success: false, message: "No autorizado." }
    }

    const data = {
        invoiceId: formData.get("invoiceId"),
        amount: formData.get("amount"),
        paymentDate: formData.get("paymentDate"),
        status: formData.get("status"),
        notes: formData.get("notes"),
    }

    const validatedFields = paymentSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación al crear el pago.",
        }
    }

    const { invoiceId, amount, paymentDate, status, notes } = validatedFields.data

    try {
        const id = uuidv4()
        await pool.execute(
            "INSERT INTO payments (id, invoiceId, amount, paymentDate, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
            [id, invoiceId, amount, paymentDate, status, notes],
        )

        // Update totalInvoiceAmount in cases table
        await pool.execute("UPDATE cases SET totalInvoiceAmount = totalInvoiceAmount + ? WHERE id = ?", [amount, invoiceId])

        revalidatePath(`/cases/${invoiceId}`)
        revalidatePath("/payments")
        revalidatePath("/invoices")
        return { success: true, message: "Pago registrado exitosamente." }
    } catch (error) {
        console.error("Error creating payment:", error)
        return { success: false, message: "Error al registrar el pago." }
    }
}

export async function updatePayment(prevState: any, formData: FormData) {
    const session = await getFullUserSession()
    if (!session) {
        return { success: false, message: "No autorizado." }
    }

    const data = {
        id: formData.get("id"),
        invoiceId: formData.get("invoiceId"),
        amount: formData.get("amount"),
        paymentDate: formData.get("paymentDate"),
        status: formData.get("status"),
        notes: formData.get("notes"),
    }

    const validatedFields = paymentSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error de validación al actualizar el pago.",
        }
    }

    const { id, invoiceId, amount, paymentDate, status, notes } = validatedFields.data

    if (!id) {
        return { success: false, message: "ID de pago no proporcionado." }
    }

    try {
        // Get old amount to adjust totalInvoiceAmount in cases table
        const [oldPaymentRows]: any = await pool.execute("SELECT amount FROM payments WHERE id = ?", [id])
        const oldAmount = oldPaymentRows[0]?.amount || 0

        await pool.execute(
            "UPDATE payments SET invoiceId = ?, amount = ?, paymentDate = ?, status = ?, notes = ? WHERE id = ?",
            [invoiceId, amount, paymentDate, status, notes, id],
        )

        // Adjust totalInvoiceAmount in cases table
        await pool.execute("UPDATE cases SET totalInvoiceAmount = totalInvoiceAmount - ? + ? WHERE id = ?", [
            oldAmount,
            amount,
            invoiceId,
        ])

        revalidatePath(`/cases/${invoiceId}`)
        revalidatePath("/payments")
        revalidatePath("/invoices")
        return { success: true, message: "Pago actualizado exitosamente." }
    } catch (error) {
        console.error("Error updating payment:", error)
        return { success: false, message: "Error al actualizar el pago." }
    }
}

export async function deletePayment(paymentId: string, invoiceId: string, amount: number) {
    const session = await getFullUserSession()
    if (!session || (session.role !== "Superusuario" && session.role !== "Administrador")) {
        return { success: false, message: "No autorizado." }
    }

    try {
        await pool.execute("DELETE FROM payments WHERE id = ?", [paymentId])

        // Deduct amount from totalInvoiceAmount in cases table
        await pool.execute("UPDATE cases SET totalInvoiceAmount = totalInvoiceAmount - ? WHERE id = ?", [amount, invoiceId])

        revalidatePath(`/cases/${invoiceId}`)
        revalidatePath("/payments")
        revalidatePath("/invoices")
        return { success: true, message: "Pago eliminado exitosamente." }
    } catch (error) {
        console.error("Error deleting payment:", error)
        return { success: false, message: "Error al eliminar el pago." }
    }
}

export async function logToastAction(toastDetails: {
    title: string
    description?: string
    variant?: "default" | "destructive" | null | undefined
    path: string
}) {
    try {
        console.log("Toast logged successfully:", toastDetails)
    } catch (error) {
        console.error("Error logging toast action:", error)
    }
}


export async function logoutAction() {
    await deleteSessionCookie()
    redirect("/login")
}