'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { InsuranceHolder } from '@/interfaces/insurance-holder';
import { useToast } from '@/hooks/use-toast';
import { InsuranceHolderForm } from '@/components/insurance-holder-form';

// --- Contexto ---

type FormContextType = {
    openCreateForm: () => void;
    openEditForm: (insuranceHolderItem: InsuranceHolder) => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function useForm() {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useForm must be used within a FormProvider');
    }
    return context;
}

// --- Provider ---

export function FormProvider({ children }: { children: ReactNode }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHolder, setEditingHolder] = useState<InsuranceHolder | null>(null);
    const { toast } = useToast();

    const openCreateForm = () => {
        setEditingHolder(null);
        setIsFormOpen(true);
    };

    const openEditForm = (insuranceHolderItem: InsuranceHolder) => {
        setEditingHolder(insuranceHolderItem);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false)
        setEditingHolder(null)
    }

    const handleCreateHolder = async (newHolderData: any) => {
        try {
            const response = await fetch("/api/insurance-holders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newHolderData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create insurance holder.")
            }

            toast({
                title: "Éxito",
                description: "Titular de seguro creado correctamente.",
                variant: "default",
            })
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Error al crear el titular de seguro.",
                variant: "destructive",
            })
        }
    }

    const handleUpdateHolder = async (updatedHolderData: any) => {
        if (!editingHolder) return

        try {
            const response = await fetch(`/api/insurance-holders?id=${editingHolder.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedHolderData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update insurance holder.")
            }

            toast({
                title: "Éxito",
                description: "Titular de seguro actualizado correctamente.",
                variant: "default",
            })
            setEditingHolder(null)
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Error al actualizar el titular de seguro.",
                variant: "destructive",
            })
        }
    }

    const value = { openCreateForm, openEditForm };

    return (
        <FormContext.Provider value={value}>
            {children}

            {isFormOpen && (
                <InsuranceHolderForm
                    isOpen={isFormOpen}
                    onClose={handleFormClose}
                    onSave={editingHolder ? handleUpdateHolder : handleCreateHolder}
                    initialData={editingHolder}
                />
            )}
        </FormContext.Provider>
    );
}