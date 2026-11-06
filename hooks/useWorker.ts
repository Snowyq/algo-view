import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkerName } from "../algorithms/categoryData";
import { tabId } from "../tab";

type WorkerType = WorkerOptions["type"];

// Each URL must stay a literal inside `new Worker(...)` so the bundler picks it up.
const workerFactories: Record<
    WorkerName | "stepWorker.ts",
    (type: WorkerType) => Worker
> = {
    "stepWorker.ts": (type) =>
        new Worker(new URL("../workers/stepWorker.ts", import.meta.url), {
            type,
        }),
    "sortCanvasWorker.ts": (type) =>
        new Worker(new URL("../workers/sortCanvasWorker.ts", import.meta.url), {
            type,
        }),
    "pathCanvasWorker.ts": (type) =>
        new Worker(new URL("../workers/pathCanvasWorker.ts", import.meta.url), {
            type,
        }),
    "findCanvasWorker.ts": (type) =>
        new Worker(new URL("../workers/findCanvasWorker.ts", import.meta.url), {
            type,
        }),
    "mazeCanvasWorker.ts": (type) =>
        new Worker(new URL("../workers/mazeCanvasWorker.ts", import.meta.url), {
            type,
        }),
    "dpCanvasWorker.ts": (type) =>
        new Worker(new URL("../workers/dpCanvasWorker.ts", import.meta.url), {
            type,
        }),
    "lifeCanvasWorker.ts": (type) =>
        new Worker(new URL("../workers/lifeCanvasWorker.ts", import.meta.url), {
            type,
        }),
    "fillCanvasWorker.ts": (type) =>
        new Worker(new URL("../workers/fillCanvasWorker.ts", import.meta.url), {
            type,
        }),
    "geometryCanvasWorker.ts": (type) =>
        new Worker(
            new URL("../workers/geometryCanvasWorker.ts", import.meta.url),
            { type }
        ),
    "treeCanvasWorker.ts": (type) =>
        new Worker(new URL("../workers/treeCanvasWorker.ts", import.meta.url), {
            type,
        }),
    "graphCanvasWorker.ts": (type) =>
        new Worker(
            new URL("../workers/graphCanvasWorker.ts", import.meta.url),
            { type }
        ),
    "stringsCanvasWorker.ts": (type) =>
        new Worker(
            new URL("../workers/stringsCanvasWorker.ts", import.meta.url),
            { type }
        ),
};

type WorkerMessageHandler = (payload: unknown) => void;

/* Spawns a worker for the component's lifetime and routes its messages by type. */
function useWorker(
    workerName?: keyof typeof workerFactories,
    workerType: WorkerType = "module"
): {
    worker: Worker | null;
    onMessageType: (type: string, cb?: WorkerMessageHandler) => void;
} {
    const [worker, setWorker] = useState<Worker | null>(null);
    const callbacksRef = useRef<
        Record<string, WorkerMessageHandler | undefined>
    >({});

    const onMessageType = useCallback(
        (type: string, cb?: WorkerMessageHandler) => {
            callbacksRef.current[type] =
                typeof cb === "function" ? cb : undefined;
        },
        []
    );

    useEffect(() => {
        if (typeof Worker === "undefined" || !workerName) return;
        const createWorker = workerFactories[workerName];
        if (!createWorker) return;
        const created = createWorker(workerType);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWorker(created);

        created.postMessage({ type: "tab", payload: tabId });
        const handleMessage = (
            event: MessageEvent<{ type: string; payload?: unknown }>
        ): void => {
            const { type, payload } = event.data;
            callbacksRef.current[type]?.(payload);
        };
        created.addEventListener("message", handleMessage);

        return () => {
            created.removeEventListener("message", handleMessage);
            created.terminate();
        };
    }, [workerName, workerType]);

    return { worker, onMessageType };
}

export default useWorker;
