import { useEffect, useRef } from "react";

/** Calls onEscape on any Escape keydown while active, wherever focus is. */
export function useEscapeKey(
    active: boolean,
    onEscape: (event: KeyboardEvent) => void
): void {
    const handlerRef = useRef(onEscape);
    useEffect(() => {
        handlerRef.current = onEscape;
    });

    useEffect(() => {
        if (!active) return;
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "Escape") handlerRef.current(event);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [active]);
}
