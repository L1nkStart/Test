export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-insurance-blue-deep mx-auto"></div>
                <p className="mt-2 text-insurance-gray-neutral">Cargando...</p>
            </div>
        </div>
    )
}
