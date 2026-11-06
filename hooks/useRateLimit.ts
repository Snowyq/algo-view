import { useCallback, useEffect, useRef } from "react";

/* Calls `callback` at most once per `interval` ms, with the latest args. */
function useRateLimit<Args extends unknown[]>(
    callback: (...args: Args) => void,
    interval: number = 10
): (...args: Args) => void {
    const latestArgsRef = useRef<Args | null>(null);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const trigger = useCallback((...args: Args) => {
        latestArgsRef.current = args;
    }, []);

    useEffect(() => {
        const executeCallback = setInterval(() => {
            if (latestArgsRef.current) {
                callbackRef.current(...latestArgsRef.current);
                latestArgsRef.current = null;
            }
        }, interval);

        return () => clearInterval(executeCallback);
    }, [interval]);

    return trigger;
}

export default useRateLimit;
