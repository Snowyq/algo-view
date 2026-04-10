import { useCallback, useEffect, useRef, useState } from "react";
import { tabId } from "../tab";

const workerFactories = {
	"stepWorker.ts": (workerType: WorkerOptions["type"] = "module") =>
		new Worker(new URL("../workers/stepWorker.ts", import.meta.url), {
			type: workerType,
		}),
	"sortCanvasWorker.ts": (workerType: WorkerOptions["type"] = "module") =>
		new Worker(
			new URL("../workers/sortCanvasWorker.ts", import.meta.url),
			{ type: workerType }
		),
};

console.log(location.origin);

function useWorker(workerName, workerType = "module") {
	const [worker, setWorker] = useState(null);

	const callbacksRef = useRef({});
	const setOnMessageType = useCallback((type, cb) => {
		callbacksRef.current[type] = typeof cb === "function" ? cb : undefined;
	}, []);

	function executeCallback(type, payload) {
		const fn = callbacksRef.current[type];
		if (typeof fn === "function") {
			fn?.(payload);
		}
	}

	useEffect(() => {
		if (!workerName) return;
		const createWorker = workerFactories[workerName];
		if (!createWorker) return;
		const worker = createWorker(workerType);
		setWorker(worker);

		worker.postMessage({ type: "tab", payload: tabId });

		worker.onmessage = function (event) {
			const { type, payload } = event.data;
			executeCallback(type, payload);
		};

		return () => worker.terminate();
	}, [workerName, workerType]);

	return { worker, onMessageType: setOnMessageType };
}

export default useWorker;
