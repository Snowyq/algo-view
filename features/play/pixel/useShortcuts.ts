import { useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import {
    changeSpeed,
    changeStep,
    decreaseStep,
    increaseStep,
    startAnimation,
    stopAnimation,
    toggleSidebar,
} from "../playSlice";
import { regenerateInput } from "../categories";
import { getFx, setFx } from "./fx/fxStore";

/* Typing in a field or driving a widget owns its own keys. */
function isOwnedTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) return false;
    if (el.isContentEditable) return true;
    return Boolean(
        el.closest(
            "input, textarea, select, [role='slider'], [role='listbox'], [role='tablist'], [role='dialog']"
        )
    );
}

function useShortcuts(): void {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();

    useEffect(() => {
        const onKey = (event: KeyboardEvent): void => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            if (event.defaultPrevented || isOwnedTarget(event.target)) return;
            if (getFx().helpOpen) return;

            const { play } = store.getState();
            const { status, maxStep, step, speeds } = {
                ...play.animation,
                speeds: play.animation.speeds,
            };
            const hasSteps = maxStep > 0;
            const key = event.key;

            if (key === " " || key === "k") {
                // Space on a focused button should still press that button.
                if ((event.target as HTMLElement)?.closest("button, a")) return;
                if (!hasSteps) return;
                event.preventDefault();
                if (status === "playing") dispatch(stopAnimation());
                else {
                    if (step.value >= maxStep)
                        dispatch(changeStep({ value: 0 }));
                    dispatch(startAnimation());
                }
                return;
            }
            if (key === "ArrowRight" || key === "ArrowLeft") {
                if (!hasSteps) return;
                event.preventDefault();
                const value = event.shiftKey ? 10 : 1;
                dispatch(
                    key === "ArrowRight"
                        ? increaseStep({ value })
                        : decreaseStep({ value })
                );
                return;
            }
            if (key === "Home" || key === "End") {
                if (!hasSteps) return;
                event.preventDefault();
                dispatch(changeStep({ value: key === "Home" ? 0 : maxStep }));
                return;
            }
            if (/^[1-9]$/.test(key)) {
                const speed = speeds[Number(key) - 1];
                if (speed !== undefined) dispatch(changeSpeed(speed));
                return;
            }
            if (key === "g" || key === "G") {
                const { stepWorkerReady, canvasWorkerLoadingCount } = play.ui;
                if (!stepWorkerReady || canvasWorkerLoadingCount > 0) return;
                dispatch(regenerateInput(play));
                return;
            }
            if (key === "i" || key === "I") {
                dispatch(toggleSidebar());
                return;
            }
            if (key === "?") {
                setFx({ helpOpen: true });
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [dispatch, store]);
}

export default useShortcuts;
