import { useRef, useEffect, useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * Un custom hook que crea una versión "debotada" de una función callback.
 * La función solo se ejecutará después de que haya pasado el 'delay' sin que se llame de nuevo.
 * @param callback La función que se quiere "debotar".
 * @param delay El tiempo de espera en milisegundos.
 * @returns Una versión memoizada y "debotada" de la función callback.
 */
export function useDebouncedCallback<T extends AnyFunction>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout>(undefined);

    // Limpia el temporizador si el componente se desmonta
    useEffect(() => () => clearTimeout(timeoutRef.current), []);

    const debouncedCallback = useMemo(() => {
        const newCallback = (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        };

        return newCallback as T;
    }, [callback, delay]);

    return debouncedCallback;
}
