import { useLayoutEffect, useRef, useState, type RefObject } from "react";

/* `test(width, height)` on the element's layout size; re-renders only when
   it flips. Layout size ignores transforms, so FLIP animations don't count. */
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
