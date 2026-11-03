import { useEffect, useState } from "react";

type WindowSize = { width: number; height: number };

/* Window size, refreshed whenever the body resizes. */
export default function useWindowSize(): {
    size: WindowSize;
    update: () => void;
} {
    const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });

    function handleUpdate(): void {
        setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver(handleUpdate);
        resizeObserver.observe(document.body);
        return () => resizeObserver.disconnect();
    }, []);

    return { size, update: handleUpdate };
}
