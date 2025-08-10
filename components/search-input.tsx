"use client"

import React, { forwardRef, useImperativeHandle } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    onClear?: () => void
    disabled?: boolean
    autoFocus?: boolean
}

export interface SearchInputRef {
    focus: () => void
    clear: () => void
}

export const SearchInput = forwardRef<SearchInputRef, SearchInputProps>(({
    value,
    onChange,
    placeholder = "Buscar...",
    className,
    onClear,
    disabled = false,
    autoFocus = false
}, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus()
        },
        clear: () => {
            onChange('')
            onClear?.()
        }
    }), [onChange, onClear])

    const handleClear = () => {
        onChange('')
        onClear?.()
        inputRef.current?.focus()
    }

    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 pr-10"
                disabled={disabled}
                autoFocus={autoFocus}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        handleClear()
                    }
                }}
            />
            {value && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                    onClick={handleClear}
                    disabled={disabled}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Limpiar búsqueda</span>
                </Button>
            )}
        </div>
    )
})

SearchInput.displayName = 'SearchInput'
