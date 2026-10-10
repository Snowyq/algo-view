import { useLayoutEffect, useRef, useState, type RefObject } from "react";

/**
 * Observes an element's layout size and returns `test(width, height)`.
 * Re-renders only when the answer flips. Uses layout size (offset/contentRect),
 * not getBoundingClientRect, so transform animations (FLIP) never decide it.
 */
function useSizeFlag(
    ref: RefObject<HTMLElement | null>,
    test: (width: number, height: number) => boolean
): boolean {
    const [flag, setFlag] = useState<boolean>(false);
    const testRef = useRef(test);

    useLayoutEffect(() => {
        testRef.current = test;
    });

    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) return;

        const update = (width: number, height: number): void => {
            const next = testRef.current(width, height);
            setFlag((prev) => (prev === next ? prev : next));
        };

        update(node.offsetWidth, node.offsetHeight);
        const observer = new ResizeObserver(([entry]) => {
            update(entry.contentRect.width, entry.contentRect.height);
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, [ref]);

    return flag;
}

export default useSizeFlag;
