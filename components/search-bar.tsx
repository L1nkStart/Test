"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from '@/hooks/use-debounce';

export function SearchBar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Usamos useDebouncedCallback para evitar ejecutar la action cada que se pula una tecla
    const handleSearchChange = useDebouncedCallback((value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            console.log("Setting search term:", value);
            params.set('query', value);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Buscar por nombre, cédula, teléfono, email o número de póliza..."
                        onChange={(e) => {
                            handleSearchChange(e.target.value);
                        }}
                        defaultValue={searchParams.get('query')?.toString()}
                        className="pl-10"
                    />
                </div>
            </CardContent>
        </Card>
    )
}