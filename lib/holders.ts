import type { RowDataPacket } from "mysql2"

type Query = {
  page: number
  perPage: number
  q?: string
  status?: string
  company?: string
  sort?: string // "name.asc" | "name.desc" | "policyStatus.asc" | "policyStatus.desc"
}

export type InsuranceHolder = {
  id: string
  ci: string
  name: string
  phone: string
  email?: string | null
  policyNumber?: string | null
  policyType?: string | null
  policyStatus?: string | null
  insuranceCompany?: string | null
  coverageType?: string | null
  maxCoverageAmount?: number | null
  usedCoverageAmount?: number | null
  // No existen en tu tabla actual; quedan opcionales.
  totalPatients?: number | null
  totalCases?: number | null
  isActive?: number | boolean | null
}

export async function getInsuranceHoldersPage(query: Query) {
  const { page, perPage } = query
  const offset = (page - 1) * perPage

  const pool = await lazyPool()

  if (!pool) {
    const mock = mockHolders(37)
    const filtered = mockFilterSort(mock, query)
    const total = filtered.length
    const items = filtered.slice(offset, offset + perPage)
    const stats = {
      activePolicies: filtered.filter((h) => (h.policyStatus || "").toLowerCase() === "activo").length,
      totalPatients: 0,
      totalCases: 0,
    }
    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
      stats,
    }
  }

  const where: string[] = []
  const params: any[] = []

  if (query.q) {
    where.push(`(name LIKE ? OR ci LIKE ? OR phone LIKE ? OR email LIKE ? OR policyNumber LIKE ?)`)
    const s = `%${query.q}%`
    params.push(s, s, s, s, s)
  }
  if (query.status) {
    where.push(`policyStatus = ?`)
    params.push(query.status)
  }
  if (query.company) {
    where.push(`insuranceCompany = ?`)
    params.push(query.company)
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

  const sortMap: Record<string, string> = {
    "name.asc": "name ASC",
    "name.desc": "name DESC",
    "policyStatus.asc": "policyStatus ASC",
    "policyStatus.desc": "policyStatus DESC",
  }
  const orderSql = `ORDER BY ${sortMap[query.sort || "name.asc"] || sortMap["name.asc"]}`

  const [countRowsRaw] = await pool.query(`SELECT COUNT(*) as cnt FROM insurance_holders ${whereSql}`, params)
  const countRows = countRowsRaw as RowDataPacket[]
  const total = Number(countRows[0]?.cnt || 0)

  const dataSql = `
    SELECT
      id, ci, name, phone, email,
      policyNumber, policyType, policyStatus,
      insuranceCompany,
      coverageType, maxCoverageAmount, usedCoverageAmount,
      isActive
    FROM insurance_holders
    ${whereSql}
    ${orderSql}
    LIMIT ? OFFSET ?
  `
  const dataParams = [...params, perPage, offset]
  const [rowsRaw] = await pool.query(dataSql, dataParams)
  const rows = rowsRaw as RowDataPacket[]

  const [activeRowsRaw] = await pool.query(
    `SELECT COUNT(*) as cnt FROM insurance_holders ${where.length ? whereSql + " AND" : "WHERE"} policyStatus = 'Activo'`,
    params,
  )
  const activeRows = activeRowsRaw as RowDataPacket[]

  const items = rows as unknown as InsuranceHolder[]
  const stats = {
    activePolicies: Number(activeRows[0]?.cnt || 0),
    totalPatients: 0,
    totalCases: 0,
  }

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    stats,
  }
}

// NUEVO: compañías dinámicas para el filtro
export async function getDistinctCompanies(): Promise<string[]> {
  const pool = await lazyPool()
  if (!pool) {
    return ["Seguros Caracas", "Mapfre", "Mercantil", "Banesco Seguros"]
  }
  const [rows] = await pool.query(
    `SELECT DISTINCT insuranceCompany AS name
     FROM insurance_holders
     WHERE insuranceCompany IS NOT NULL AND insuranceCompany <> ''
     ORDER BY insuranceCompany ASC`,
  )
  const out = (rows as RowDataPacket[]).map((r) => (r as any).name as string).filter(Boolean)
  return out
}

// NUEVO: resumen ampliado para el dashboard
export type HoldersSummary = {
  totals: {
    holders: number
    activePolicies: number
    created7d: number
    updated7d: number
  }
  coverage: {
    totalMax: number
    totalUsed: number
  }
  statusDistribution: Array<{ status: string; count: number }>
  topCompanies: Array<{ name: string; count: number }>
  expiringSoon: Array<{
    id: string
    name: string
    ci: string
    insuranceCompany: string | null
    policyNumber: string | null
    policyEndDate: string | null
    daysLeft: number | null
  }>
  recent: Array<{
    id: string
    ci: string
    name: string
    phone: string
    email: string | null
    policyNumber: string | null
    insuranceCompany: string | null
    policyStatus: string | null
    coverageType: string | null
    maxCoverageAmount: number | null
    usedCoverageAmount: number | null
    created_at?: string | null
    updated_at?: string | null
  }>
}

export async function getInsuranceHoldersSummary(): Promise<HoldersSummary> {
  const pool = await lazyPool()
  if (!pool) {
    const mock = mockHolders(37)
    const totals = {
      holders: mock.length,
      activePolicies: mock.filter((h) => (h.policyStatus || "").toLowerCase() === "activo").length,
      created7d: 7, // mock
      updated7d: 12, // mock
    }
    const coverage = {
      totalMax: mock.reduce((s, h) => s + Number(h.maxCoverageAmount || 0), 0),
      totalUsed: mock.reduce((s, h) => s + Number(h.usedCoverageAmount || 0), 0),
    }
    const statusMap = new Map<string, number>()
    for (const h of mock) {
      const key = (h.policyStatus || "—") as string
      statusMap.set(key, (statusMap.get(key) || 0) + 1)
    }
    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }))

    const companyCount = new Map<string, number>()
    for (const h of mock) {
      const name = h.insuranceCompany || "—"
      companyCount.set(name, (companyCount.get(name) || 0) + 1)
    }
    const topCompanies = Array.from(companyCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const today = new Date()
    const soon = new Date()
    soon.setDate(today.getDate() + 30)
    const expiringSoon = mock.slice(0, 5).map((h) => ({
      id: h.id,
      name: h.name,
      ci: h.ci,
      insuranceCompany: h.insuranceCompany || null,
      policyNumber: h.policyNumber || null,
      policyEndDate: null,
      daysLeft: null,
    }))

    const recent = mock.slice(-8).map((h) => ({
      id: h.id,
      ci: h.ci,
      name: h.name,
      phone: h.phone,
      email: h.email || null,
      policyNumber: h.policyNumber || null,
      insuranceCompany: h.insuranceCompany || null,
      policyStatus: h.policyStatus || null,
      coverageType: h.coverageType || null,
      maxCoverageAmount: h.maxCoverageAmount || null,
      usedCoverageAmount: h.usedCoverageAmount || null,
      created_at: null,
      updated_at: null,
    }))

    return { totals, coverage, statusDistribution, topCompanies, expiringSoon, recent }
  }

  // DB-backed summary
  const [countRowsRaw] = await pool.query(`SELECT COUNT(*) AS holders FROM insurance_holders`)
  const [activeRowsRaw] = await pool.query(
    `SELECT COUNT(*) AS activePolicies FROM insurance_holders WHERE policyStatus = 'Activo'`,
  )
  const [created7dRaw] = await pool.query(
    `SELECT COUNT(*) AS created7d FROM insurance_holders WHERE created_at >= (CURRENT_DATE - INTERVAL 7 DAY)`,
  )
  const [updated7dRaw] = await pool.query(
    `SELECT COUNT(*) AS updated7d FROM insurance_holders WHERE updated_at >= (CURRENT_DATE - INTERVAL 7 DAY)`,
  )
  const countRows = countRowsRaw as RowDataPacket[]
  const activeRows = activeRowsRaw as RowDataPacket[]
  const created7dRows = created7dRaw as RowDataPacket[]
  const updated7dRows = updated7dRaw as RowDataPacket[]

  const [coverageRowsRaw] = await pool.query(
    `SELECT 
       COALESCE(SUM(maxCoverageAmount), 0) AS totalMax,
       COALESCE(SUM(usedCoverageAmount), 0) AS totalUsed
     FROM insurance_holders`,
  )
  const coverageRows = coverageRowsRaw as RowDataPacket[]

  const [statusRaw] = await pool.query(
    `SELECT policyStatus AS status, COUNT(*) AS count
     FROM insurance_holders
     GROUP BY policyStatus
     ORDER BY count DESC`,
  )
  const statusRows = statusRaw as RowDataPacket[]

  const [topCompaniesRaw] = await pool.query(
    `SELECT insuranceCompany AS name, COUNT(*) AS count
     FROM insurance_holders
     WHERE insuranceCompany IS NOT NULL AND insuranceCompany <> ''
     GROUP BY insuranceCompany
     ORDER BY COUNT(*) DESC
     LIMIT 5`,
  )
  const topCompaniesRows = topCompaniesRaw as RowDataPacket[]

  const [expiringRaw] = await pool.query(
    `SELECT id, name, ci, insuranceCompany, policyNumber, policyEndDate,
            DATEDIFF(policyEndDate, CURRENT_DATE) AS daysLeft
     FROM insurance_holders
     WHERE policyEndDate IS NOT NULL
       AND policyEndDate >= CURRENT_DATE
       AND policyEndDate <= (CURRENT_DATE + INTERVAL 30 DAY)
     ORDER BY policyEndDate ASC
     LIMIT 10`,
  )
  const expiringRows = expiringRaw as RowDataPacket[]

  const [recentRaw] = await pool.query(
    `SELECT 
       id, ci, name, phone, email, policyNumber, insuranceCompany, policyStatus, coverageType,
       maxCoverageAmount, usedCoverageAmount, created_at, updated_at
     FROM insurance_holders
     ORDER BY updated_at DESC, created_at DESC
     LIMIT 8`,
  )
  const recentRows = recentRaw as RowDataPacket[]

  return {
    totals: {
      holders: Number(countRows[0]?.holders || 0),
      activePolicies: Number(activeRows[0]?.activePolicies || 0),
      created7d: Number(created7dRows[0]?.created7d || 0),
      updated7d: Number(updated7dRows[0]?.updated7d || 0),
    },
    coverage: {
      totalMax: Number(coverageRows[0]?.totalMax || 0),
      totalUsed: Number(coverageRows[0]?.totalUsed || 0),
    },
    statusDistribution: (statusRows as any[]).map((r) => ({
      status: r.status ?? "—",
      count: Number(r.count || 0),
    })),
    topCompanies: (topCompaniesRows as any[]).map((r) => ({ name: r.name as string, count: Number(r.count || 0) })),
    expiringSoon: (expiringRows as any[]).map((r) => ({
      id: r.id,
      name: r.name,
      ci: r.ci,
      insuranceCompany: r.insuranceCompany ?? null,
      policyNumber: r.policyNumber ?? null,
      policyEndDate: r.policyEndDate ? new Date(r.policyEndDate).toISOString() : null,
      daysLeft: r.daysLeft != null ? Number(r.daysLeft) : null,
    })),
    recent: (recentRows as any[]).map((r) => ({
      ...r,
      email: r.email ?? null,
      policyNumber: r.policyNumber ?? null,
      insuranceCompany: r.insuranceCompany ?? null,
      policyStatus: r.policyStatus ?? null,
      coverageType: r.coverageType ?? null,
      maxCoverageAmount: r.maxCoverageAmount != null ? Number(r.maxCoverageAmount) : null,
      usedCoverageAmount: r.usedCoverageAmount != null ? Number(r.usedCoverageAmount) : null,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : null,
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : null,
    })),
  }
}

async function lazyPool() {
  try {
    const mod: any = await import("@/lib/db")
    return mod.default || mod.pool || mod
  } catch {
    return null
  }
}

function mockHolders(n: number): InsuranceHolder[] {
  const companies = ["Seguros Caracas", "Mapfre", "Mercantil", "Banesco Seguros"]
  const statuses = ["Activo", "Suspendido", "Vencido", "Cancelado"]
  return Array.from({ length: n }).map((_, i) => {
    const max = 5000 + ((i * 127) % 7000)
    const used = Math.floor((max * ((i * 37) % 100)) / 100)
    return {
      id: `mock-${i + 1}`,
      ci: `V-${10000000 + i}`,
      name: `Titular ${i + 1}`,
      phone: `0414-000-00${(i % 10).toString().padStart(2, "0")}`,
      email: i % 3 === 0 ? `titular${i + 1}@mail.com` : null,
      policyNumber: `POL-${(1000 + i).toString().padStart(5, "0")}`,
      policyType: i % 2 === 0 ? "Individual" : "Familiar",
      policyStatus: statuses[i % statuses.length],
      insuranceCompany: companies[i % companies.length],
      coverageType: i % 2 === 0 ? "Básico" : "Premium",
      maxCoverageAmount: max,
      usedCoverageAmount: used,
      isActive: i % 4 !== 3,
    }
  })
}

function mockFilterSort(items: InsuranceHolder[], q: Query) {
  let out = items
  if (q.q) {
    const s = q.q.toLowerCase()
    out = out.filter(
      (h) =>
        h.name.toLowerCase().includes(s) ||
        h.ci.toLowerCase().includes(s) ||
        h.phone.toLowerCase().includes(s) ||
        (h.email || "").toLowerCase().includes(s) ||
        (h.policyNumber || "").toLowerCase().includes(s),
    )
  }
  if (q.status) {
    out = out.filter((h) => (h.policyStatus || "") === q.status)
  }
  if (q.company) {
    out = out.filter((h) => (h.insuranceCompany || "") === q.company)
  }
  const [key, dir] = (q.sort || "name.asc").split(".")
  out = out.sort((a: any, b: any) => {
    const av = (a[key] || "").toString().toLowerCase()
    const bv = (b[key] || "").toString().toLowerCase()
    if (av < bv) return dir === "asc" ? -1 : 1
    if (av > bv) return dir === "asc" ? 1 : -1
    return 0
  })
  return out
}
