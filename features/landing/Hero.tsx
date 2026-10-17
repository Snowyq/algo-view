import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { JSX, useRef } from "react";
import styled from "styled-components";
import { useFx } from "../play/pixel/fx/fxStore";
import PixelButton from "../play/pixel/primitives/PixelButton";
import PixelIcon from "../play/pixel/primitives/PixelIcon";
import { labelText } from "../play/pixel/primitives/pixel";
import InteractiveWordmark from "./InteractiveWordmark";
import SortStrip from "./SortStrip";
import SplitWords from "./SplitWords";

gsap.registerPlugin(useGSAP);

const Section = styled.section`
    position: relative;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: clamp(2.4rem, 4vh, 4.8rem);
    min-height: 100svh;
    padding: 10.4rem clamp(1.6rem, 3vw, 3.2rem) 0;
    overflow: hidden;
    background-image: radial-gradient(var(--line) 1px, transparent 1px);
    background-size: 16px 16px;
`;

const Meta = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 1.6rem;
    ${labelText};
    color: var(--fg-3);

    b {
        color: var(--accent);
        font-weight: 400;
    }

    @media (max-width: 640px) {
        flex-direction: column;
    }
`;

const Copy = styled.div`
    display: grid;
    gap: 2.4rem;
    align-items: end;

    @media (min-width: 960px) {
        grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
        gap: 4.8rem;
    }
`;

const Title = styled.h1`
    font-family: var(--f-display);
    font-weight: 400;
    font-size: clamp(4.8rem, 2rem + 6.4vw, 12rem);
    line-height: 0.82;
    text-transform: uppercase;
    color: var(--fg);
    max-width: 15ch;
    text-wrap: balance;
`;

const Aside = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2.4rem;
`;

const Lead = styled.p`
    font-size: clamp(1.6rem, 1.2rem + 0.5vw, 2rem);
    line-height: 1.45;
    color: var(--fg-2);
    max-width: 44ch;
    text-wrap: pretty;
`;

const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
`;

const Cue = styled.p`
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    ${labelText};
    font-size: 1rem;
    color: var(--fg-4);

    svg {
        animation: px-blink 1.2s steps(1) infinite;
    }
`;

const Ground = styled.div`
    margin: 0 calc(clamp(1.6rem, 3vw, 3.2rem) * -1);
`;

function Hero(): JSX.Element {
    const rootRef = useRef<HTMLElement | null>(null);
    const ready = useFx((fx) => fx.introDone);

    // Words step up out of their masks, then the supporting copy arrives.
    useGSAP(
        () => {
            if (!ready) return;
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                gsap.timeline({ defaults: { ease: "steps(6)" } })
                    .from("[data-reveal='hero'] [data-word]", {
                        yPercent: 110,
                        duration: 0.5,
                        stagger: 0.06,
                    })
                    .from(
                        "[data-hero-fade]",
                        {
                            opacity: 0,
                            y: 12,
                            duration: 0.4,
                            ease: "steps(4)",
                            stagger: 0.06,
                        },
                        "-=0.2"
                    );
            });
        },
        { scope: rootRef, dependencies: [ready] }
    );

    return (
        <Section ref={rootRef} aria-labelledby="hero-title">
            <Meta data-hero-fade>
                <span>
                    <b>●</b> Sorting visualizer, step by step
                </span>
                <span>19 algorithms · 9 speeds · 1 shared input</span>
            </Meta>
            <InteractiveWordmark />
            <Copy>
                <SplitWords
                    as={Title}
                    id="hero-title"
                    reveal="hero"
                    text="Watch sorting algorithms think."
                />
                <Aside>
                    <Lead data-hero-fade>
                        Run several sorts side by side on the same input and
                        step through every comparison and swap. Canvas and Web
                        Workers draw; React only drives the controls.
                    </Lead>
                    <Actions data-hero-fade>
                        <PixelButton
                            as={Link}
                            href="/play"
                            $variant="primary"
                            $size="lg"
                        >
                            Open the playground
                            <PixelIcon name="stepFwd" scale={2} />
                        </PixelButton>
                        <PixelButton as="a" href="#how" $size="lg">
                            See how it reads
                        </PixelButton>
                    </Actions>
                    <Cue data-hero-fade>
                        <PixelIcon name="chevronDown" scale={1} />
                        Scroll down
                    </Cue>
                </Aside>
            </Copy>
            <Ground>
                <SortStrip />
            </Ground>
        </Section>
    );
}

export default Hero;
