import { useEffect, useState } from "react";

type WindowSize = { width: number; height: number };

export default function useWindowSize(): {
    size: WindowSize;
    update: () => void;
} {
    const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 });

    function handleUpdate(): void {
        const newSize = {
            height: window.innerHeight,
            width: window.innerWidth,
        };
        setSize(newSize);
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver(handleUpdate);
        resizeObserver.observe(document.body);
        return () => resizeObserver.disconnect();
    }, []);

    return { size, update: handleUpdate };
}
