"use client";

import heroImage from "@/public/playground.webp";
import Button from "@/ui/Button";
import HeroSortCanvas from "@/ui/landing/HeroSortCanvas";
import {
    SectionRail,
    SectionStrip,
    type RailSection,
} from "@/ui/landing/SectionRail";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import Link from "next/link";
import type { JSX, ReactNode } from "react";
import { useRef, useState } from "react";
import { HiArrowRight, HiPause, HiPlay } from "react-icons/hi2";
import styled from "styled-components";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/* ---------- Content (unchanged copy) ---------- */

type CaseSection = { id: string; title: string; body: ReactNode };

const TECH_STACK =
    "React, Next.js, TypeScript, Redux Toolkit, styled-components, Web Workers, OffscreenCanvas.";

const SECTIONS: CaseSection[] = [
    {
        id: "tldr",
        title: "TL;DR",
        body: "Interactive sorting visualizer built for performance and clear UI. It handles multiple concurrent views with arrays of 1000 items on desktop. Rendering lives in Canvas + Web Workers, while React handles interface and control. The architecture is modular and ready for growth with new algorithms and views.",
    },
    {
        id: "goal",
        title: "Goal and scope",
        body: "I built an educational app that lets you compare sorting algorithms step by step. From the start I cared about intuitive UI and smooth animation. I treated it like a product, so tech decisions were made with scale and future features in mind.",
    },
    {
        id: "performance",
        title: "Performance as a starting point",
        body: "The target scenario was demanding: multiple simultaneous views and a shared array to sort (up to 1000 items). That set priorities: the main thread cannot be blocked by drawing, and React should handle UI, not animation.",
    },
    {
        id: "decisions",
        title: "Key decisions and rationale",
        body: "Separation of UI and rendering keeps the interface responsive. Animation sync uses a shared step index and broadcasts ticks instead of heavy payloads. React render count is controlled by limiting step updates in UI. The layout scales to many panels, while mobile limits views for clarity. Controls for play/pause, speed and step are centralized for instant feedback.",
    },
    {
        id: "summary",
        title: "Summary",
        body: "Clear UI and smooth rendering, backed by a modular structure that keeps state consistent and makes new features easy to plug in without rewriting core pieces.",
    },
    {
        id: "stack",
        title: "Tech stack",
        body: TECH_STACK,
    },
];

const lengths = SECTIONS.map((s) =>
    typeof s.body === "string" ? s.body.length : 100
);
const maxLength = Math.max(...lengths);
const RAIL: RailSection[] = SECTIONS.map((s, i) => ({
    id: s.id,
    title: s.title,
    weight: lengths[i] / maxLength,
}));

const LEGEND = [
    { label: "Swap", color: "var(--swap)" },
    { label: "Select", color: "var(--select)" },
    { label: "Check", color: "var(--check)" },
    { label: "Finish", color: "var(--finish)" },
];

/* ---------- Layout ---------- */

const Page = styled.div`
    width: 100%;
    min-height: 100%;

    @media (prefers-reduced-motion: no-preference) {
        html.js & [data-intro] {
            opacity: 0;
            animation: intro-fallback 0s 2.5s forwards;
        }
    }

    @keyframes intro-fallback {
        to {
            opacity: 1;
        }
    }
`;

const Hero = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: var(--space-7);
    min-height: calc(100svh - var(--nav-height));
    padding: var(--space-7) var(--gutter) 0;
    overflow: hidden;
`;

const HeroCopy = styled.div`
    display: grid;
    gap: var(--space-5);
    width: 100%;
    max-width: var(--content-max);
    margin: 0 auto;

    @media (min-width: 960px) {
        grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
        align-items: end;
        gap: var(--space-7);
    }
`;

const H1 = styled.h1`
    font-family: var(--font-display-stack);
    font-variation-settings: "opsz" 72;
    font-weight: 800;
    font-size: var(--text-display);
    line-height: var(--leading-tight);
    letter-spacing: -0.01em;
    text-transform: uppercase;
    text-wrap: wrap;
    color: var(--text);
    max-width: 9ch;

    .word-mask {
        padding-bottom: 0.06em;
        margin-bottom: -0.06em;
    }
`;

const HeroAside = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-5);
    padding-bottom: 0.6rem;
`;

const Lead = styled.p`
    font-size: var(--text-md);
    line-height: 1.55;
    color: var(--text-soft);
    max-width: 44ch;
`;

const CtaArrow = styled(HiArrowRight)`
    width: 1.8rem;
    height: 1.8rem;
    transition: transform var(--dur-base) var(--ease-out);

    a:hover > & {
        transform: translateX(3px);
    }

    @media (prefers-reduced-motion: reduce) {
        a:hover > & {
            transform: none;
        }
    }
`;

const Stage = styled.div`
    width: 100%;
    max-width: var(--content-max);
    margin: 0 auto;
`;

const StageBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
`;

const PauseButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    height: 3.2rem;
    padding: 0 1rem;
    border: 1px solid var(--ink-700);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font-mono-stack);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition:
        color var(--dur-fast) var(--ease-out),
        border-color var(--dur-fast) var(--ease-out);

    svg {
        width: 1.4rem;
        height: 1.4rem;
    }

    @media (hover: hover) {
        &:hover {
            color: var(--text);
            border-color: var(--ink-600);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        display: none;
    }
`;

const Legend = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    font-family: var(--font-mono-stack);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
`;

const LegendItem = styled.li<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);

    &::before {
        content: "";
        width: 0.8rem;
        height: 0.8rem;
        border-radius: 2px;
        background-color: ${({ $color }) => $color};
    }
`;

const Showcase = styled.section`
    padding: var(--space-10) var(--gutter) var(--space-9);
    perspective: 1400px;
`;

const Frame = styled.div`
    max-width: 112rem;
    margin: 0 auto;
    padding: var(--space-2);
    border-radius: calc(var(--radius-lg) + var(--space-2));
    background-color: var(--ink-850);
    border: 1px solid var(--ink-700);
    box-shadow: var(--shadow-3);
    transform-origin: 50% 100%;
    will-change: transform;

    img {
        display: block;
        width: 100%;
        height: auto;
        border-radius: var(--radius-lg);
    }
`;

const CaseStudy = styled.div`
    display: grid;
    gap: var(--space-6);
    max-width: var(--content-max);
    margin: 0 auto;
    padding: 0 var(--gutter) var(--space-10);

    @media (min-width: 960px) {
        grid-template-columns: 26rem minmax(0, 1fr);
        gap: var(--space-9);
    }
`;

const Sections = styled.div`
    display: flex;
    flex-direction: column;
`;

const Section = styled.section`
    display: grid;
    gap: var(--space-4);
    padding: var(--space-7) 0;
    border-top: 1px solid var(--ink-700);
    scroll-margin-top: var(--space-7);

    &:first-child {
        border-top: none;
        padding-top: 0;
    }

    @media (min-width: 1200px) {
        grid-template-columns: 22rem minmax(0, 1fr);
        gap: var(--space-7);
    }
`;

const H2 = styled.h2`
    font-family: var(--font-display-stack);
    font-variation-settings: "opsz" 48;
    font-weight: 700;
    font-size: var(--text-xl);
    line-height: 1;
    letter-spacing: 0;
    text-transform: uppercase;
    color: var(--text);
`;

const Body = styled.p<{ $lead?: boolean }>`
    max-width: 62ch;
    font-size: ${({ $lead }) => ($lead ? "var(--text-lg)" : "var(--text-md)")};
    line-height: ${({ $lead }) => ($lead ? 1.45 : "var(--leading-body)")};
    color: ${({ $lead }) => ($lead ? "var(--text)" : "var(--text-soft)")};
`;

const Chips = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
`;

const Chip = styled.li`
    padding: 0.6rem 1.2rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--ink-700);
    background-color: var(--ink-900);
    font-family: var(--font-mono-stack);
    font-size: var(--text-sm);
    color: var(--text-soft);
`;

const Closing = styled.div`
    display: flex;
    justify-content: flex-start;
    padding-top: var(--space-7);
    border-top: 1px solid var(--ink-700);
`;

/* ---------- Component ---------- */

function TechChips(): JSX.Element {
    const items = TECH_STACK.replace(/\.$/, "").split(", ");
    return (
        <Chips>
            {items.map((item) => (
                <Chip key={item}>{item}</Chip>
            ))}
        </Chips>
    );
}

function Index(): JSX.Element {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [active, setActive] = useState<number>(-1);
    const [paused, setPaused] = useState<boolean>(false);

    useGSAP(
        () => {
            const root = rootRef.current;
            if (!root) return;
            const scroller =
                root.closest<HTMLElement>("[data-scroller]") ?? undefined;

            SECTIONS.forEach((section, index) => {
                ScrollTrigger.create({
                    trigger: `#${section.id}`,
                    scroller,
                    start: "top 55%",
                    end: "bottom 55%",
                    onToggle: (self) => {
                        if (self.isActive) setActive(index);
                    },
                    onLeave: () => {
                        if (index === SECTIONS.length - 1)
                            setActive(SECTIONS.length);
                    },
                    onLeaveBack: () => {
                        if (index === 0) setActive(-1);
                    },
                });
            });

            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                // Reveal containers first; children animate in from below.
                gsap.set("[data-intro]", { opacity: 1, animation: "none" });

                const intro = gsap.timeline({
                    defaults: { ease: "expo.out" },
                });

                const split = SplitText.create("[data-split]", {
                    type: "words",
                    mask: "words",
                    maskClass: "word-mask",
                });

                intro
                    .from(
                        split.words,
                        { yPercent: 110, duration: 1.1, stagger: 0.09 },
                        0.05
                    )
                    .fromTo(
                        "[data-intro-fade]",
                        { opacity: 0, y: 14, filter: "blur(4px)" },
                        {
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                            duration: 0.8,
                            stagger: 0.08,
                            clearProps: "filter,transform",
                        },
                        0.35
                    )
                    .fromTo(
                        "[data-intro-stage]",
                        { opacity: 0 },
                        { opacity: 1, duration: 1.2, ease: "power2.out" },
                        0.5
                    );

                gsap.fromTo(
                    "[data-frame]",
                    { rotateX: 16, scale: 0.9, yPercent: 6 },
                    {
                        rotateX: 0,
                        scale: 1,
                        yPercent: 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: "[data-frame-trigger]",
                            scroller,
                            start: "top bottom",
                            end: "top 20%",
                            scrub: 0.6,
                        },
                    }
                );
            });
        },
        { scope: rootRef }
    );

    return (
        <Page ref={rootRef}>
            <Hero>
                <HeroCopy>
                    <H1 data-split data-intro>
                        Sort Algorithm Visualizer
                    </H1>
                    <HeroAside>
                        <Lead data-intro data-intro-fade>
                            Interactive sorting visualizer focused on
                            performance and clarity. Canvas + Web Workers handle
                            rendering while React stays on UI control.
                        </Lead>
                        <Button
                            as={Link}
                            href="/play"
                            size="large"
                            data-intro
                            data-intro-fade
                        >
                            Open Playground
                            <CtaArrow aria-hidden="true" />
                        </Button>
                    </HeroAside>
                </HeroCopy>
                <Stage data-intro data-intro-stage>
                    <StageBar>
                        <Legend aria-label="Step colors">
                            {LEGEND.map((item) => (
                                <LegendItem
                                    key={item.label}
                                    $color={item.color}
                                >
                                    {item.label}
                                </LegendItem>
                            ))}
                        </Legend>
                        <PauseButton
                            type="button"
                            onClick={() => setPaused((p) => !p)}
                            aria-pressed={paused}
                        >
                            {paused ? (
                                <HiPlay aria-hidden="true" />
                            ) : (
                                <HiPause aria-hidden="true" />
                            )}
                            {paused ? "Play" : "Pause"}
                        </PauseButton>
                    </StageBar>
                    <HeroSortCanvas paused={paused} />
                </Stage>
            </Hero>

            <Showcase data-frame-trigger>
                <Frame data-frame>
                    <Image
                        src={heroImage}
                        alt="Algorithm Visualizer"
                        sizes="(max-width: 1120px) 100vw, 1120px"
                        placeholder="blur"
                    />
                </Frame>
            </Showcase>

            <CaseStudy>
                <SectionRail sections={RAIL} active={active} />
                <Sections>
                    <SectionStrip sections={RAIL} active={active} />
                    {SECTIONS.map((section, index) => (
                        <Section key={section.id} id={section.id}>
                            <H2>{section.title}</H2>
                            {section.id === "stack" ? (
                                <TechChips />
                            ) : (
                                <Body $lead={index === 0}>{section.body}</Body>
                            )}
                        </Section>
                    ))}
                    <Closing>
                        <Button as={Link} href="/play" size="large">
                            Open Playground
                            <CtaArrow aria-hidden="true" />
                        </Button>
                    </Closing>
                </Sections>
            </CaseStudy>
        </Page>
    );
}

export default Index;
