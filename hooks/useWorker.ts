import { useCallback, useEffect, useRef, useState } from "react";
import { tabId } from "../tab";

type WorkerFactory = (workerType?: WorkerOptions["type"]) => Worker;

const workerFactories: Record<string, WorkerFactory> = {
    "stepWorker.ts": (workerType: WorkerOptions["type"] = "module") =>
        new Worker(new URL("../workers/stepWorker.ts", import.meta.url), {
            type: workerType,
        }),
    "sortCanvasWorker.ts": (workerType: WorkerOptions["type"] = "module") =>
        new Worker(new URL("../workers/sortCanvasWorker.ts", import.meta.url), {
            type: workerType,
        }),
};

type WorkerName = keyof typeof workerFactories;
type WorkerMessageHandler = (payload: unknown) => void;

function useWorker(
    workerName?: WorkerName,
    workerType: WorkerOptions["type"] = "module"
): {
    worker: Worker | null;
    onMessageType: (type: string, cb?: WorkerMessageHandler) => void;
} {
    const [worker, setWorker] = useState<Worker | null>(null);

    const callbacksRef = useRef<
        Record<string, WorkerMessageHandler | undefined>
    >({});
    const setOnMessageType = useCallback(
        (type: string, cb?: WorkerMessageHandler) => {
            callbacksRef.current[type] =
                typeof cb === "function" ? cb : undefined;
        },
        []
    );

    function executeCallback(type: string, payload: unknown): void {
        const fn = callbacksRef.current[type];
        if (typeof fn === "function") {
            fn(payload);
        }
    }

    useEffect(() => {
        if (typeof window === "undefined" || typeof Worker === "undefined") {
            return;
        }
        if (!workerName) {
            return;
        }
        const createWorker = workerFactories[workerName];
        if (!createWorker) return;
        const createdWorker = createWorker(workerType);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWorker(createdWorker);

        createdWorker.postMessage({ type: "tab", payload: tabId });
        const handleMessage = (
            event: MessageEvent<{ type: string; payload?: unknown }>
        ): void => {
            const { type, payload } = event.data;
            executeCallback(type, payload);
        };

        createdWorker.addEventListener("message", handleMessage);

        return () => {
            createdWorker.removeEventListener("message", handleMessage);
            createdWorker.terminate();
        };
    }, [workerName, workerType]);

    return { worker, onMessageType: setOnMessageType };
}

export default useWorker;
