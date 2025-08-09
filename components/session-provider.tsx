'use client';

import type { UserSession } from '@/lib/auth';
import { createContext, useContext, type ReactNode } from 'react';

type SessionContextType = {
    session: UserSession | null;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Componente Proveedor
export function SessionProvider({
    children,
    value,
}: {
    children: ReactNode;
    value: SessionContextType;
}) {
    return (
        <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    );
}

// Hook para consumir el contexto
export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context.session;
}