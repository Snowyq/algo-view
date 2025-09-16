import { useDispatch, useSelector } from "react-redux";
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
	const { worker, onMessageType } = useWorker("stepWorker.js");

	// limiting dispatch function
	const updateStep = value =>
		dispatch(changeStep({ value, trigger: "tick" }));
	const limitedChangeStep = useRateLimit(updateStep, 50);

	// limited stepIndex update in UI
	useEffect(() => {
		onMessageType("ticked", payload => {
			limitedChangeStep(payload.step);
		});
	}, [onMessageType, limitedChangeStep]);

	// sync changed stepIndex by action in ui with stepWorker
	useEffect(() => {
		if (trigger !== "tick") {
			worker?.postMessage({ type: "change", payload: { step } });
		}
	}, [step, worker, activeAlgorithms, trigger]);

	// Animation state manager effect
	useEffect(() => {
		if (prevAnimationRef.current === animationStatus) return;
		prevAnimationRef.current = animationStatus;

		if (!SharedBufferAPI.find("step")) {
			SharedBufferAPI.init("step", 4);
			SharedBufferAPI.write("step", 0);
		}

		switch (animationStatus) {
			case "playing":
				worker?.postMessage({
					type: "start",
					payload: {
						sharedBuffer: SharedBufferAPI.getBuffer("step"),
						interval: animationIntervalValue,
						maxStep,
					},
				});
				break;
			case "freezed":
			case "stopped":
				worker?.postMessage({ type: "stop" });
				break;
		}
	}, [animationStatus, dispatch, animationIntervalValue, worker, maxStep]);

	// Auto stop after animation is finished
	useEffect(() => {
		if (animationStatus === "playing") {
			if (step >= maxStep) dispatch(stopAnimation());
		}
	}, [step, maxStep, dispatch, animationStatus]);

	return null;
}

export default PlayAnimation;
