import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { JSX, useRef, useState } from "react";
import styled from "styled-components";
import {
    blockPattern,
    labelText,
    pixelFrame,
} from "../play/pixel/primitives/pixel";
import PixelSprite from "../play/pixel/sprites/PixelSprite";
import { CANVAS_H, CANVAS_W } from "../play/pixel/sprites/frames";
import {
    drawBlockBars,
    readBarColors,
    recordInsertionSort,
    shuffledValues,
} from "./pixelBars";
import SplitWords from "./SplitWords";

gsap.registerPlugin(useGSAP);

const SCALE = 3;
const STEPS = recordInsertionSort(shuffledValues(18, 5));
const LAST = STEPS.length - 1;
const STEP_MS = 70;
const HOLD_MS = 1800;

const Section = styled.section`
    position: relative;
`;

const Pin = styled.div`
    display: grid;
    align-content: center;
    gap: 3.2rem;
    padding: 12.8rem clamp(1.6rem, 3vw, 3.2rem) 9.6rem;

    @media (min-width: 1024px) {
        grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
        align-items: center;
        gap: 6.4rem;
    }
`;

const Eyebrow = styled.p`
    ${labelText};
    color: var(--accent);
    margin-bottom: 1.6rem;
`;

const Title = styled.h2`
    font-family: var(--f-display);
    font-weight: 400;
    font-size: clamp(4rem, 2rem + 4vw, 8.8rem);
    line-height: 0.82;
    text-transform: uppercase;
    color: var(--fg);
`;

const Legend = styled.ol`
    display: grid;
    gap: 0.4rem;
    margin-top: 3.2rem;
    list-style: none;
`;

const Item = styled.li<{ $color: string }>`
    position: relative;
    display: grid;
    grid-template-columns: 1.6rem auto 1fr;
    align-items: baseline;
    gap: 1.2rem;
    padding: 1rem 1.2rem;
    color: var(--fg-4);
    transition:
        color 100ms steps(2),
        background-color 100ms steps(2);

    i {
        width: 1.2rem;
        height: 1.2rem;
        align-self: center;
        background-color: ${({ $color }) => $color};
        opacity: 0.4;
    }
    b {
        ${labelText};
        font-weight: 400;
        font-size: 1.2rem;
    }
    span {
        font-size: 1.5rem;
    }

    &[data-active="true"] {
        color: var(--fg);
        background-color: var(--surface);
    }
    &[data-active="true"] i {
        opacity: 1;
    }
`;

const Counter = styled.p`
    display: flex;
    align-items: baseline;
    gap: 1.2rem;
    margin-top: 3.2rem;

    small {
        ${labelText};
        color: var(--fg-4);
    }
    strong {
        font-family: var(--f-display);
        font-weight: 400;
        font-size: clamp(5.6rem, 3rem + 4vw, 9.6rem);
        line-height: 0.8;
        color: var(--fg);
        font-variant-numeric: tabular-nums;
    }
`;

const Panel = styled.figure`
    position: relative;
    margin: var(--b);
    padding: 1.6rem 2rem 2rem;
    background-color: var(--surface);
    ${pixelFrame("var(--line-2)")};
`;

const PanelHead = styled.figcaption`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1.2rem;

    strong {
        font-family: var(--f-display);
        font-weight: 400;
        font-size: 3.2rem;
        line-height: 0.8;
        text-transform: uppercase;
        color: var(--fg);
    }
    span {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
`;

const Lane = styled.div`
    position: relative;
    height: ${CANVAS_H * SCALE}px;
`;

const Runner = styled.div`
    position: absolute;
    left: 0;
    bottom: -2px;
    will-change: transform;
`;

const Track = styled.div`
    position: relative;
    height: 1.6rem;
    margin: var(--b) var(--b) 2rem;
    background-color: var(--bg);
    ${pixelFrame("var(--line-2)")};

    &::before {
        content: "";
        position: absolute;
        inset: 3px;
        ${blockPattern("var(--surface-3)")};
    }
`;

const Fill = styled.div`
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: 0;
    ${blockPattern("var(--accent)")};
`;

const Canvas = styled.canvas`
    display: block;
    width: 100%;
    height: clamp(22rem, 38vh, 40rem);
`;

const LEGEND = [
    {
        kind: "check",
        label: "Check",
        text: "Two neighbours are compared.",
        color: "var(--color-step-check)",
    },
    {
        kind: "swap",
        label: "Swap",
        text: "Out of order, so they trade places.",
        color: "var(--color-step-swap)",
    },
    {
        kind: "done",
        label: "Sorted",
        text: "Every value is where it belongs.",
        color: "var(--color-step-finish)",
    },
];

/*
 * A live insertion sort on loop, colored exactly like the playground:
 * the legend lights up the step being drawn, the fox runs along the
 * progress bar and hops at the finish. Plays only while on screen and
 * never takes over the scroll.
 */
function ScrubScene(): JSX.Element {
    const rootRef = useRef<HTMLElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const runnerRef = useRef<HTMLDivElement | null>(null);
    const fillRef = useRef<HTMLDivElement | null>(null);
    const countRef = useRef<HTMLElement | null>(null);
    const [moving, setMoving] = useState<boolean>(true);

    useGSAP(
        () => {
            const root = rootRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!root || !canvas || !ctx) return;
            const colors = readBarColors();
            let width = 0;
            let height = 0;
            let shown = -1;

            const sizeCanvas = (): void => {
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                width = canvas.offsetWidth;
                height = canvas.offsetHeight;
                canvas.width = Math.round(width * dpr);
                canvas.height = Math.round(height * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                shown = -1;
            };

            const render = (progress: number): void => {
                const index = Math.round(progress * LAST);
                if (index === shown) return;
                shown = index;
                const step = STEPS[index];
                drawBlockBars(ctx, step, colors, {
                    width,
                    height,
                    block: 10,
                    gap: 3,
                });
                const kind = step.kind === "initial" ? "check" : step.kind;
                root.querySelectorAll<HTMLElement>("[data-kind]").forEach(
                    (el) => {
                        el.dataset.active = String(el.dataset.kind === kind);
                    }
                );
                if (countRef.current) {
                    countRef.current.textContent = String(index).padStart(
                        3,
                        "0"
                    );
                }
                const track = fillRef.current?.parentElement;
                if (track && fillRef.current) {
                    const inner = track.offsetWidth - 6;
                    fillRef.current.style.width = `${Math.round((progress * inner) / 8) * 8}px`;
                }
                if (runnerRef.current && track) {
                    const spriteW = CANVAS_W * SCALE;
                    const x = Math.max(
                        0,
                        Math.min(
                            track.offsetWidth - spriteW,
                            progress * track.offsetWidth - spriteW / 2
                        )
                    );
                    runnerRef.current.style.transform = `translateX(${Math.round(x / 2) * 2}px)`;
                }
            };

            sizeCanvas();
            render(0);

            // Plays by itself while on screen: sort, hold the result, reshuffle.
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                let index = 0;
                let acc = 0;
                let last = 0;
                let holdUntil = 0;
                let visible = false;
                let frame = 0;
                const loop = (now: number): void => {
                    frame = requestAnimationFrame(loop);
                    if (!visible) {
                        last = 0;
                        return;
                    }
                    const dt = last ? Math.min(100, now - last) : 0;
                    last = now;
                    if (holdUntil) {
                        if (now < holdUntil) return;
                        holdUntil = 0;
                        index = 0;
                        setMoving(true);
                    }
                    acc += dt;
                    while (acc >= STEP_MS && index < LAST) {
                        acc -= STEP_MS;
                        index += 1;
                    }
                    render(index / LAST);
                    if (index >= LAST) {
                        holdUntil = now + HOLD_MS;
                        setMoving(false);
                    }
                };
                frame = requestAnimationFrame(loop);
                const observer = new IntersectionObserver(([entry]) => {
                    visible = entry.isIntersecting;
                });
                observer.observe(canvas);
                const onResize = (): void => {
                    sizeCanvas();
                    render(index / LAST);
                };
                window.addEventListener("resize", onResize);
                return () => {
                    cancelAnimationFrame(frame);
                    observer.disconnect();
                    window.removeEventListener("resize", onResize);
                };
            });
            mm.add("(prefers-reduced-motion: reduce)", () => {
                render(1);
            });
        },
        { scope: rootRef }
    );

    return (
        <Section
            ref={rootRef}
            id="how"
            tabIndex={-1}
            aria-labelledby="how-title"
        >
            <Pin data-pin>
                <div>
                    <Eyebrow>(01) How it reads</Eyebrow>
                    <SplitWords
                        as={Title}
                        id="how-title"
                        reveal="section"
                        text="Every step, in color."
                    />
                    <Legend>
                        {LEGEND.map((item) => (
                            <Item
                                key={item.kind}
                                $color={item.color}
                                data-kind={item.kind}
                                data-active="false"
                            >
                                <i aria-hidden="true" />
                                <b>{item.label}</b>
                                <span>{item.text}</span>
                            </Item>
                        ))}
                    </Legend>
                    <Counter aria-hidden="true">
                        <small>Step</small>
                        <strong ref={countRef}>000</strong>
                        <small>/ {String(LAST).padStart(3, "0")}</small>
                    </Counter>
                </div>
                <Panel aria-label="An insertion sort playing step by step">
                    <PanelHead>
                        <strong>Insertion</strong>
                        <span>avg O(n²) · stable · in place</span>
                    </PanelHead>
                    <Lane aria-hidden="true">
                        <Runner ref={runnerRef}>
                            <PixelSprite
                                animal="fox"
                                state={moving ? "run" : "done"}
                                scale={SCALE}
                            />
                        </Runner>
                    </Lane>
                    <Track aria-hidden="true">
                        <Fill ref={fillRef} />
                    </Track>
                    <Canvas ref={canvasRef} aria-hidden="true" />
                </Panel>
            </Pin>
        </Section>
    );
}

export default ScrubScene;
