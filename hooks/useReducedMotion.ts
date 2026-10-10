import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/* Defaults to motion during SSR, re-syncs on mount and on live OS changes. */
function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState<boolean>(false);

    useEffect(() => {
        const mq = window.matchMedia(QUERY);
        const onChange = (): void => setReduced(mq.matches);
        onChange();
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    return reduced;
}

export default useReducedMotion;
