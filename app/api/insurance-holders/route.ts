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
        
        // Parámetros de paginación
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        // Consulta simplificada que funciona solo con la tabla insurance_holders
        let baseQuery = `
            SELECT h.*, 
                   h.insuranceCompany as clientName,
                   COALESCE(0, 0) as totalCases,
                   COALESCE(0, 0) as totalPatients
            FROM insurance_holders h
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
            baseQuery += " WHERE " + whereClauses.join(" AND ");
        }

        // Consulta para obtener el total de registros (sin paginación)
        let countQuery = `SELECT COUNT(*) as total FROM (${baseQuery}) as subquery`;
        const [countResult]: any = await pool.execute(countQuery, params);
        const totalRecords = countResult[0].total;

        // Consulta principal con paginación
        const paginatedQuery = `${baseQuery} ORDER BY h.name LIMIT ? OFFSET ?`;
        const paginatedParams = [...params, limit, offset];
        const [rows]: any = await pool.execute(paginatedQuery, paginatedParams);

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

        // Comentamos la inclusión de pacientes ya que no tenemos esas tablas
        // if (includePatients && holders.length > 0) {
        //     // Lógica para incluir pacientes cuando se implementen las tablas
        // }

        // Si la búsqueda era por un único registro, se devuelve solo ese objeto.
        if (id || ci || policyNumber) {
            if (holders.length > 0) {
                return NextResponse.json(holders[0]);
            }
            return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 });
        }

        // Si no, se devuelve el array paginado con metadatos de paginación.
        const totalPages = Math.ceil(totalRecords / limit);
        return NextResponse.json({
            data: holders,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching insurance holders:", error);
        return NextResponse.json({ error: "Failed to fetch insurance holders" }, { status: 500 });
    }
}


export async function POST(req: Request) {
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

        const [existingHolder]: any = await pool.execute("SELECT id FROM insurance_holders WHERE ci = ?", [ci]);
        if (existingHolder.length > 0) {
            return NextResponse.json({ error: "Ya existe un titular con esta cédula" }, { status: 400 });
        }

        // Como no tenemos la tabla clients, validamos que clientId no esté vacío
        if (!clientId || clientId.trim() === "") {
            return NextResponse.json({ error: "ClientId es requerido" }, { status: 400 });
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

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute(
                `INSERT INTO insurance_holders (id, ci, name, phone, otherPhone, fixedPhone, email, birthDate, age, gender, address, city, state, clientId, policyNumber, policyType, policyStatus, policyStartDate, policyEndDate, coverageType, maxCoverageAmount, usedCoverageAmount, emergencyContact, emergencyPhone, bloodType, allergies, medicalHistory, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                Object.values(newHolder)
            );
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const responseHolder = {
            ...newHolder,
            clientName: clientId, // Usamos clientId como nombre temporal
            insuranceCompany: clientId, // Usamos clientId como compañía temporal
        };

        return NextResponse.json(responseHolder, { status: 201 });

    } catch (error: any) {
        console.error("Error creating insurance holder:", error);
        return NextResponse.json({ error: error.message || "Failed to create insurance holder" }, { status: 500 });
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
            // Validamos que clientId no esté vacío
            if (!updates.clientId || updates.clientId.trim() === "") {
                return NextResponse.json({ error: "ClientId no puede estar vacío" }, { status: 400 });
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
            SELECT h.*, h.insuranceCompany AS clientName
            FROM insurance_holders h 
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

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // Comentamos la eliminación de relaciones ya que no tenemos esa tabla
            // await connection.execute("DELETE FROM holder_patient_relationships WHERE holderId = ?", [id]);

            const [result]: any = await connection.execute("DELETE FROM insurance_holders WHERE id = ?", [id]);

            if (result.affectedRows === 0) {
                throw new Error("Insurance holder not found");
            }
            
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        return NextResponse.json({ message: "Insurance holder deleted successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting insurance holder:", error);
        if (error.message === "Insurance holder not found") {
            return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Failed to delete insurance holder" }, { status: 500 });
    }
}
