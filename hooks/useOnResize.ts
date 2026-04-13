import type { RefObject } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

type ResizeCallback<T extends HTMLElement> = (ref: RefObject<T | null>) => void;

function useOnResize<T extends HTMLElement>(
    onResize: ResizeCallback<T>,
    ref?: RefObject<T | null>
): { ref: RefObject<T | null>; update: () => void } {
    const initRef = useRef<T | null>(null);
    const targetRef = ref || initRef;

    const updateRect = useCallback((): void => {
        if (!targetRef.current) return;
        onResize?.(targetRef);
    }, [targetRef, onResize]);

    useLayoutEffect(() => {
        if (!ref && typeof document !== "undefined" && !initRef.current) {
            initRef.current = document.body as T;
        }
        const node = targetRef.current;
        if (!node) return;

        updateRect();

        const resizeObserver = new ResizeObserver(updateRect);
        resizeObserver.observe(node);

        return () => resizeObserver.disconnect();
    }, [ref, targetRef, updateRect]);

    return { ref: targetRef, update: updateRect };
}

export default useOnResize;
