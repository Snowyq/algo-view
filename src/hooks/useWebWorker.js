import { useCallback, useEffect, useRef, useState } from "react";

const useWebWorker = (workerScript, options) => {
	const [result, setResult] = useState(null);
	const workerRef = useRef(null);

	useEffect(() => {
		workerRef.current = new Worker(workerScript, options);
		workerRef.current.onmessage = event => {
			setResult(event.data);
		};

		return () => {
			workerRef.current.terminate();
		};
	}, [workerScript, options]);

	const runTask = data => {
		workerRef.current.postMessage(data);
	};

	return { result, runTask, workerRef };
};

export { useWebWorker };
