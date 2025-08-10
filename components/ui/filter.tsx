"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface FilterProps {
    filterKey: string; // El nombre del parámetro en la URL (ej: 'policyStatus')
    placeholder: string; // El texto a mostrar cuando no hay nada seleccionado
    options: {
        value: string;
        label: string;
    }[];
}

export function Filter({ filterKey, placeholder, options }: FilterProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('currentPage', '1');
        if (value && value !== 'all') {
            params.set(filterKey, value);
        } else {
            params.delete(filterKey);
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <Select
            onValueChange={handleFilterChange}
            defaultValue={searchParams.get(filterKey) || 'all'}
        >
            <SelectTrigger className="w-full md:w-[180px] truncate">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {/* Opción para remover el filtro */}
                <SelectItem value="all">Todos</SelectItem>
                {/* Mapeo de las opciones pasadas como props */}
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
