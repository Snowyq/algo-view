import type { RefObject } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

type RectState = {
    width: number;
    height: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
    x: number;
    y: number;
};

export function useRect<T extends HTMLElement>(
    ref?: RefObject<T | null>
): { rect: RectState; ref: RefObject<T | null>; update: () => void } {
    const initRef = useRef<T | null>(null);
    const targetRef = ref || initRef;

    const [rect, setRect] = useState<RectState>({
        width: 0,
        height: 0,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        x: 0,
        y: 0,
    });

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const updateRect = useCallback((): void => {
        const node = targetRef.current;
        if (!node) return;
        const newRect = node.getBoundingClientRect();
        setRect({
            width: newRect.width,
            height: newRect.height,
            top: newRect.top,
            bottom: newRect.bottom,
            left: newRect.left,
            right: newRect.right,
            x: newRect.x,
            y: newRect.y,
        });
    }, [targetRef]);

    useLayoutEffect(() => {
        const node = targetRef.current;
        if (!node) return;

        updateRect();

        const resizeObserver = new ResizeObserver(updateRect);
        resizeObserver.observe(node);

        return () => resizeObserver.disconnect();
    }, [targetRef, updateRect]);

    return { rect, ref: targetRef, update: updateRect };
}
