import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/db";
import { getFullUserSession } from "@/lib/auth";

// Interfaz actualizada para reflejar los datos que realmente se devuelven
interface InsuranceHolder {
    id: string;
    ci: string;
    name: string;
    phone: string;
    otherPhone?: string | null;
    fixedPhone?: string | null;
    email?: string | null;
    birthDate?: string | null;
    age?: number | null;
    gender?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    clientId?: string | null;
    clientName?: string; // Campo añadido para el nombre del cliente/aseguradora
    insuranceCompany?: string; // Campo añadido para la compañía de seguros del cliente
    policyNumber?: string | null;
    policyType?: string | null;
    policyStatus?: string | null;
    policyStartDate?: string | null;
    policyEndDate?: string | null;
    coverageType?: string | null;
    maxCoverageAmount?: number | null;
    usedCoverageAmount?: number;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    bloodType?: string | null;
    allergies?: string | null;
    medicalHistory?: string | null;
    isActive?: boolean;
    totalCases?: number; // Campo añadido para el conteo de casos
    totalPatients?: number; // Campo añadido para el conteo de pacientes
    patients?: any[]; // Array opcional para los pacientes relacionados
}

/**
 * Función GET optimizada para obtener titulares de seguros.
 * - Construye la consulta dinámicamente para filtrar en la BD.
 * - Utiliza JOINs para obtener datos relacionados de forma eficiente.
 * - Evita el problema N+1 al buscar pacientes.
 */
export async function GET(req: Request) {
    try {
        // Descomenta estas líneas para activar la autenticación
        // const session = await getFullUserSession();
        // if (!session) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const ci = searchParams.get("ci");
        const search = searchParams.get("search");
        const policyNumber = searchParams.get("policyNumber");
        const includePatients = searchParams.get("includePatients") === "true";

        // Se utiliza LEFT JOIN para obtener el nombre del cliente/aseguradora y contar casos/pacientes asociados.
        // Esto es mucho más eficiente que hacer múltiples consultas.
        let query = `
            SELECT * FROM insurance_holders 
        `;

        const params: any[] = [];
        const whereClauses: string[] = [];

        if (id) {
            whereClauses.push("h.id = ?");
            params.push(id);
        }
        if (ci) {
            whereClauses.push("h.ci = ?");
            params.push(ci);
        }
        if (policyNumber) {
            whereClauses.push("h.policyNumber = ?");
            params.push(policyNumber);
        }
        if (search) {
            whereClauses.push("(h.name LIKE ? OR h.ci LIKE ? OR h.policyNumber LIKE ?)");
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (whereClauses.length > 0) {
            query += " WHERE " + whereClauses.join(" AND ");
        }


        const [rows]: any = await pool.execute(query);

        // La función de mapeo transforma los datos crudos de la BD al formato esperado por el frontend.
        const holders: InsuranceHolder[] = rows.map((row: any) => ({
            ...row,
            birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split("T")[0] : null,
            policyStartDate: row.policyStartDate ? new Date(row.policyStartDate).toISOString().split("T")[0] : null,
            policyEndDate: row.policyEndDate ? new Date(row.policyEndDate).toISOString().split("T")[0] : null,
            isActive: Boolean(row.isActive),
            maxCoverageAmount: row.maxCoverageAmount ? Number(row.maxCoverageAmount) : null,
            usedCoverageAmount: row.usedCoverageAmount ? Number(row.usedCoverageAmount) : 0,
            totalCases: Number(row.totalCases || 0),
            totalPatients: Number(row.totalPatients || 0),
        }));

        // Si se solicita incluir pacientes, se hace una segunda consulta eficiente
        // usando los IDs de los titulares ya obtenidos.
        if (includePatients && holders.length > 0) {
            const holderIds = holders.map(h => h.id);
            const [patientRelations]: any = await pool.execute(
                `
                SELECT 
                    p.*, 
                    r.holderId, 
                    r.relationshipType, 
                    r.isPrimary
                FROM 
                    patients p
                JOIN 
                    holder_patient_relationships r ON p.id = r.patientId
                WHERE 
                    r.holderId IN (?)
                `,
                [holderIds]
            );

            const patientsByHolderId = patientRelations.reduce((acc: any, patient: any) => {
                if (!acc[patient.holderId]) {
                    acc[patient.holderId] = [];
                }
                acc[patient.holderId].push({
                    ...patient,
                    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().split("T")[0] : null,
                    isActive: Boolean(patient.isActive),
                    isPrimary: Boolean(patient.isPrimary),
                });
                return acc;
            }, {});

            holders.forEach(holder => {
                holder.patients = patientsByHolderId[holder.id] || [];
            });
        }

        // Si la búsqueda era por un único registro, se devuelve solo ese objeto.
        if (id || ci || policyNumber) {
            if (holders.length > 0) {
                return NextResponse.json(holders[0]);
            }
            return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 });
        }

        // Si no, se devuelve el array completo de resultados.
        return NextResponse.json(holders);
    } catch (error) {
        console.error("Error fetching insurance holders:", error);
        return NextResponse.json({ error: "Failed to fetch insurance holders" }, { status: 500 });
    }
}


export async function POST(req: Request) {
    const connection = await pool.getConnection(); // Obtener conexión para la transacción
    try {
        const session = await getFullUserSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            ci, name, phone, otherPhone, fixedPhone, email, birthDate, age, gender,
            address, city, state, clientId, policyNumber, policyType, policyStatus,
            policyStartDate, policyEndDate, coverageType, maxCoverageAmount,
            emergencyContact, emergencyPhone, bloodType, allergies, medicalHistory,
            createAsPatient = true, // Por defecto, se crea también como paciente
        } = await req.json();

        if (!ci || !name || !phone || !clientId) {
            return NextResponse.json({ error: "Campos requeridos faltantes: ci, name, phone, clientId" }, { status: 400 });
        }

        const [existingHolder]: any = await connection.execute("SELECT id FROM insurance_holders WHERE ci = ?", [ci]);
        if (existingHolder.length > 0) {
            return NextResponse.json({ error: "Ya existe un titular con esta cédula" }, { status: 400 });
        }

        const [clientExists]: any = await connection.execute("SELECT id, name, insuranceCompany FROM clients WHERE id = ?", [clientId]);
        if (clientExists.length === 0) {
            return NextResponse.json({ error: "Cliente/Aseguradora no encontrada" }, { status: 400 });
        }

        const newHolder: Omit<InsuranceHolder, 'clientName' | 'insuranceCompany'> = {
            id: uuidv4(),
            ci, name, phone,
            otherPhone: otherPhone || null,
            fixedPhone: fixedPhone || null,
            email: email || null,
            birthDate: birthDate || null,
            age: age ? Number(age) : null,
            gender: gender || null,
            address: address || null,
            city: city || null,
            state: state || null,
            clientId,
            policyNumber: policyNumber || null,
            policyType: policyType || "Individual",
            policyStatus: policyStatus || "Activo",
            policyStartDate: policyStartDate || null,
            policyEndDate: policyEndDate || null,
            coverageType: coverageType || null,
            maxCoverageAmount: maxCoverageAmount ? Number(maxCoverageAmount) : null,
            usedCoverageAmount: 0,
            emergencyContact: emergencyContact || null,
            emergencyPhone: emergencyPhone || null,
            bloodType: bloodType || null,
            allergies: allergies || null,
            medicalHistory: medicalHistory || null,
            isActive: true,
        };

        await connection.beginTransaction(); // Iniciar transacción

        await connection.execute(
            `INSERT INTO insurance_holders (id, ci, name, phone, otherPhone, fixedPhone, email, birthDate, age, gender, address, city, state, clientId, policyNumber, policyType, policyStatus, policyStartDate, policyEndDate, coverageType, maxCoverageAmount, usedCoverageAmount, emergencyContact, emergencyPhone, bloodType, allergies, medicalHistory, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            Object.values(newHolder)
        );

        if (createAsPatient) {
            const [existingPatient]: any = await connection.execute("SELECT id FROM patients WHERE ci = ?", [ci]);
            let patientId: string;

            if (existingPatient.length > 0) {
                patientId = existingPatient[0].id;
                await connection.execute("UPDATE patients SET primaryInsuranceHolderId = ? WHERE id = ?", [newHolder.id, patientId]);
            } else {
                patientId = uuidv4();
                await connection.execute(
                    `INSERT INTO patients (id, ci, name, phone, otherPhone, fixedPhone, email, birthDate, age, gender, address, city, state, emergencyContact, emergencyPhone, bloodType, allergies, medicalHistory, primaryInsuranceHolderId, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [patientId, newHolder.ci, newHolder.name, newHolder.phone, newHolder.otherPhone, newHolder.fixedPhone, newHolder.email, newHolder.birthDate, newHolder.age, newHolder.gender, newHolder.address, newHolder.city, newHolder.state, newHolder.emergencyContact, newHolder.emergencyPhone, newHolder.bloodType, newHolder.allergies, newHolder.medicalHistory, newHolder.id, true]
                );
            }

            const relationshipId = uuidv4();
            await connection.execute(
                `INSERT INTO holder_patient_relationships (id, holderId, patientId, relationshipType, isPrimary, isActive) VALUES (?, ?, ?, ?, ?, ?)`,
                [relationshipId, newHolder.id, patientId, "Titular", true, true]
            );
        }

        await connection.commit(); // Confirmar transacción

        const responseHolder = {
            ...newHolder,
            clientName: clientExists[0].name,
            insuranceCompany: clientExists[0].insuranceCompany,
        };

        return NextResponse.json(responseHolder, { status: 201 });

    } catch (error) {
        await connection.rollback(); // Revertir transacción en caso de error
        console.error("Error creating insurance holder:", error);
        return NextResponse.json({ error: "Failed to create insurance holder" }, { status: 500 });
    } finally {
        connection.release(); // Liberar la conexión al final
    }
}


export async function PUT(req: Request) {
    try {
        const session = await getFullUserSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const updates = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Insurance holder ID is required" }, { status: 400 });
        }

        delete updates.id; // Asegurarse de no intentar actualizar el ID

        if (updates.ci) {
            const [existingHolder]: any = await pool.execute("SELECT id FROM insurance_holders WHERE ci = ? AND id != ?", [updates.ci, id]);
            if (existingHolder.length > 0) {
                return NextResponse.json({ error: "Ya existe otro titular con esta cédula" }, { status: 400 });
            }
        }

        if (updates.clientId) {
            const [clientExists]: any = await pool.execute("SELECT id FROM clients WHERE id = ?", [updates.clientId]);
            if (clientExists.length === 0) {
                return NextResponse.json({ error: "Cliente/Aseguradora no encontrada" }, { status: 400 });
            }
        }

        const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
        const values = [...Object.values(updates), id];

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const [result]: any = await pool.execute(`UPDATE insurance_holders SET ${updateFields} WHERE id = ?`, values);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 });
        }

        // Re-utilizamos la lógica de GET para devolver el titular actualizado y completo
        const [updatedRows]: any = await pool.execute(
            `
            SELECT h.*, c.name AS clientName, c.insuranceCompany 
            FROM insurance_holders h 
            LEFT JOIN clients c ON h.clientId = c.id 
            WHERE h.id = ?
            `,
            [id]
        );

        const updatedHolder = {
            ...updatedRows[0],
            birthDate: updatedRows[0].birthDate ? new Date(updatedRows[0].birthDate).toISOString().split("T")[0] : null,
            policyStartDate: updatedRows[0].policyStartDate ? new Date(updatedRows[0].policyStartDate).toISOString().split("T")[0] : null,
            policyEndDate: updatedRows[0].policyEndDate ? new Date(updatedRows[0].policyEndDate).toISOString().split("T")[0] : null,
            isActive: Boolean(updatedRows[0].isActive),
            maxCoverageAmount: updatedRows[0].maxCoverageAmount ? Number(updatedRows[0].maxCoverageAmount) : null,
            usedCoverageAmount: updatedRows[0].usedCoverageAmount ? Number(updatedRows[0].usedCoverageAmount) : 0,
        };

        return NextResponse.json(updatedHolder);
    } catch (error) {
        console.error("Error updating insurance holder:", error);
        return NextResponse.json({ error: "Failed to update insurance holder" }, { status: 500 });
    }
}


export async function DELETE(req: Request) {
    const connection = await pool.getConnection();
    try {
        const session = await getFullUserSession();
        if (!session || (session.role !== "Superusuario" && session.role !== "Coordinador Regional")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Insurance holder ID is required" }, { status: 400 });
        }

        await connection.beginTransaction();


        // Eliminar relaciones antes de eliminar el titular para evitar errores de FK
        await connection.execute("DELETE FROM holder_patient_relationships WHERE holderId = ?", [id]);

        const [result]: any = await connection.execute("DELETE FROM insurance_holders WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 });
        }

        await connection.commit();
        return NextResponse.json({ message: "Insurance holder deleted successfully" }, { status: 200 });
    } catch (error) {
        await connection.rollback();
        console.error("Error deleting insurance holder:", error);
        return NextResponse.json({ error: "Failed to delete insurance holder" }, { status: 500 });
    } finally {
        connection.release();
    }
}
