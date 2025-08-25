import { useDispatch, useSelector } from "react-redux";
import {
	getAnimationStatus,
	getCurrentSpeed,
	getMaxStep,
	getStep,
	increaseStep,
	stopAnimation,
} from "./playSlice";
import { useEffect, useRef } from "react";

function PlayAnimation() {
	const dispatch = useDispatch();
	const animationIntervalValue = useSelector(getCurrentSpeed);
	const animationStatus = useSelector(getAnimationStatus);
	const maxStep = useSelector(getMaxStep);
	const step = useSelector(getStep);
	const intervalIdRef = useRef(null);
	const prevAnimationRef = useRef(null);

	useEffect(() => {
		if (prevAnimationRef.current === animationStatus) return;
		// console.log("status:", animationStatus);

		prevAnimationRef.current = animationStatus;
		if (animationStatus === "playing") {
			intervalIdRef.current = setInterval(() => {
				dispatch(increaseStep(1));
			}, animationIntervalValue);
		}

		if (animationStatus === "stopped") {
			clearInterval(intervalIdRef.current);
		}

		if (animationStatus === "freezed") {
			clearInterval(intervalIdRef.current);
		}
	}, [animationStatus, dispatch, animationIntervalValue]);

	useEffect(() => {
		if (animationStatus === "playing") {
			if (step >= maxStep) dispatch(stopAnimation());
		}
	}, [step, maxStep, dispatch, animationStatus]);

	return null;
}

export default PlayAnimation;

/* ------------------------------------ x ----------------------------------- */
/* ------------------------------------ x ----------------------------------- */
/* ------------------------------------ x ----------------------------------- */
/* ------------------------------------ x ----------------------------------- */

// import { useDispatch, useSelector } from "react-redux";
// import { getAnimationStatus, getCurrentSpeed, increaseStep } from "./playSlice";
// import { useEffect, useRef } from "react";

// function PlayAnimation() {
// 	const dispatch = useDispatch();
// 	const intervalMs = useSelector(getCurrentSpeed); // desired interval in ms
// 	const animationStatus = useSelector(getAnimationStatus);

// 	const prevRef = useRef(null);
// 	const timerRef = useRef({ nextTime: 0, id: null });

// 	useEffect(() => {
// 		const step = () => {
// 			const now = performance.now();
// 			if (prevRef.current) {
// 				console.log(now - prevRef.current);
// 			}
// 			prevRef.current = now;

// 			// Handle multiple missed steps if delayed
// 			while (now >= timerRef.current.nextTime) {
// 				dispatch(increaseStep(1));
// 				timerRef.current.nextTime += intervalMs;
// 			}

// 			timerRef.current.id = requestAnimationFrame(step);
// 		};

// 		if (animationStatus === "playing") {
// 			// Initialize nextTime
// 			timerRef.current.nextTime = performance.now() + intervalMs;
// 			timerRef.current.id = requestAnimationFrame(step);
// 		} else {
// 			if (timerRef.current.id) cancelAnimationFrame(timerRef.current.id);
// 			timerRef.current.id = null;
// 		}

// 		return () => {
// 			if (timerRef.current.id) cancelAnimationFrame(timerRef.current.id);
// 			timerRef.current.id = null;
// 		};
// 	}, [animationStatus, intervalMs, dispatch]);

// 	return null;
// }

// export default PlayAnimation;
