import { JSX, useEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import useRateLimit from "../../hooks/useRateLimit";
import useWorker from "../../hooks/useWorker";
import type { AppDispatch, RootState } from "../../store";
import { SharedBufferAPI } from "../../utils/sharedBufferAPI";
import { getBreakpoints, subscribeBreakpoints } from "./breakpoints";
import {
    changeStep,
    getActiveAlgorithms,
    getAnimationStatus,
    getCurrentSpeed,
    getMaxStep,
    getStep,
    setStepWorkerReady,
    stopAnimation,
    type ActiveAlgorithm,
} from "./playSlice";

/* The step clock shared by every panel, so they move in lockstep. */
function ensureStepBuffer(): void {
    if (SharedBufferAPI.find("step")) return;
    SharedBufferAPI.init("step", 4);
    SharedBufferAPI.write("step", 0);
}

const stepOf = (payload: unknown): number | undefined =>
    (payload as { step?: number } | undefined)?.step;

/* Drives playback through the step worker; renders nothing. */
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

    const updateStep = (value: number): void => {
        if (store.getState().play.animation.status !== "playing") return;
        dispatch(changeStep({ value, trigger: "tick" }));
    };

    const limitedChangeStep = useRateLimit(updateStep, 50);

    // The clock gets the breakpoint steps and reports when it stops on one.
    useEffect(() => {
        if (!worker) return;
        const send = (): void =>
            worker.postMessage({
                type: "breakpoints",
                payload: { steps: getBreakpoints().steps },
            });
        send();
        return subscribeBreakpoints(send);
    }, [worker]);

    useEffect((): void => {
        onMessageType("break", (payload) => {
            const at = stepOf(payload);
            if (typeof at !== "number") return;
            dispatch(changeStep({ value: at, trigger: "break" }));
            dispatch(stopAnimation());
        });
    }, [onMessageType, dispatch]);

    // Worker ticks reach the store at most every 50ms.
    useEffect((): void => {
        onMessageType("ticked", (payload) => {
            if (store.getState().play.animation.status !== "playing") return;
            const nextStep = stepOf(payload);
            if (typeof nextStep !== "number") return;
            limitedChangeStep(nextStep);
        });
    }, [onMessageType, limitedChangeStep, store]);

    // A step set from the UI (not a tick) moves the worker's clock too.
    useEffect((): void => {
        if (trigger !== "tick") {
            worker?.postMessage({ type: "change", payload: { step } });
        }
    }, [step, worker, activeAlgorithms, trigger]);

    // Start or stop the worker clock when the status changes.
    useEffect((): void => {
        if (prevAnimationRef.current === animationStatus) return;
        prevAnimationRef.current = animationStatus;
        ensureStepBuffer();

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

    // Speed or length changed while playing: retune the running clock.
    useEffect((): void => {
        if (store.getState().play.animation.status !== "playing") return;
        worker?.postMessage({
            type: "config",
            payload: { interval: animationIntervalValue, maxStep },
        });
    }, [animationIntervalValue, maxStep, worker, store]);

    // Stop at the end.
    useEffect((): void => {
        if (animationStatus === "playing" && step >= maxStep) {
            dispatch(stopAnimation());
        }
    }, [step, maxStep, dispatch, animationStatus]);

    return null;
}

export default PlaybackTicker;
