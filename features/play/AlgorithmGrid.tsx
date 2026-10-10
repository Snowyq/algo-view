import gsap from "gsap";
import { JSX, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import type {
    AlgorithmMeta,
    AlgorithmMetrics,
    AlgorithmRegistryItem,
} from "../../algorithms/types";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
import useReducedMotion from "../../hooks/useReducedMotion";
import useWindowSize from "../../hooks/useWindowSize";
import type { AppDispatch, RootState } from "../../store";
import Button from "../../ui/Button";
import AlgorithmPanel from "./AlgorithmPanel";
import FlipGrid from "./FlipGrid";
import {
    clearObservedAlgorithm,
    setSidebarOpen,
    setSidebarTab,
    getActiveAlgorithms,
    getActiveCategory,
} from "./playSlice";

/* A plotting surface: faint dot grid, fading out toward the edges. */
const StyledPlayViewArea = styled.div`
    height: 100%;
    width: 100%;
    position: relative;
    background-color: var(--ink-950);

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: radial-gradient(
            circle,
            var(--ink-700) 1px,
            transparent 1.2px
        );
        background-size: 2.4rem 2.4rem;
        background-position: 1.2rem 1.2rem;
        mask-image: radial-gradient(
            ellipse 80% 70% at 50% 45%,
            #000 30%,
            transparent 100%
        );
        opacity: 0.7;
        pointer-events: none;
    }
`;

const EmptyState = styled.div`
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: var(--space-6);
    animation: empty-in 320ms var(--ease-out);

    @keyframes empty-in {
        from {
            opacity: 0;
            transform: translateY(6px);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        animation-name: none;
    }
`;

const EmptyCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    max-width: 34rem;
    text-align: center;

    h2 {
        font-family: var(--font-display-stack);
        font-variation-settings: "opsz" 48;
        font-weight: 700;
        font-size: 3.2rem;
        line-height: 1;
        text-transform: uppercase;
        color: var(--text);
    }

    p {
        font-size: var(--text-sm);
        line-height: 1.6;
        color: var(--text-muted);
    }
`;

/* Three idle bars: the same shapes the canvas will draw once you pick. */
const EmptyMark = styled.span`
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 3.2rem;

    i {
        width: 0.8rem;
        border-radius: 2px 2px 0 0;
        background-color: var(--color-step-default);
    }
    i:nth-child(1) {
        height: 45%;
    }
    i:nth-child(2) {
        height: 100%;
        background-color: var(--swap);
    }
    i:nth-child(3) {
        height: 70%;
    }
`;

const Slot = styled.div`
    min-width: 0;
    min-height: 0;
    transform-origin: 50% 50%;

    &[data-exiting="true"] {
        pointer-events: none;
    }
`;

type ActiveAlgorithm = {
    id: string;
    info: AlgorithmMeta;
    stepsLength: number;
    metrics?: AlgorithmMetrics;
};

type PanelSlot = { algo: ActiveAlgorithm; exiting: boolean };

/*
 * Keeps closed panels mounted while they animate out, so the grid can
 * play an exit before the remaining panels glide into the freed space.
 */
function mergeSlots(prev: PanelSlot[], next: ActiveAlgorithm[]): PanelSlot[] {
    const nextIds = new Set(next.map((algo) => algo.id));
    const result: PanelSlot[] = next.map((algo) => ({ algo, exiting: false }));
    prev.forEach((slot, index) => {
        if (nextIds.has(slot.algo.id)) return;
        const at = Math.min(index, result.length);
        result.splice(at, 0, { algo: slot.algo, exiting: true });
    });
    return result;
}

const EXIT = { duration: 0.22, ease: "power2.in" };

function AlgorithmGrid(): JSX.Element {
    const activeAlgorithms = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const activeCategory = useSelector<RootState, string>(getActiveCategory);
    const { size } = useWindowSize();
    const reduced = useReducedMotion();
    const breakpointValue = Number.parseInt(PLAY_LAYOUT_BREAKPOINT, 10);
    const isMobile: boolean =
        Number.isFinite(breakpointValue) && size.width < breakpointValue;
    const visibleAlgorithms = isMobile
        ? activeAlgorithms.slice(0, 3)
        : activeAlgorithms;

    const dispatch = useDispatch<AppDispatch>();
    const areaRef = useRef<HTMLDivElement | null>(null);
    const exitingIds = useRef<Set<string>>(new Set());

    // Derive slots during render so a closing panel is never unmounted early.
    const [slots, setSlots] = useState<PanelSlot[]>(() =>
        visibleAlgorithms.map((algo) => ({ algo, exiting: false }))
    );
    const visibleKey = visibleAlgorithms.map((algo) => algo.id).join("|");
    const [prevKey, setPrevKey] = useState<string>(visibleKey);
    if (visibleKey !== prevKey) {
        setPrevKey(visibleKey);
        setSlots((prev) => mergeSlots(prev, visibleAlgorithms));
    }

    // Exit: fade the closed panel, then drop it so FlipGrid reflows the rest.
    useLayoutEffect(() => {
        const area = areaRef.current;
        if (!area) return;
        slots.forEach((slot) => {
            const { id } = slot.algo;
            if (!slot.exiting || exitingIds.current.has(id)) return;
            exitingIds.current.add(id);

            const remove = (): void => {
                exitingIds.current.delete(id);
                setSlots((prev) => prev.filter((s) => s.algo.id !== id));
            };

            const el = area.querySelector<HTMLElement>(
                `[data-flip-id="${id}"]`
            );
            if (!el || reduced) {
                remove();
                return;
            }
            gsap.to(el, {
                opacity: 0,
                scale: 0.94,
                ...EXIT,
                onComplete: remove,
            });
        });
    }, [slots, reduced]);

    // Clicking the space between panels stops following an algorithm.
    const handleAreaClick = (event: MouseEvent<HTMLDivElement>): void => {
        if ((event.target as HTMLElement).closest("[data-flip-id]")) return;
        dispatch(clearObservedAlgorithm());
    };

    const flipKey = slots.map((slot) => slot.algo.id).join("|");

    return (
        <StyledPlayViewArea ref={areaRef} onClick={handleAreaClick}>
            <FlipGrid
                flipKey={flipKey}
                reduced={reduced}
                twoColumns={slots.length > 2}
            >
                {slots.map(({ algo, exiting }) => {
                    const registry: AlgorithmRegistryItem | undefined =
                        registryApi.getAlgorithmRegistry(
                            activeCategory,
                            algo.id
                        );
                    if (!registry) return null;
                    return (
                        <Slot
                            key={algo.id}
                            data-flip-id={algo.id}
                            data-exiting={exiting}
                            aria-hidden={exiting || undefined}
                        >
                            <AlgorithmPanel
                                registry={registry}
                                category={activeCategory}
                            />
                        </Slot>
                    );
                })}
            </FlipGrid>
            {slots.length === 0 && (
                <EmptyState>
                    <EmptyCard>
                        <EmptyMark aria-hidden="true">
                            <i />
                            <i />
                            <i />
                        </EmptyMark>
                        <h2>Nothing to sort yet</h2>
                        <p>
                            Pick one or more algorithms to compare them step by
                            step on the same input.
                        </p>
                        <Button
                            size="medium"
                            onClick={() => {
                                dispatch(setSidebarTab("selection"));
                                dispatch(setSidebarOpen(true));
                            }}
                        >
                            Choose algorithms
                        </Button>
                    </EmptyCard>
                </EmptyState>
            )}
        </StyledPlayViewArea>
    );
}

export default AlgorithmGrid;
