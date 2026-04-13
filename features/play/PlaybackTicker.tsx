import { JSX, useEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import useRateLimit from "../../hooks/useRateLimit";
import useWorker from "../../hooks/useWorker";
import { AppDispatch, RootState } from "../../store";
import { SharedBufferAPI } from "../../utils/sharedBufferAPI";
import type { ActiveAlgorithm } from "./playSlice";
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

function PlaybackTicker(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const animationIntervalValue = useSelector<RootState, number>(
        getCurrentSpeed
    );
    const activeAlgorithms = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const animationStatus = useSelector<RootState, string>(getAnimationStatus);
    const maxStep = useSelector<RootState, number>(getMaxStep);
    const { value: step, trigger } = useSelector<
        RootState,
        { value: number; trigger: string }
    >(getStep);

    const prevAnimationRef = useRef<string | null>(null);
    const { worker, onMessageType } = useWorker("stepWorker.ts");

    useEffect((): void | (() => void) => {
        if (!worker) return;
        dispatch(setStepWorkerReady(true));
        return () => {
            dispatch(setStepWorkerReady(false));
        };
    }, [worker, dispatch]);

    // limiting dispatch function
    const updateStep = (value: number): void => {
        const state = store.getState();
        if (state.play.animation.status !== "playing") return;
        console.log(value);
        dispatch(changeStep({ value, trigger: "tick" }));
    };

    const limitedChangeStep = useRateLimit(updateStep, 50);

    // limited stepIndex update in UI
    useEffect((): void => {
        onMessageType("ticked", (payload) => {
            const state = store.getState();
            if (state.play.animation.status !== "playing") return;
            const nextStep = (payload as { step?: number } | undefined)?.step;
            if (typeof nextStep !== "number") return;
            limitedChangeStep(nextStep);
        });
    }, [onMessageType, limitedChangeStep, store]);

    // sync changed stepIndex by action in ui with stepWorker
    useEffect((): void => {
        if (trigger !== "tick") {
            worker?.postMessage({ type: "change", payload: { step } });
        }
    }, [step, worker, activeAlgorithms, trigger]);

    // Animation state manager effect
    useEffect((): void => {
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
    useEffect((): void => {
        if (animationStatus === "playing") {
            if (step >= maxStep) dispatch(stopAnimation());
        }
    }, [step, maxStep, dispatch, animationStatus]);

    return null;
}

export default PlaybackTicker;
