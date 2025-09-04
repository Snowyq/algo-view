import { useCallback, useEffect, useRef, useState } from "react";
import StepWorker from "../workers/stepWorker.js?worker";
import SortCanvasWorker from "../workers/sortCanvasWorker.js?worker";
const workers = {
	"stepWorker.js": StepWorker,
	"sortCanvasWorker.js": SortCanvasWorker,
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
		// const path = `/src/workers/${workerName}?worker`;
		// const options = { type: workerType };
		// const worker = new Worker(new URL(path, import.meta.url), options);
		const worker = new workers[workerName]();
		setWorker(worker);

		worker.onmessage = function (event) {
			const { type, payload } = event.data;
			executeCallback(type, payload);
		};

		return () => worker.terminate();
	}, [workerName, workerType]);

	return { worker, onMessageType: setOnMessageType };
}

export default useWorker;
