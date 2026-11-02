import { useLayoutEffect, useState, type RefObject } from "react";

/** The element's layout width, kept up to date. */
export function useWidth(ref: RefObject<HTMLElement | null>): number {
    const [width, setWidth] = useState<number>(0);
    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) return;
        setWidth(node.offsetWidth);
        const observer = new ResizeObserver(([entry]) =>
            setWidth(entry.contentRect.width)
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [ref]);
    return width;
}
