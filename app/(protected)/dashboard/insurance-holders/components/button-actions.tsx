'use client';

import { useState, useTransition } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useForm } from './form-context';
import type { InsuranceHolder } from '@/interfaces/insurance-holder';
import { deleteUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function InsuranceHolderButtonActions({ holder }: { holder: InsuranceHolder }) {
    const { toast } = useToast();
    // Hook del contexto para abrir el modal de edición
    const { openEditForm } = useForm();

    // Estado para controlar la apertura del diálogo de alerta
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    // Hook useTransition para manejar el estado de carga de la Server Action
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteUser(holder.id);

            if (result.success) {
                toast({
                    title: 'Éxito',
                    description: 'Titular de seguro eliminado correctamente.',
                });
                setIsAlertOpen(false); // Cierra el diálogo al tener éxito
            } else {
                toast({
                    title: 'Error',
                    description: result.message || 'No se pudo eliminar el titular.',
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            {/* Botón para Modificar */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => openEditForm(holder)}
                aria-label="Modificar titular"
            >
                <Edit className="h-4 w-4" />
            </Button>

            {/* Diálogo de Alerta para Confirmar Borrado */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="destructive"
                        size="sm"
                        aria-label="Eliminar titular"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al titular de seguro
                            <span className="font-semibold"> {holder.name}</span> y todos sus datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Sí, eliminar'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
