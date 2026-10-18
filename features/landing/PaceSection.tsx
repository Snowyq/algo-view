import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JSX, useRef, useState } from "react";
import styled from "styled-components";
import { SORT_ANIMATION_SPEEDS } from "../../config/sort";
import { labelText, pixelFrame } from "../play/pixel/primitives/pixel";
import { ANIMALS } from "../play/pixel/sprites/animals";
import { CANVAS_H, CANVAS_W } from "../play/pixel/sprites/frames";
import PixelSprite from "../play/pixel/sprites/PixelSprite";
import {
    animalForSpeed,
    formatSpeed,
    paceOf,
} from "../play/pixel/sprites/speedAnimals";
import SplitWords from "./SplitWords";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const RUN_SCALE = 4;

const Section = styled.section`
    position: relative;
    display: grid;
    gap: 4rem;
    padding: 14.4rem clamp(1.6rem, 3vw, 3.2rem) 9.6rem;
    border-top: var(--b) solid var(--line);
`;

const Head = styled.div`
    display: grid;
    gap: 2.4rem;

    @media (min-width: 960px) {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: end;
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

const Readout = styled.p`
    display: flex;
    align-items: baseline;
    gap: 1.6rem;

    strong {
        font-family: var(--f-display);
        font-weight: 400;
        font-size: clamp(8rem, 4rem + 8vw, 18rem);
        line-height: 0.75;
        color: var(--accent);
        font-variant-numeric: tabular-nums;
    }
    span {
        ${labelText};
        color: var(--fg-3);
        line-height: 1.6;
    }
`;

/* The animal crosses the whole page width at its own pace. */
const Lane = styled.div`
    position: relative;
    height: ${CANVAS_H * RUN_SCALE}px;
    margin: 0 calc(clamp(1.6rem, 3vw, 3.2rem) * -1);
    border-bottom: var(--b) solid var(--line-2);
    overflow: hidden;
`;

const Runner = styled.div`
    position: absolute;
    left: 0;
    bottom: 0;
`;

const Picker = styled.div`
    display: grid;
    grid-template-columns: repeat(9, minmax(0, 1fr));
    gap: 0.8rem;

    @media (max-width: 900px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
`;

const Choice = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 1.2rem 0.4rem 1rem;
    margin: var(--b);
    border: 0;
    background-color: var(--bg-2);
    color: var(--fg-3);
    ${pixelFrame("var(--line)")};

    b {
        font-family: var(--f-display);
        font-weight: 400;
        font-size: 2.4rem;
        line-height: 0.8;
        color: var(--fg);
    }
    span {
        ${labelText};
        font-size: 1rem;
    }

    @media (hover: hover) {
        &:hover {
            ${pixelFrame("var(--fg-3)")};
        }
    }
    &[aria-checked="true"] {
        background-color: var(--surface-2);
        color: var(--fg);
        ${pixelFrame("var(--accent)")};
    }
`;

/* Seconds to cross the page: log-mapped from the playback interval. */
function crossingSeconds(ms: number): number {
    const t = 1 - paceOf(ms, SORT_ANIMATION_SPEEDS);
    return 2.2 * Math.pow(14, t);
}

function PaceSection(): JSX.Element {
    const rootRef = useRef<HTMLElement | null>(null);
    const runnerRef = useRef<HTMLDivElement | null>(null);
    const [speed, setSpeed] = useState<number>(16);
    const [hovered, setHovered] = useState<number | null>(null);
    const animal = ANIMALS[animalForSpeed(speed)];

    // Loop the runner across; only while the section is on screen.
    useGSAP(
        () => {
            const root = rootRef.current;
            const runner = runnerRef.current;
            if (!root || !runner) return;
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                const lane = runner.parentElement as HTMLElement;
                const w = CANVAS_W * RUN_SCALE;
                const tween = gsap.fromTo(
                    runner,
                    { x: -w },
                    {
                        x: () => lane.offsetWidth,
                        duration: crossingSeconds(speed),
                        ease: "none",
                        repeat: -1,
                        paused: true,
                    }
                );
                ScrollTrigger.create({
                    trigger: root,
                    start: "top bottom",
                    end: "bottom top",
                    onToggle: (self) =>
                        self.isActive ? tween.play() : tween.pause(),
                });
            });
            mm.add("(prefers-reduced-motion: reduce)", () => {
                gsap.set(runner, { left: "50%", xPercent: -50 });
            });
        },
        { scope: rootRef, dependencies: [speed], revertOnUpdate: true }
    );

    return (
        <Section
            ref={rootRef}
            id="pace"
            tabIndex={-1}
            aria-labelledby="pace-title"
        >
            <Head>
                <div>
                    <Eyebrow>(03) Pace</Eyebrow>
                    <SplitWords
                        as={Title}
                        id="pace-title"
                        reveal="section"
                        text="Nine speeds. Nine animals."
                    />
                </div>
                <Readout aria-live="polite">
                    <strong>{formatSpeed(speed)}</strong>
                    <span>
                        per step
                        <br />
                        the {animal.name.toLowerCase()} {animal.gait}
                    </span>
                </Readout>
            </Head>
            <Lane aria-hidden="true">
                <Runner ref={runnerRef}>
                    <PixelSprite
                        animal={animal.id}
                        state="run"
                        scale={RUN_SCALE}
                    />
                </Runner>
            </Lane>
            <Picker role="radiogroup" aria-label="Playback speed">
                {SORT_ANIMATION_SPEEDS.map((ms) => {
                    const option = ANIMALS[animalForSpeed(ms)];
                    const active = ms === speed;
                    return (
                        <Choice
                            key={ms}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={`${option.name}, ${formatSpeed(ms)} per step`}
                            onClick={() => setSpeed(ms)}
                            onPointerEnter={() => setHovered(ms)}
                            onPointerLeave={() => setHovered(null)}
                        >
                            <PixelSprite
                                animal={option.id}
                                state={
                                    active || hovered === ms ? "run" : "idle"
                                }
                                scale={2}
                            />
                            <b>{formatSpeed(ms)}</b>
                            <span>{option.name}</span>
                        </Choice>
                    );
                })}
            </Picker>
        </Section>
    );
}

export default PaceSection;
