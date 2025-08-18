import { useDispatch, useSelector } from "react-redux";
import {
	getAnimationStatus,
	getCurrentSpeed,
	getIsPlaying,
	getMaxStep,
	getSpeeds,
	getStep,
	increaseStep,
} from "./playSlice";
import { useCallback, useEffect, useRef } from "react";

function PlayAnimation() {
	const dispatch = useDispatch();
	const animationIntervalValue = useSelector(getCurrentSpeed);
	const animationStatus = useSelector(getAnimationStatus);
	const intervalIdRef = useRef(null);
	const prevAnimationRef = useRef(null);

	useEffect(() => {
		if (prevAnimationRef.current === animationStatus) return;
		console.log("status:", animationStatus);
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

	return <></>;
}

export default PlayAnimation;
