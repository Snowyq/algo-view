import { useEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import useRateLimit from "../../hooks/useRateLimit";
import useWorker from "../../hooks/useWorker";
import { AppDispatch, RootState } from "../../store";
import { SharedBufferAPI } from "../../utils/sharedBufferAPI";
import {
    changeStep,
    getActiveAlgorithms,
    getAnimationStatus,
    getCurrentSpeed,
    getMaxStep,
    getStep,
    setStepWorkerReady,
    stopAnimation,
} from "./playSlice";

function PlaybackTicker() {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const animationIntervalValue = useSelector(getCurrentSpeed);
    const activeAlgorithms = useSelector(getActiveAlgorithms);
    const animationStatus = useSelector(getAnimationStatus);
    const maxStep = useSelector(getMaxStep);
    const { value: step, trigger } = useSelector(getStep);

    const prevAnimationRef = useRef(null);
    const { worker, onMessageType } = useWorker("stepWorker.ts");

    useEffect(() => {
        if (!worker) return;
        dispatch(setStepWorkerReady(true));
        return () => {
            dispatch(setStepWorkerReady(false));
        };
    }, [worker, dispatch]);

    // limiting dispatch function
    const updateStep = (value) => {
        const state = store.getState();
        if (state.play.animation.status !== "playing") return;
        console.log(value);
        dispatch(changeStep({ value, trigger: "tick" }));
    };

    const limitedChangeStep = useRateLimit(updateStep, 50);

    // limited stepIndex update in UI
    useEffect(() => {
        onMessageType("ticked", (payload) => {
            const state = store.getState();
            if (state.play.animation.status !== "playing") return;
            limitedChangeStep(payload.step);
        });
    }, [onMessageType, limitedChangeStep, store]);

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

export default PlaybackTicker;
