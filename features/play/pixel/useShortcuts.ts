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
    setEditorOpen,
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
        /* Playback keys; returns false when the key is not one of them. */
        const onPlaybackKey = (event: KeyboardEvent): boolean => {
            const { status, maxStep, step } = store.getState().play.animation;
            const key = event.key;
            const isToggle = key === " " || key === "k";
            const isStep = key === "ArrowRight" || key === "ArrowLeft";
            const isJump = key === "Home" || key === "End";
            if (!isToggle && !isStep && !isJump) return false;
            // space on a focused button should still press that button
            if (isToggle && (event.target as HTMLElement)?.closest("button, a"))
                return true;
            if (maxStep <= 0) return true;
            event.preventDefault();

            if (isStep) {
                const value = event.shiftKey ? 10 : 1;
                dispatch(
                    key === "ArrowRight"
                        ? increaseStep({ value })
                        : decreaseStep({ value })
                );
            } else if (isJump) {
                dispatch(changeStep({ value: key === "Home" ? 0 : maxStep }));
            } else if (status === "playing") {
                dispatch(stopAnimation());
            } else {
                if (step.value >= maxStep) dispatch(changeStep({ value: 0 }));
                dispatch(startAnimation());
            }
            return true;
        };

        const onKey = (event: KeyboardEvent): void => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            if (event.defaultPrevented || isOwnedTarget(event.target)) return;
            if (getFx().helpOpen) return;
            if (onPlaybackKey(event)) return;

            const { play } = store.getState();
            const key = event.key.length === 1 ? event.key.toLowerCase() : "";
            if (/^[1-9]$/.test(key)) {
                const speed = play.animation.speeds[Number(key) - 1];
                if (speed !== undefined) dispatch(changeSpeed(speed));
            } else if (key === "g") {
                const { stepWorkerReady, canvasWorkerLoadingCount } = play.ui;
                if (stepWorkerReady && canvasWorkerLoadingCount === 0) {
                    dispatch(regenerateInput(play));
                }
            } else if (key === "e") {
                event.preventDefault();
                dispatch(setEditorOpen(!play.ui.editorOpen));
            } else if (key === "i") {
                dispatch(toggleSidebar());
            } else if (key === "?") {
                setFx({ helpOpen: true });
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [dispatch, store]);
}

export default useShortcuts;
