import { JSX, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import PixelSprite from "../play/pixel/sprites/PixelSprite";
import { CANVAS_H, CANVAS_W } from "../play/pixel/sprites/frames";
import {
    drawBlockBars,
    readBarColors,
    recordInsertionSort,
    shuffledValues,
    type BarStep,
} from "./pixelBars";

const SCALE = 3;
const STEP_MS = 34;
const HOLD_MS = 1600;

const Wrap = styled.div`
    position: relative;
    width: 100%;
`;

const Lane = styled.div`
    position: relative;
    height: ${CANVAS_H * SCALE}px;
    pointer-events: none;
`;

const Runner = styled.div`
    position: absolute;
    left: 0;
    bottom: -2px;
    will-change: transform;
`;

const Canvas = styled.canvas`
    display: block;
    width: 100%;
    height: clamp(12rem, 20vh, 22rem);
`;

/*
 * The hero's ground: a live insertion sort drawn in pixel blocks, looping.
 * The speed cheetah runs along its top edge, exactly as far as the sort
 * has got. Pauses offscreen; under reduced motion it is a still frame.
 */
function SortStrip(): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const runnerRef = useRef<HTMLDivElement | null>(null);
    const [running, setRunning] = useState<boolean>(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        const colors = readBarColors();
        let width = 0;
        let height = 0;
        let steps: BarStep[] = [];
        let index = 0;
        let seed = 11;
        let last = 0;
        let acc = 0;
        let holdUntil = 0;
        let frame = 0;
        let visible = true;

        const count = (): number =>
            Math.max(24, Math.min(72, Math.round(window.innerWidth / 22)));

        const reset = (): void => {
            seed += 1;
            steps = recordInsertionSort(shuffledValues(count(), seed));
            index = 0;
        };

        const resize = (): void => {
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (steps.length === 0 || steps[0].values.length !== count())
                reset();
            render();
        };

        const render = (): void => {
            const step = steps[Math.min(index, steps.length - 1)];
            drawBlockBars(ctx, step, colors, {
                width,
                height,
                block: 6,
                gap: 2,
            });
            const runner = runnerRef.current;
            if (runner) {
                const progress = step.sorted / step.values.length;
                const x = Math.round(
                    Math.max(0, progress * width - CANVAS_W * SCALE * 0.6)
                );
                runner.style.transform = `translateX(${x}px)`;
            }
        };

        const loop = (now: number): void => {
            frame = requestAnimationFrame(loop);
            if (!visible) return;
            const dt = last ? now - last : 0;
            last = now;
            if (holdUntil) {
                if (now < holdUntil) return;
                holdUntil = 0;
                reset();
                setRunning(true);
            }
            acc += dt;
            let moved = false;
            while (acc >= STEP_MS && index < steps.length - 1) {
                acc -= STEP_MS;
                index += 1;
                moved = true;
            }
            if (index >= steps.length - 1 && !holdUntil) {
                holdUntil = now + HOLD_MS;
                setRunning(false);
            }
            if (moved) render();
        };

        resize();
        if (reduced) {
            index = Math.floor(steps.length * 0.55);
            render();
            frame = requestAnimationFrame(() => setRunning(false));
        } else {
            frame = requestAnimationFrame(loop);
        }

        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            last = 0;
        });
        observer.observe(canvas);
        window.addEventListener("resize", resize);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <Wrap aria-hidden="true">
            <Lane>
                <Runner ref={runnerRef}>
                    <PixelSprite
                        animal="cheetah"
                        state={running ? "run" : "done"}
                        scale={SCALE}
                    />
                </Runner>
            </Lane>
            <Canvas ref={canvasRef} />
        </Wrap>
    );
}

export default SortStrip;
