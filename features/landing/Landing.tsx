"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JSX, useEffect, useRef } from "react";
import styled from "styled-components";
import PlayTheme from "../../styles/PlayTheme";
import { setFx, useFx } from "../play/pixel/fx/fxStore";
import { arrive } from "../play/pixel/fx/pageTransition";
import AlgorithmRail from "./AlgorithmRail";
import BuildLog from "./BuildLog";
import { ditherReveal, hideForReveal } from "./ditherReveal";
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

function Landing(): JSX.Element {
    const rootRef = useRef<HTMLElement | null>(null);
    const ready = useFx((fx) => fx.introDone);
    useSmoothScroll();

    useEffect(() => {
        // Clears the cover left by the pixel page transition.
        arrive();
        return () => setFx({ introDone: false });
    }, []);

    // Section headings dither in word by word, once.
    useGSAP(
        () => {
            if (!ready) return;
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                gsap.utils
                    .toArray<HTMLElement>("[data-reveal='section']")
                    .forEach((heading) => {
                        const words = heading.querySelectorAll("[data-word]");
                        hideForReveal(words);
                        ScrollTrigger.create({
                            trigger: heading,
                            start: "top 85%",
                            once: true,
                            onEnter: () =>
                                ditherReveal(words, { stagger: 0.07 }),
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
