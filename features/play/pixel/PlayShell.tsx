"use client";

import { JSX, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    LIBRARY_COLLAPSE,
    PLAY_LAYOUT_BREAKPOINT,
} from "../../../constants/breakpoints";
import useReducedMotion from "../../../hooks/useReducedMotion";
import type { AppDispatch, RootState } from "../../../store";
import PlayTheme from "../../../styles/PlayTheme";
import {
    applyInput,
    changeCategory,
    setInputValue,
    changeSpeed,
    closeAllAlgorithms,
    getSidebarOpen,
    openAlgorithm,
    setOverviewOpen,
    setSidebarOpen,
} from "../playSlice";
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
import { parseShareUrl } from "./share/shareState";
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

    /* Entrance, once the intro has gone: the chrome dithers in, then the
       algorithm rows one after another. */
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

    /* No sidebar here (its lists live in the toolbar), so the panels and
       Details share the width side by side. */
    @media (max-width: ${LIBRARY_COLLAPSE}) {
        grid-template-columns:
            0px
            minmax(0, 1fr)
            ${({ $inspector }) => ($inspector ? "var(--inspector-w)" : "0px")};
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

/* Load a shared setup from the URL once, before the first render settles. */
function useSharedSetup(): void {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const setup = parseShareUrl(window.location.search);
        // A bare /play starts at the category overview.
        if (!setup) {
            dispatch(setOverviewOpen(true));
            return;
        }
        // Category first: switching it clears the open algorithms.
        dispatch(changeCategory(setup.category));
        if (setup.input) {
            const { category, config, value } = setup.input;
            dispatch(
                applyInput({ category, config } as Parameters<
                    typeof applyInput
                >[0])
            );
            // A hand-edited input (e.g. a drawn map) replaces the recipe's.
            if (value !== undefined) {
                dispatch(
                    setInputValue({ category, value } as Parameters<
                        typeof setInputValue
                    >[0])
                );
            }
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
    // Arrived through the pixel page transition: clear its cover.
    useEffect(() => arrive(), []);
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

    return (
        <Scope>
            <PlayTheme />
            <Shell
                ref={shellRef}
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
