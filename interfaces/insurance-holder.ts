export interface InsuranceHolder {
    id: string
    ci: string
    name: string
    phone: string
    otherPhone?: string
    fixedPhone?: string
    email?: string
    birthDate?: string
    age?: number
    gender?: string
    address?: string
    city?: string
    state?: string
    clientId?: string
    clientName?: string
    insuranceCompany?: string
    policyNumber?: string
    policyType?: string
    policyStatus?: string
    policyStartDate?: string
    policyEndDate?: string
    coverageType?: string
    maxCoverageAmount?: number
    usedCoverageAmount?: number
    emergencyContact?: string
    emergencyPhone?: string
    bloodType?: string
    allergies?: string
    medicalHistory?: string
    isActive?: boolean



    // Estos atributos no existen pero los agrego para evitar
    // errores con Typescript o cosas inesperadas
    totalCases?: number
    totalPatients?: number
}