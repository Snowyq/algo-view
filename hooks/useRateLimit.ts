import { useCallback, useEffect, useRef } from "react";

function useRateLimit<Args extends unknown[]>(
    callback: (...args: Args) => void,
    interval: number = 10
): (...args: Args) => void {
    const latestArgsRef = useRef<Args | null>(null);
    const callbackRef = useRef(callback);
    const isRunningRef = useRef<boolean>(false);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const trigger = useCallback((...args: Args) => {
        latestArgsRef.current = args;
    }, []);

    useEffect(() => {
        isRunningRef.current = true;

        const executeCallback = setInterval(() => {
            if (latestArgsRef.current) {
                callbackRef.current(...latestArgsRef.current);
                latestArgsRef.current = null;
            }
        }, interval);

        return () => {
            clearInterval(executeCallback);
            isRunningRef.current = false;
        };
    }, [interval]);

    return trigger;
}

export default useRateLimit;
