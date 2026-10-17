"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JSX, useEffect, useRef } from "react";
import styled from "styled-components";
import PlayTheme from "../../styles/PlayTheme";
import { setFx, useFx } from "../play/pixel/fx/fxStore";
import AlgorithmRail from "./AlgorithmRail";
import BuildLog from "./BuildLog";
import FinalCta from "./FinalCta";
import Hero from "./Hero";
import LandingGlobal from "./LandingGlobal";
import PaceSection from "./PaceSection";
import PixelCursor from "./PixelCursor";
import Preloader from "./Preloader";
import ScrubScene from "./ScrubScene";
import SiteHeader from "./SiteHeader";
import useSmoothScroll from "./useSmoothScroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Main = styled.main`
    position: relative;
    color: var(--fg-2);
    background-color: var(--bg);

    section:focus {
        outline: none;
    }
`;

const SkipLink = styled.a`
    position: fixed;
    top: 0.8rem;
    left: 0.8rem;
    z-index: 500;
    padding: 0.8rem 1.2rem;
    background-color: var(--accent);
    color: var(--accent-ink);
    font-family: var(--f-label);
    transform: translateY(-200%);

    &:focus-visible {
        transform: none;
    }
`;

/*
 * Landing page, same "Bitmap Instrument" world as /play: pixel type and
 * frames, step colors as the only accents, motion in discrete steps.
 * Story: wordmark → scroll scrubs a sort → the algorithms → the pace
 * animals → how it is built → open the playground.
 */
function Landing(): JSX.Element {
    const rootRef = useRef<HTMLElement | null>(null);
    const ready = useFx((fx) => fx.introDone);
    useSmoothScroll();

    useEffect(
        () => () => {
            setFx({ introDone: false });
        },
        []
    );

    // Section headings: words step up out of their masks, once.
    useGSAP(
        () => {
            if (!ready) return;
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                gsap.utils
                    .toArray<HTMLElement>("[data-reveal='section']")
                    .forEach((heading) => {
                        gsap.from(heading.querySelectorAll("[data-word]"), {
                            yPercent: 110,
                            duration: 0.45,
                            ease: "steps(6)",
                            stagger: 0.07,
                            scrollTrigger: {
                                trigger: heading,
                                start: "top 85%",
                                once: true,
                            },
                        });
                    });
                ScrollTrigger.refresh();
            });
        },
        { scope: rootRef, dependencies: [ready] }
    );

    return (
        <>
            <PlayTheme />
            <LandingGlobal />
            <SkipLink href="#how">Skip to content</SkipLink>
            <SiteHeader />
            <Main ref={rootRef}>
                <Hero />
                <ScrubScene />
                <AlgorithmRail />
                <PaceSection />
                <BuildLog />
                <FinalCta />
            </Main>
            <PixelCursor />
            <Preloader />
        </>
    );
}

export default Landing;
