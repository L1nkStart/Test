import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchFilteredInsuranceHolders } from "@/app/actions"
import { getFullUserSession } from "@/lib/auth"
import { HoldersClientTable } from "."
import { InsuranceHolder } from "@/interfaces/insurance-holder"

interface ParamsProp {
    query: string
    currentPage: number
    policyStatus?: string
    insuranceCompany?: string
}

export async function InsuranceHoldersTable({
    searchParams,
}: {
    searchParams: ParamsProp
}) {
    const [holdersData, session] = await Promise.all([
        fetchFilteredInsuranceHolders(searchParams),
        getFullUserSession(),
    ])
    const recordsPerPage = 10;

    const currentUserRole = session?.role;
    const canManageHolders =
        currentUserRole === "Superusuario" || currentUserRole === "Coordinador Regional";

    const holders: InsuranceHolder[] = holdersData.holders.map(h => ({
        ...h,
        totalCases: h.totalCases ?? 0,
        totalPatients: h.totalPatients ?? 0,
    }));

    return (
        <Card>
            <CardHeader>
            </CardHeader>
            <CardContent>
                <HoldersClientTable
                    data={holders}
                    canManageHolders={canManageHolders}
                    currentPage={searchParams.currentPage ?? 1}
                    pageCount={Math.ceil(holdersData.total / recordsPerPage)}
                />
            </CardContent>
        </Card>
    )
}
