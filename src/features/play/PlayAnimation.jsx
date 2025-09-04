import { ReactReduxContext, useDispatch, useSelector } from "react-redux";
import {
	changeStep,
	getActiveAlgorithms,
	getAnimationStatus,
	getCurrentSpeed,
	getMaxStep,
	getStep,
	stopAnimation,
} from "./playSlice";
import { useEffect, useRef } from "react";
import useWorker from "../../hooks/useWorker";
import { SharedBufferAPI } from "../../utils/sharedBufferAPI";
import useRateLimit from "../../hooks/useRateLimit";

function PlayAnimation() {
	const dispatch = useDispatch();
	const animationIntervalValue = useSelector(getCurrentSpeed);
	const activeAlgorithms = useSelector(getActiveAlgorithms);
	const animationStatus = useSelector(getAnimationStatus);
	const maxStep = useSelector(getMaxStep);
	const { value: step, trigger } = useSelector(getStep);

	const prevAnimationRef = useRef(null);

	const changeStep1 = value =>
		dispatch(changeStep({ value, trigger: "tick" }));
	const limitedChangeStep = useRateLimit(changeStep1, 50);

	const { worker, onMessageType } = useWorker("stepWorker.js");

	useEffect(() => {
		onMessageType("ticked", payload => {
			limitedChangeStep(payload.step);
		});
	}, [onMessageType, limitedChangeStep]);

	useEffect(() => {
		if (trigger !== "tick") {
			worker?.postMessage({ type: "change", payload: { step } });
		}
	}, [step, worker, activeAlgorithms, trigger]);

	useEffect(() => {
		if (prevAnimationRef.current === animationStatus) return;
		prevAnimationRef.current = animationStatus;

		if (!SharedBufferAPI.find("step")) {
			SharedBufferAPI.init("step", 4);
			SharedBufferAPI.write("step", 0);
		}

		if (animationStatus === "playing") {
			worker?.postMessage({
				type: "start",
				payload: {
					sharedBuffer: SharedBufferAPI.getBuffer("step"),
					interval: animationIntervalValue,
					maxStep,
				},
			});
		}

		if (animationStatus === "stopped") {
			worker?.postMessage({ type: "stop" });
		}

		if (animationStatus === "freezed") {
			worker?.postMessage({ type: "stop" });
		}
	}, [animationStatus, dispatch, animationIntervalValue, worker, maxStep]);

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
