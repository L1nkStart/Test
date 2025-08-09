import { NextResponse } from "next/server"
import type { RowDataPacket } from "mysql2"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

import pool from "@/lib/db"
import { getFullUserSession } from "@/lib/auth"

interface InsuranceHolder {
  id: string
  ci: string
  name: string
  phone: string
  otherPhone?: string | null
  fixedPhone?: string | null
  email?: string | null
  birthDate?: string | null
  age?: number | null
  gender?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  clientId?: string | null
  clientName?: string | null
  insuranceCompany?: string | null
  policyNumber?: string | null
  policyType?: string | null
  policyStatus?: string | null
  policyStartDate?: string | null
  policyEndDate?: string | null
  coverageType?: string | null
  maxCoverageAmount?: number | null
  usedCoverageAmount?: number | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
  bloodType?: string | null
  allergies?: string | null
  medicalHistory?: string | null
  isActive?: boolean
  // Los siguientes valores no existen en la tabla. Los dejamos opcionales para futuro.
  totalCases?: number | null
  totalPatients?: number | null
  patients?: any[]
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const s = url.searchParams

    // Legacy params
    const id = s.get("id")
    const ci = s.get("ci")
    const policyNumber = s.get("policyNumber")
    const includePatients = s.get("includePatients") === "true"
    const search = s.get("search") || ""

    // New paginated params
    const schema = z.object({
      page: z.coerce.number().int().positive().optional(),
      perPage: z.coerce.number().int().positive().max(50).optional(),
      q: z.string().optional(),
      status: z.string().optional(),
      company: z.string().optional(),
      sort: z.string().optional(), // e.g. "name.asc"
    })
    const parsed = schema.parse({
      page: s.get("page") ?? undefined,
      perPage: s.get("perPage") ?? undefined,
      q: s.get("q") ?? undefined,
      status: s.get("status") ?? undefined,
      company: s.get("company") ?? undefined,
      sort: s.get("sort") ?? undefined,
    })

    // Si hay búsqueda directa y no parámetros de paginación, devolver legacy (array o single)
    const isPaginated =
      parsed.page !== undefined ||
      parsed.perPage !== undefined ||
      parsed.q ||
      parsed.status ||
      parsed.company ||
      parsed.sort

    if (!isPaginated && (id || ci || policyNumber || search)) {
      const where: string[] = []
      const params: any[] = []
      if (id) {
        where.push("h.id = ?")
        params.push(id)
      }
      if (ci) {
        where.push("h.ci = ?")
        params.push(ci)
      }
      if (policyNumber) {
        where.push("h.policyNumber = ?")
        params.push(policyNumber)
      }
      if (search) {
        where.push("(h.name LIKE ? OR h.ci LIKE ? OR h.policyNumber LIKE ?)")
        const term = `%${search}%`
        params.push(term, term, term)
      }
      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

      const query = `
        SELECT h.*
        FROM insurance_holders h
        ${whereSql}
      `
      const [rows]: any = await pool.execute(query, params)

      const holders = (rows as any[]).map((row: any) => ({
        ...row,
        birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split("T")[0] : null,
        policyStartDate: row.policyStartDate ? new Date(row.policyStartDate).toISOString().split("T")[0] : null,
        policyEndDate: row.policyEndDate ? new Date(row.policyEndDate).toISOString().split("T")[0] : null,
        isActive: Boolean(row.isActive),
        maxCoverageAmount: row.maxCoverageAmount != null ? Number(row.maxCoverageAmount) : null,
        usedCoverageAmount: row.usedCoverageAmount != null ? Number(row.usedCoverageAmount) : 0,
      })) as InsuranceHolder[]

      if (id || ci || policyNumber) {
        if (holders.length > 0) return NextResponse.json(holders[0])
        return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 })
      }

      // Legacy list (array). includePatients se mantiene solo si existen esas tablas.
      if (!includePatients) return NextResponse.json(holders)

      if (holders.length > 0) {
        const holderIds = holders.map((h) => h.id)
        // Si no tienes estas tablas, puedes comentar este bloque.
        const [patientRelations]: any = await pool.execute(
          `
            SELECT p.*, r.holderId, r.relationshipType, r.isPrimary
            FROM patients p
            JOIN holder_patient_relationships r ON p.id = r.patientId
            WHERE r.holderId IN (?)
          `,
          [holderIds],
        )
        const patientsByHolderId = (patientRelations as any[]).reduce((acc: any, p: any) => {
          if (!acc[p.holderId]) acc[p.holderId] = []
          acc[p.holderId].push({
            ...p,
            birthDate: p.birthDate ? new Date(p.birthDate).toISOString().split("T")[0] : null,
            isActive: Boolean(p.isActive),
            isPrimary: Boolean(p.isPrimary),
          })
          return acc
        }, {})
        holders.forEach((h) => {
          h.patients = patientsByHolderId[h.id] || []
        })
      }
      return NextResponse.json(holders)
    }

    // Respuesta paginada (recomendada para la UI)
    const page = Number(parsed.page ?? 1)
    const perPage = Number(parsed.perPage ?? 10)
    const q = (parsed.q ?? "").trim()
    const status = (parsed.status ?? "").trim()
    const company = (parsed.company ?? "").trim()
    const sort = (parsed.sort ?? "name.asc").trim()

    const where: string[] = []
    const params: any[] = []
    if (q) {
      where.push("(h.name LIKE ? OR h.ci LIKE ? OR h.phone LIKE ? OR h.email LIKE ? OR h.policyNumber LIKE ?)")
      const sTerm = `%${q}%`
      params.push(sTerm, sTerm, sTerm, sTerm, sTerm)
    }
    if (status) {
      where.push("h.policyStatus = ?")
      params.push(status)
    }
    if (company) {
      where.push("h.insuranceCompany = ?")
      params.push(company)
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

    const sortMap: Record<string, string> = {
      "name.asc": "h.name ASC",
      "name.desc": "h.name DESC",
      "policyStatus.asc": "h.policyStatus ASC",
      "policyStatus.desc": "h.policyStatus DESC",
    }
    const orderSql = `ORDER BY ${sortMap[sort] || sortMap["name.asc"]}`
    const offset = (page - 1) * perPage

    const [countRowsRaw] = await pool.query(`SELECT COUNT(*) as cnt FROM insurance_holders h ${whereSql}`, params)
    const countRows = countRowsRaw as RowDataPacket[]
    const total = Number(countRows[0]?.cnt || 0)

    const [rowsRaw] = await pool.query(
      `
        SELECT
          h.id, h.ci, h.name, h.phone, h.email,
          h.policyNumber, h.policyType, h.policyStatus,
          h.insuranceCompany,
          h.coverageType, h.maxCoverageAmount, h.usedCoverageAmount,
          h.isActive
        FROM insurance_holders h
        ${whereSql}
        ${orderSql}
        LIMIT ? OFFSET ?
      `,
      [...params, perPage, offset],
    )
    const rows = rowsRaw as RowDataPacket[]

    const [activeRowsRaw] = await pool.query(
      `SELECT COUNT(*) as cnt FROM insurance_holders h ${where.length ? whereSql + " AND" : "WHERE"} h.policyStatus = 'Activo'`,
      params,
    )
    const activeRows = activeRowsRaw as RowDataPacket[]

    // No existen columnas totalPatients/totalCases en tu DB actual; devolvemos 0.
    return NextResponse.json({
      items: rows,
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      stats: {
        activePolicies: Number(activeRows[0]?.cnt || 0),
        totalPatients: 0,
        totalCases: 0,
      },
    })
  } catch (error) {
    console.error("GET /api/insurance-holders error:", error)
    return NextResponse.json({ error: "Failed to fetch insurance holders" }, { status: 500 })
  }
}

// POST/PUT/DELETE se mantienen igual que antes (usan tablas relacionadas si existen).
export async function POST(req: Request) {
  const connection = await pool.getConnection()
  try {
    const session = await getFullUserSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      ci,
      name,
      phone,
      otherPhone,
      fixedPhone,
      email,
      birthDate,
      age,
      gender,
      address,
      city,
      state,
      clientId,
      policyNumber,
      policyType,
      policyStatus,
      policyStartDate,
      policyEndDate,
      coverageType,
      maxCoverageAmount,
      emergencyContact,
      emergencyPhone,
      bloodType,
      allergies,
      medicalHistory,
      createAsPatient = true,
    } = await req.json()

    if (!ci || !name || !phone /* clientId puede ser null en tu esquema */) {
      return NextResponse.json({ error: "Campos requeridos faltantes: ci, name, phone" }, { status: 400 })
    }

    await connection.beginTransaction()

    const id = uuidv4()
    await connection.execute(
      `INSERT INTO insurance_holders (id, ci, name, phone, otherPhone, fixedPhone, email, birthDate, age, gender, address, city, state, clientId, policyNumber, policyType, policyStatus, policyStartDate, policyEndDate, coverageType, maxCoverageAmount, usedCoverageAmount, emergencyContact, emergencyPhone, bloodType, allergies, medicalHistory, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ci,
        name,
        phone,
        otherPhone || null,
        fixedPhone || null,
        email || null,
        birthDate || null,
        age ?? null,
        gender || null,
        address || null,
        city || null,
        state || null,
        clientId || null,
        policyNumber || null,
        policyType || "Individual",
        policyStatus || "Activo",
        policyStartDate || null,
        policyEndDate || null,
        coverageType || null,
        maxCoverageAmount != null ? Number(maxCoverageAmount) : null,
        0,
        emergencyContact || null,
        emergencyPhone || null,
        bloodType || null,
        allergies || null,
        medicalHistory || null,
        1,
      ],
    )

    // Si tienes tablas de pacientes/relaciones, aquí iría la lógica opcional.
    await connection.commit()

    return NextResponse.json({ id, ci, name }, { status: 201 })
  } catch (error) {
    await (connection as any).rollback()
    console.error("Error creating insurance holder:", error)
    return NextResponse.json({ error: "Failed to create insurance holder" }, { status: 500 })
  } finally {
    connection.release()
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getFullUserSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const updates = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Insurance holder ID is required" }, { status: 400 })
    }
    delete updates.id

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const updateFields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ")
    const values = [...Object.values(updates), id]

    const [result]: any = await pool.execute(`UPDATE insurance_holders SET ${updateFields} WHERE id = ?`, values)
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 })
    }

    const [updatedRows]: any = await pool.execute(`SELECT * FROM insurance_holders WHERE id = ?`, [id])
    const row = (updatedRows as any[])[0]
    const holder: InsuranceHolder = {
      ...row,
      birthDate: row.birthDate ? new Date(row.birthDate).toISOString().split("T")[0] : null,
      policyStartDate: row.policyStartDate ? new Date(row.policyStartDate).toISOString().split("T")[0] : null,
      policyEndDate: row.policyEndDate ? new Date(row.policyEndDate).toISOString().split("T")[0] : null,
      isActive: Boolean(row.isActive),
      maxCoverageAmount: row.maxCoverageAmount != null ? Number(row.maxCoverageAmount) : null,
      usedCoverageAmount: row.usedCoverageAmount != null ? Number(row.usedCoverageAmount) : 0,
    }
    return NextResponse.json(holder)
  } catch (error) {
    console.error("Error updating insurance holder:", error)
    return NextResponse.json({ error: "Failed to update insurance holder" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const connection = await pool.getConnection()
  try {
    const session = await getFullUserSession()
    if (!session || (session.role !== "Superusuario" && session.role !== "Coordinador Regional")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Insurance holder ID is required" }, { status: 400 })
    }

    await connection.beginTransaction()
    await connection.execute("DELETE FROM holder_patient_relationships WHERE holderId = ?", [id]).catch(() => {})
    const [result]: any = await connection.execute("DELETE FROM insurance_holders WHERE id = ?", [id])
    if (result.affectedRows === 0) {
      await connection.rollback()
      return NextResponse.json({ error: "Insurance holder not found" }, { status: 404 })
    }
    await connection.commit()
    return NextResponse.json({ message: "Insurance holder deleted successfully" }, { status: 200 })
  } catch (error) {
    await (connection as any).rollback()
    console.error("Error deleting insurance holder:", error)
    return NextResponse.json({ error: "Failed to delete insurance holder" }, { status: 500 })
  } finally {
    connection.release()
  }
}
