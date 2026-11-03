import type { RefObject } from "react";
import { useEffect, useRef } from "react";

type ClickOutsideHandler = () => void;

/* Calls `handler` on any document click outside the ref'd element. */
const useClickOutside = <T extends HTMLElement>(
    handler?: ClickOutsideHandler,
    ref?: RefObject<T | null>,
    listenCapturing: boolean = true
): { ref: RefObject<T | null> } => {
    const initRef = useRef<T | null>(null);
    const targetRef = ref || initRef;

    useEffect(() => {
        const handleClick = (e: MouseEvent): void => {
            const el = targetRef.current;
            if (el && !el.contains(e.target as Node)) handler?.();
        };
        document.addEventListener("click", handleClick, listenCapturing);
        return () =>
            document.removeEventListener("click", handleClick, listenCapturing);
    }, [handler, listenCapturing, targetRef]);

    return { ref: targetRef };
};

export default useClickOutside;
