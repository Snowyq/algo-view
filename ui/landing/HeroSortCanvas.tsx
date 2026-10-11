"use client";

import { JSX, useEffect, useRef } from "react";
import styled from "styled-components";
import useReducedMotion from "../../hooks/useReducedMotion";

/*
 * Decorative, self-contained insertion sort that loops behind the hero.
 * Colors come from the same --color-step-* tokens the real canvas uses,
 * so the hero teaches the legend before the visitor opens the playground.
 */

const Wrap = styled.div`
    position: relative;
    width: 100%;
    height: clamp(18rem, 34vh, 34rem);
    touch-action: pan-y;

    canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
    }
`;

type Palette = {
    idle: string;
    check: string;
    swap: string;
    finish: string;
    grid: string;
};

type StepEvent = { kind: "check" | "swap"; a: number; b: number };

const STEP_MS = 42;
const FINISH_SWEEP_MS = 900;
const HOLD_MS = 1400;
const LIFT_RADIUS = 90;
const MAX_LIFT = 0.18;

function readPalette(): Palette {
    const css = getComputedStyle(document.documentElement);
    const v = (name: string, fallback: string): string =>
        css.getPropertyValue(name).trim() || fallback;
    return {
        idle: v("--color-step-default", "#606b8a"),
        check: v("--check", "#f5c84c"),
        swap: v("--swap", "#6ea8fe"),
        finish: v("--finish", "#3dd9d6"),
        grid: v("--ink-700", "#262c3e"),
    };
}

function shuffled(count: number): number[] {
    const values = Array.from({ length: count }, (_, i) => (i + 1) / count);
    for (let i = values.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
}

function* insertionSort(values: number[]): Generator<StepEvent> {
    for (let i = 1; i < values.length; i += 1) {
        let j = i;
        while (j > 0) {
            yield { kind: "check", a: j - 1, b: j };
            if (values[j - 1] <= values[j]) break;
            [values[j - 1], values[j]] = [values[j], values[j - 1]];
            yield { kind: "swap", a: j - 1, b: j };
            j -= 1;
        }
    }
}

/* Deterministic mid-sort frame for reduced motion. */
function staticFrame(count: number): number[] {
    const sortedPart = Math.floor(count * 0.55);
    const values = Array.from({ length: count }, (_, i) => (i + 1) / count);
    const head = values.slice(0, sortedPart);
    const tail = values.slice(sortedPart);
    for (let i = 0; i < tail.length; i += 1) {
        const j = (i * 7 + 3) % tail.length;
        [tail[i], tail[j]] = [tail[j], tail[i]];
    }
    return [...head, ...tail];
}

type HeroSortCanvasProps = {
    paused?: boolean;
};

function HeroSortCanvas({ paused = false }: HeroSortCanvasProps): JSX.Element {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const reduced = useReducedMotion();
    const pausedRef = useRef<boolean>(paused);
    const syncRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        pausedRef.current = paused;
        syncRef.current?.();
    }, [paused]);

    useEffect(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const palette = readPalette();
        let width = 0;
        let height = 0;
        let count = 0;

        // Model
        let values: number[] = [];
        let display: number[] = [];
        let lift: number[] = [];
        let highlight: Int8Array = new Int8Array(0); // 0 idle, 1 check, 2 swap
        let steps: Generator<StepEvent> | null = null;
        let phase: "sorting" | "finish" | "hold" = "sorting";
        let phaseStart = 0;
        let accumulator = 0;
        let lastTime = 0;

        // Pointer
        let pointerX = -1;
        let pointerActive = false;

        // Loop state
        let rafId = 0;
        let visible = true;
        let running = false;

        const setup = (): void => {
            const rect = wrap.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const nextCount = Math.max(
                24,
                Math.min(96, Math.round(width / 15))
            );
            if (nextCount !== count) {
                count = nextCount;
                values = reduced ? staticFrame(count) : shuffled(count);
                display = values.slice();
                lift = new Array(count).fill(0);
                highlight = new Int8Array(count);
                steps = reduced ? null : insertionSort(values);
                phase = "sorting";
            }
        };

        const restart = (now: number): void => {
            values = shuffled(count);
            steps = insertionSort(values);
            phase = "sorting";
            phaseStart = now;
        };

        const advance = (now: number, dt: number): void => {
            if (phase === "sorting" && steps) {
                accumulator += dt;
                while (accumulator >= STEP_MS) {
                    accumulator -= STEP_MS;
                    highlight.fill(0);
                    const next = steps.next();
                    if (next.done) {
                        phase = "finish";
                        phaseStart = now;
                        break;
                    }
                    const { kind, a, b } = next.value;
                    const mark = kind === "check" ? 1 : 2;
                    highlight[a] = mark;
                    highlight[b] = mark;
                }
            } else if (phase === "finish") {
                highlight.fill(0);
                if (now - phaseStart > FINISH_SWEEP_MS) {
                    phase = "hold";
                    phaseStart = now;
                }
            } else if (phase === "hold" && now - phaseStart > HOLD_MS) {
                restart(now);
            }
        };

        const draw = (now: number): void => {
            ctx.clearRect(0, 0, width, height);

            // Axis: baseline + three quiet gridlines, the chart this canvas is.
            ctx.fillStyle = palette.grid;
            for (let g = 1; g <= 3; g += 1) {
                ctx.fillRect(0, Math.round(height * (g / 4)), width, 1);
            }
            ctx.fillRect(0, height - 1, width, 1);

            const gap = Math.max(2, Math.round(width / count / 5));
            const barWidth = (width - gap * (count - 1)) / count;
            const usable = height - 8;
            const sweep =
                phase === "finish"
                    ? Math.min(1, (now - phaseStart) / FINISH_SWEEP_MS)
                    : phase === "hold"
                      ? 1
                      : 0;

            for (let i = 0; i < count; i += 1) {
                // Ease display heights toward the model so swaps glide.
                display[i] += (values[i] - display[i]) * 0.35;

                const x = i * (barWidth + gap);
                const center = x + barWidth / 2;
                let targetLift = 0;
                if (pointerActive && !reduced) {
                    const d = Math.abs(center - pointerX);
                    if (d < LIFT_RADIUS) {
                        const t = 1 - d / LIFT_RADIUS;
                        targetLift = t * t * MAX_LIFT;
                    }
                }
                lift[i] += (targetLift - lift[i]) * 0.18;

                const h = Math.max(
                    3,
                    usable * Math.min(1, display[i] * (1 - MAX_LIFT) + lift[i])
                );
                const finished = sweep > 0 && i / count <= sweep;

                if (finished) ctx.fillStyle = palette.finish;
                else if (highlight[i] === 2) ctx.fillStyle = palette.swap;
                else if (highlight[i] === 1 || lift[i] > MAX_LIFT * 0.45)
                    ctx.fillStyle = palette.check;
                else ctx.fillStyle = palette.idle;

                ctx.beginPath();
                ctx.roundRect(x, height - h, barWidth, h, [
                    Math.min(3, barWidth / 2),
                    Math.min(3, barWidth / 2),
                    0,
                    0,
                ]);
                ctx.fill();
            }
        };

        const frame = (now: number): void => {
            const dt = lastTime ? Math.min(64, now - lastTime) : 16;
            lastTime = now;
            advance(now, dt);
            draw(now);
            rafId = requestAnimationFrame(frame);
        };

        const start = (): void => {
            if (running || reduced) return;
            running = true;
            lastTime = 0;
            rafId = requestAnimationFrame(frame);
        };

        const stop = (): void => {
            running = false;
            cancelAnimationFrame(rafId);
        };

        const syncRunning = (): void => {
            if (visible && !document.hidden && !pausedRef.current) start();
            else stop();
        };

        setup();
        if (reduced) {
            display = values.slice();
            const checkAt = Math.floor(count * 0.55);
            if (checkAt > 0 && checkAt < count) {
                highlight[checkAt - 1] = 1;
                highlight[checkAt] = 1;
            }
            draw(0);
        }

        const resizeObserver = new ResizeObserver(() => {
            setup();
            if (reduced) draw(0);
        });
        resizeObserver.observe(wrap);

        const intersection = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
                syncRunning();
            },
            { threshold: 0 }
        );
        intersection.observe(wrap);

        const onVisibility = (): void => syncRunning();
        document.addEventListener("visibilitychange", onVisibility);

        // Listen on the whole hero so the bars respond while reading the headline.
        const pointerZone = wrap.closest("section") ?? wrap;
        const onPointerMove = (event: Event): void => {
            const e = event as PointerEvent;
            const rect = canvas.getBoundingClientRect();
            pointerX = e.clientX - rect.left;
            pointerActive = true;
        };
        const onPointerLeave = (): void => {
            pointerActive = false;
        };
        pointerZone.addEventListener("pointermove", onPointerMove, {
            passive: true,
        });
        pointerZone.addEventListener("pointerleave", onPointerLeave);
        window.addEventListener("blur", onPointerLeave);

        syncRef.current = syncRunning;
        syncRunning();

        return () => {
            syncRef.current = null;
            stop();
            resizeObserver.disconnect();
            intersection.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            pointerZone.removeEventListener("pointermove", onPointerMove);
            pointerZone.removeEventListener("pointerleave", onPointerLeave);
            window.removeEventListener("blur", onPointerLeave);
        };
    }, [reduced]);

    return (
        <Wrap ref={wrapRef} aria-hidden="true">
            <canvas ref={canvasRef} />
        </Wrap>
    );
}

export default HeroSortCanvas;
