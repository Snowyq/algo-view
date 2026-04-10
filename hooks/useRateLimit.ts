import { useCallback, useEffect, useRef } from "react";

function useRateLimit(callback, interval = 10) {
	const latestArgsRef = useRef(null);
	const callbackRef = useRef(callback);
	const isRunningRef = useRef(false);

	callbackRef.current = callback;

	const trigger = useCallback(
		(...args) => {
			latestArgsRef.current = args;
		},
		[latestArgsRef]
	);

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
