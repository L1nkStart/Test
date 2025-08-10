import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");

        let whereClause = "WHERE isActive = 1";
        let params: any[] = [];

        if (search) {
            whereClause += ` AND (
                name LIKE ? OR 
                ci LIKE ? OR 
                phone LIKE ? OR 
                email LIKE ? OR 
                policyNumber LIKE ? OR
                insuranceCompany LIKE ?
            )`;
            const searchPattern = `%${search}%`;
            params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
        }

        // Consultas optimizadas para obtener estadísticas con filtro opcional
        const [totalHoldersResult]: any = await pool.execute(
            `SELECT COUNT(*) as total FROM insurance_holders ${whereClause}`,
            params
        );
        
        const [activePoliciesResult]: any = await pool.execute(
            `SELECT COUNT(*) as total FROM insurance_holders ${whereClause} AND policyStatus = 'Activo'`,
            params
        );
        
        // Como no tenemos las tablas patients y cases, usamos valores por defecto
        const stats = {
            totalHolders: totalHoldersResult[0].total,
            activePolicies: activePoliciesResult[0].total,
            totalPatients: 0, // Valor por defecto hasta que se implementen las otras tablas
            totalCases: 0     // Valor por defecto hasta que se implementen las otras tablas
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
