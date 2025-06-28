import { useEffect, useRef } from "react";

const useThrottle = (callback, delay) => {
	const lastExecuted = useRef(Date.now());

	useEffect(() => {
		if (Date.now() - lastExecuted.current >= delay) {
			lastExecuted.current = Date.now();

			callback();
		} else {
			const throttleTimer = setTimeout(() => {
				lastExecuted.current = Date.now();
			}, delay);

			return () => clearTimeout(throttleTimer);
		}
	}, [callback, delay]);
};
export default useThrottle;
