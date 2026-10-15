"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { JSX, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../../constants/breakpoints";
import useReducedMotion from "../../../hooks/useReducedMotion";
import type { AppDispatch, RootState } from "../../../store";
import PlayTheme from "../../../styles/PlayTheme";
import {
    applyGridConfig,
    applyInputConfig,
    changeCategory,
    setGrid,
    changeSpeed,
    closeAllAlgorithms,
    getSidebarOpen,
    openAlgorithm,
    setSidebarOpen,
} from "../playSlice";
import PanelGrid from "./canvas/PanelGrid";
import { getFx, setFx, useFx } from "./fx/fxStore";
import { setRainbow } from "./fx/rainbow";
import useKonami from "./fx/useKonami";
import ShortcutsOverlay from "./help/ShortcutsOverlay";
import Inspector from "./inspector/Inspector";
import PixelIntro from "./intro/PixelIntro";
import Library from "./library/Library";
import { parseShareUrl } from "./share/shareState";
import Timeline from "./timeline/Timeline";
import Toolbar from "./toolbar/Toolbar";
import useShortcuts from "./useShortcuts";

gsap.registerPlugin(useGSAP);

/* Font tokens resolve here, under the route layout that loads the faces. */
const Scope = styled.div`
    display: contents;
    font-family: var(--f-body);
    font-size: 1.5rem;
    line-height: 1.45;
    color: var(--fg-2);
`;

const Shell = styled.div<{ $inspector: boolean }>`
    position: fixed;
    inset: 0;
    display: grid;
    grid-template-areas:
        "toolbar toolbar toolbar"
        "library stage inspector"
        "dock dock dock";
    grid-template-columns:
        var(--library-w)
        minmax(0, 1fr)
        ${({ $inspector }) => ($inspector ? "var(--inspector-w)" : "0px")};
    grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden;
    background-color: var(--bg);
    font-family: var(--f-body);
    font-size: 1.5rem;
    line-height: 1.45;
    color: var(--fg-2);

    & > [data-toolbar] {
        grid-area: toolbar;
    }
    & > [data-library] {
        grid-area: library;
    }
    & > main {
        grid-area: stage;
        min-width: 0;
        min-height: 0;
    }
    & > [data-inspector] {
        grid-area: inspector;
    }
    & > [data-dock] {
        grid-area: dock;
    }

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        grid-template-areas:
            "toolbar"
            "library"
            "stage"
            "dock";
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto minmax(0, 1fr) auto;
    }
`;

/* Load a shared setup from the URL once, before the first render settles. */
function useSharedSetup(): void {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const setup = parseShareUrl(window.location.search);
        if (!setup) return;
        // Category first: switching it clears the open algorithms.
        if (setup.category) dispatch(changeCategory(setup.category));
        if (setup.input) dispatch(applyInputConfig(setup.input));
        if (setup.grid) {
            dispatch(applyGridConfig(setup.grid.config));
            if (setup.grid.edited) dispatch(setGrid(setup.grid.edited));
        }
        if (setup.speed) dispatch(changeSpeed(setup.speed));
        if (setup.algorithms) {
            dispatch(closeAllAlgorithms());
            setup.algorithms.forEach((id) => dispatch(openAlgorithm(id)));
        }
    }, [dispatch]);
}

function PlayShell(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const inspectorOpen = useSelector<RootState, boolean>(getSidebarOpen);
    const introDone = useFx((fx) => fx.introDone);
    const reduced = useReducedMotion();
    const shellRef = useRef<HTMLDivElement | null>(null);

    useSharedSetup();
    useShortcuts();

    // Small screens start with the Inspector closed (it is a bottom sheet).
    useEffect(() => {
        const breakpoint = Number.parseInt(PLAY_LAYOUT_BREAKPOINT, 10);
        if (window.innerWidth < breakpoint) dispatch(setSidebarOpen(false));
    }, [dispatch]);

    // Leaving /play: drop route-only state so a return starts clean.
    useEffect(
        () => () => {
            setRainbow(false);
            setFx({ rainbow: false, introDone: false, helpOpen: false });
        },
        []
    );

    const unlock = useCallback((): void => {
        const next = !getFx().rainbow;
        setRainbow(next);
        setFx({ rainbow: next, paradeAt: Date.now() });
    }, []);
    useKonami(unlock);

    // Entrance: chrome steps in from the edges once the intro has gone.
    useGSAP(
        () => {
            if (!introDone || reduced) return;
            const tl = gsap.timeline({ defaults: { ease: "steps(5)" } });
            tl.from("[data-toolbar]", { yPercent: -100, duration: 0.25 })
                .from("[data-dock]", { yPercent: 100, duration: 0.3 }, "<")
                .from(
                    "[data-lib-row]",
                    {
                        x: -16,
                        opacity: 0,
                        duration: 0.18,
                        ease: "steps(3)",
                        stagger: 0.025,
                        clearProps: "all",
                    },
                    "-=0.1"
                );
        },
        { scope: shellRef, dependencies: [introDone, reduced] }
    );

    return (
        <Scope>
            <PlayTheme />
            <Shell ref={shellRef} $inspector={inspectorOpen}>
                <Toolbar />
                <Library />
                <main id="main">
                    <PanelGrid />
                </main>
                <Inspector />
                <Timeline />
            </Shell>
            <ShortcutsOverlay />
            <PixelIntro />
        </Scope>
    );
}

export default PlayShell;
