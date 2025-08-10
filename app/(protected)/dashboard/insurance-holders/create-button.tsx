'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useForm } from './form-context';

export function InsuranceHolderCreateButton() {
    const { openCreateForm } = useForm();

    return (
        <Button
            onClick={openCreateForm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
        >
            <Plus className="h-4 w-4 mr-2" />
            Crear Titular
        </Button>
    );
}
