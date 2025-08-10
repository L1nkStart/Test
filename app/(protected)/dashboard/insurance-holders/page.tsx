import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth';
import { FormProvider } from './components/form-context';
import { InsuranceHoldersTable } from './components/holders-table';
import { SearchParams } from '@/interfaces/search-params-props';

/*
    Consideré que esta sería la estructura que mejor rendimiento daría para la carga
    de datos de la tabla.

    Básicamente este page.tsx hace de server component para hacer la verificación del rol
    del usuario del lado del servidor, además de entregarle al cliente parte de la página 
    ya renderizada.

    
    Se utiliza un provedor para el Form ya que los botones son client component y
    la tabla del server, por lo que de esta forma se mantiene la carga de la tabla en el servidor
    y el botón de editar puede abrir el form, manteniendo velocidad y reactividad
*/

export default async function InsuranceHoldersPage(props: {
    searchParams?: Promise<SearchParams>;
}) {
    const searchParams = (await props.searchParams) as SearchParams;

    await requireAuth(['Superusuario', 'Coordinador Regional']);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <FormProvider>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-semibold text-lg md:text-2xl">Titulares de Seguro</h1>
                        <p className="text-muted-foreground">Gestión de titulares de pólizas de seguro</p>
                    </div>
                </div>

                {/* <HoldersToolbar /> */}

                <Suspense fallback={<div>Cargando tabla...</div>}>
                    <InsuranceHoldersTable searchParams={searchParams} />
                </Suspense>
            </FormProvider>
        </main>
    );
}