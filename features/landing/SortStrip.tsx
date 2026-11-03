import { JSX, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { prefersReducedMotion } from "../play/pixel/fx/dom";
import PixelSprite from "../play/pixel/sprites/PixelSprite";
import { CANVAS_W } from "../play/pixel/sprites/frames";
import {
    drawBlockBars,
    fitCanvas,
    playStepLoop,
    readBarColors,
    recordInsertionSort,
    shuffledValues,
    type BarStep,
} from "./pixelBars";
import { SpriteLane, SpriteRunner } from "./sectionStyles";

const SCALE = 3;
const STEP_MS = 34;
const HOLD_MS = 1600;

const Wrap = styled.div`
    position: relative;
    width: 100%;
`;

const Lane = styled(SpriteLane)`
    pointer-events: none;
`;

const Canvas = styled.canvas`
    display: block;
    width: 100%;
    height: clamp(12rem, 20vh, 22rem);
`;

const barCount = (): number =>
    Math.max(24, Math.min(72, Math.round(window.innerWidth / 22)));

/* Hero ground: a looping sort, the cheetah runs as far as it has got. */
function SortStrip(): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const runnerRef = useRef<HTMLDivElement | null>(null);
    const [running, setRunning] = useState<boolean>(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const colors = readBarColors();
        let size = { width: 0, height: 0 };
        let steps: BarStep[] = [];
        let index = 0;
        let seed = 11;
        let loop: ReturnType<typeof playStepLoop> | null = null;

        const reshuffle = (): void => {
            seed += 1;
            steps = recordInsertionSort(shuffledValues(barCount(), seed));
            index = 0;
        };

        const render = (): void => {
            const step = steps[Math.min(index, steps.length - 1)];
            drawBlockBars(ctx, step, colors, { ...size, block: 6, gap: 2 });
            const runner = runnerRef.current;
            if (!runner) return;
            const progress = step.sorted / step.values.length;
            const x = Math.round(
                Math.max(0, progress * size.width - CANVAS_W * SCALE * 0.6)
            );
            runner.style.transform = `translateX(${x}px)`;
        };

        const resize = (): void => {
            size = fitCanvas(canvas, ctx);
            if (steps.length === 0 || steps[0].values.length !== barCount()) {
                reshuffle();
                loop?.rewind();
            }
            render();
        };

        resize();
        window.addEventListener("resize", resize);

        if (prefersReducedMotion()) {
            index = Math.floor(steps.length * 0.55);
            render();
            const frame = requestAnimationFrame(() => setRunning(false));
            return () => {
                cancelAnimationFrame(frame);
                window.removeEventListener("resize", resize);
            };
        }

        loop = playStepLoop(canvas, {
            stepMs: STEP_MS,
            holdMs: HOLD_MS,
            lastIndex: () => steps.length - 1,
            onStep: (next) => {
                index = next;
                render();
            },
            onHold: () => setRunning(false),
            onRestart: () => {
                reshuffle();
                setRunning(true);
            },
        });
        return () => {
            loop?.stop();
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <Wrap aria-hidden="true">
            <Lane $scale={SCALE}>
                <SpriteRunner ref={runnerRef}>
                    <PixelSprite
                        animal="cheetah"
                        state={running ? "run" : "done"}
                        scale={SCALE}
                    />
                </SpriteRunner>
            </Lane>
            <Canvas ref={canvasRef} />
        </Wrap>
    );
}

export default SortStrip;
