"use client";

import { JSX, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    LIBRARY_COLLAPSE,
    PLAY_LAYOUT_BREAKPOINT,
} from "../../../constants/breakpoints";
import useReducedMotion from "../../../hooks/useReducedMotion";
import type { AppDispatch, RootState } from "../../../store";
import PlayTheme from "../../../styles/PlayTheme";
import { getSidebarOpen, setSidebarOpen } from "../playSlice";
import PanelGrid from "./canvas/PanelGrid";
import { getFx, setFx, useFx } from "./fx/fxStore";
import { setRainbow } from "./fx/rainbow";
import { arrive } from "./fx/pageTransition";
import useKonami from "./fx/useKonami";
import ShortcutsOverlay from "./help/ShortcutsOverlay";
import CategoryOverview from "./overview/CategoryOverview";
import Inspector from "./inspector/Inspector";
import PixelIntro from "./intro/PixelIntro";
import Library from "./library/Library";
import useSharedSetup from "./share/useSharedSetup";
import Timeline from "./timeline/Timeline";
import Toolbar from "./toolbar/Toolbar";
import useShortcuts from "./useShortcuts";

/* Font tokens resolve here, under the route layout that loads the faces. */
const Scope = styled.div`
    display: contents;
    font-family: var(--f-body);
    font-size: 1.5rem;
    line-height: 1.45;
    color: var(--fg-2);
`;

const inspectorColumn = ({ $inspector }: { $inspector: boolean }): string =>
    $inspector ? "var(--inspector-w)" : "0px";

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
        ${inspectorColumn};
    grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden;
    background-color: var(--bg);

    & > [data-toolbar] {
        grid-area: toolbar;
    }

    /* after the intro: chrome dithers in, then the algorithm rows one by one */
    &[data-enter="true"] > [data-toolbar],
    &[data-enter="true"] > [data-dock] {
        animation: px-dither-in 260ms both;
    }
    &[data-enter="true"] [data-lib-row] {
        animation: px-dither-in 200ms both;
        animation-delay: calc(120ms + var(--i, 0) * 25ms);
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

    /* no sidebar here; its lists live in the toolbar */
    @media (max-width: ${LIBRARY_COLLAPSE}) {
        grid-template-columns:
            0px
            minmax(0, 1fr)
            ${inspectorColumn};
    }

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        grid-template-areas:
            "toolbar"
            "stage"
            "dock";
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr) auto;
    }
`;

function PlayShell(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const inspectorOpen = useSelector<RootState, boolean>(getSidebarOpen);
    const introDone = useFx((fx) => fx.introDone);
    const reduced = useReducedMotion();

    useSharedSetup();
    // clear the page transition cover, if we arrived through one
    useEffect(() => arrive(), []);
    useShortcuts();

    // small screens start with the inspector (a bottom sheet) closed
    useEffect(() => {
        const breakpoint = Number.parseInt(PLAY_LAYOUT_BREAKPOINT, 10);
        if (window.innerWidth < breakpoint) dispatch(setSidebarOpen(false));
    }, [dispatch]);

    // leaving /play: reset route-only state so a return starts clean
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

    return (
        <Scope>
            <PlayTheme />
            <Shell
                $inspector={inspectorOpen}
                data-enter={introDone && !reduced}
            >
                <Toolbar />
                <Library />
                <main id="main">
                    <PanelGrid />
                </main>
                <Inspector />
                <Timeline />
            </Shell>
            <CategoryOverview />
            <ShortcutsOverlay />
            <PixelIntro />
        </Scope>
    );
}

export default PlayShell;
