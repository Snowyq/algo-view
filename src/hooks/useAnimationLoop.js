import { useCallback, useEffect, useRef } from "react";

function useAnimationLoop({ step, doWhile , onStep }) {
	const stepRef = useRef(step);
	const intervalRef = useRef(null);

	useEffect(() => {
		stepRef.current = step;
	}, [step]);

	const start = useCallback(
		speed => {
			if (intervalRef.current) return;
			intervalRef.current = setInterval(() => {
				if () {
					onStep?.();
				} else {
					stop();
				}
			}, speed);
		},
		[onStep]
	);

	const stop = useCallback(() => {
		clearInterval(intervalRef.current);
		intervalRef.current = null;
	}, []);

	return { start, stop };
}

export default useAnimationLoop;
