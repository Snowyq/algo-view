import {
    JSX,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type MouseEvent,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../../../algorithms/algorithmsRegistryApi";
import type { AlgorithmRegistryItem } from "../../../../algorithms/types";
import { PLAY_LAYOUT_BREAKPOINT } from "../../../../constants/breakpoints";
import useReducedMotion from "../../../../hooks/useReducedMotion";
import useWindowSize from "../../../../hooks/useWindowSize";
import type { AppDispatch, RootState } from "../../../../store";
import {
    clearObservedAlgorithm,
    closeAlgorithm,
    getActiveCategory,
    getEvicted,
    getParkedAlgorithms,
    getVisibleAlgorithms,
    getWindowAlgorithmId,
    setPanelCapacity,
    type ActiveAlgorithm,
} from "../../playSlice";
import CursorTrail from "../fx/CursorTrail";
import { useFx } from "../fx/fxStore";
import { pixelWipe } from "../fx/pixelWipe";
import AlgorithmPanel from "./AlgorithmPanel";
import AlgorithmWindow from "./AlgorithmWindow";
import EmptyStage from "./EmptyStage";
import { categoryOf } from "../../categories";
import FlipGrid, {
    GRID_GAP,
    GRID_GAP_SMALL,
    GRID_PAD,
    revealPanels,
} from "./FlipGrid";
import {
    FOCUS_SHARE,
    FOCUS_SIDE_MIN_WIDTH,
    FOCUS_SIDE_SHARE,
} from "./focusShare";
import { panelCapacity, panelColumns } from "./panelLayout";
import { labelText, pixelFrame } from "../primitives/pixel";

const EVICTED_NOTE_MS = 2600;
const CAPACITY_SETTLE_MS = 250;

/* The stage: a 4px dot grid, the same grid everything snaps to. */
const Stage = styled.div`
    position: relative;
    height: 100%;
    width: 100%;
    min-height: 0;
    background-color: var(--bg);
    background-image: radial-gradient(var(--line) 1px, transparent 1px);
    background-size: 16px 16px;
    background-position: 8px 8px;
    overflow: hidden;

    /* Focus mode: the clicked panel keeps the top (stacked) or left (side)
       share, the window takes the rest; other panels stay mounted (their
       state survives) but out of sight, and the panel's own counters move
       into the window. */
    &[data-window="stack"] [data-panel-grid] {
        height: ${FOCUS_SHARE};
    }
    &[data-window="side"] [data-panel-grid] {
        width: ${FOCUS_SIDE_SHARE};
    }
    &[data-window] [data-covered="true"] {
        display: none;
    }
    &[data-window] [data-metrics-bar] {
        display: none;
    }
`;

/* Parked panels and "closed to make room": small pixel notes at the
   bottom of the stage. */
const Notes = styled.div`
    position: absolute;
    left: 50%;
    bottom: 1.2rem;
    z-index: 4;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    max-width: calc(100% - 2.4rem);
    translate: -50% 0;
    pointer-events: none;
`;

/* The chip's one action: an inline pixel link-button. */
const NoteAction = styled.button`
    flex: 0 0 auto;
    padding: 0.3rem 0.6rem;
    margin-left: 0.4rem;
    border: 0;
    background-color: var(--surface-3);
    color: var(--fg);
    ${labelText};
    font-size: 1rem;

    @media (hover: hover) {
        &:hover {
            background-color: var(--danger);
            color: var(--bg);
        }
    }
`;

const Note = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    max-width: 100%;
    padding: 0.6rem 1rem;
    background-color: var(--surface-2);
    color: var(--fg-2);
    ${labelText};
    font-size: 1rem;
    pointer-events: auto;
    ${pixelFrame("var(--line-2)")};
    animation: px-drop-in 160ms steps(4) both;

    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    b {
        font-weight: 400;
        color: var(--accent);
    }
`;

const Slot = styled.div`
    position: relative;
    min-width: 0;
    min-height: 0;
    padding: var(--b);

    &[data-exiting="true"] {
        pointer-events: none;
    }
`;

type PanelSlot = { algo: ActiveAlgorithm; exiting: boolean };

/*
 * Keeps closed panels mounted while they dissolve, so the grid can play
 * an exit before the remaining panels glide into the freed space.
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

function PanelGrid(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    // Only panels that fit get a slot; the rest are parked (see playSlice).
    const visible = useSelector<RootState, ActiveAlgorithm[]>(
        getVisibleAlgorithms
    );
    const parked = useSelector<RootState, ActiveAlgorithm[]>(
        getParkedAlgorithms
    );
    const evicted = useSelector(getEvicted);
    const windowId = useSelector<RootState, string | null>(
        getWindowAlgorithmId
    );
    const category = useSelector<RootState, string>(getActiveCategory);
    const introDone = useFx((fx) => fx.introDone);
    const { size } = useWindowSize();
    const reduced = useReducedMotion();
    const breakpoint = Number.parseInt(PLAY_LAYOUT_BREAKPOINT, 10);
    const isMobile =
        size.width > 0 &&
        Number.isFinite(breakpoint) &&
        size.width < breakpoint;

    const stageRef = useRef<HTMLDivElement | null>(null);
    const exitingIds = useRef<Set<string>>(new Set());
    // Running exit covers, so a panel that comes back can be uncovered.
    const exitCovers = useRef<Map<string, () => void>>(new Map());
    const revealed = useRef<boolean>(false);

    // Derive slots during render so a closing panel is never unmounted early.
    const [slots, setSlots] = useState<PanelSlot[]>(() =>
        visible.map((algo) => ({ algo, exiting: false }))
    );
    const visibleKey = visible.map((algo) => algo.id).join("|");
    const [prevKey, setPrevKey] = useState<string>(visibleKey);
    if (visibleKey !== prevKey) {
        setPrevKey(visibleKey);
        setSlots((prev) => mergeSlots(prev, visible));
    }

    // First appearance waits for the intro, then dissolves in panel by panel.
    useEffect(() => {
        if (!introDone || revealed.current) return;
        revealed.current = true;
        const grid = stageRef.current?.querySelector("[data-panel-grid]");
        if (!grid || reduced) return;
        revealPanels(Array.from(grid.children), 90);
    }, [introDone, reduced]);

    // Exit: cover the closed panel in blocks, then drop it.
    useLayoutEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        slots.forEach((slot) => {
            const { id } = slot.algo;
            // Back before its exit finished: lift the cover, keep it.
            if (!slot.exiting && exitCovers.current.has(id)) {
                exitCovers.current.get(id)?.();
                exitCovers.current.delete(id);
                exitingIds.current.delete(id);
                return;
            }
            if (!slot.exiting || exitingIds.current.has(id)) return;
            exitingIds.current.add(id);

            // Only drop it if it is still leaving: a panel parked and back
            // again mid-animation (window resized both ways) must stay.
            const remove = (): void => {
                exitingIds.current.delete(id);
                setSlots((prev) =>
                    prev.filter((s) => !(s.algo.id === id && s.exiting))
                );
            };

            const el = stage.querySelector<HTMLElement>(
                `[data-flip-id="${id}"]`
            );
            if (!el || reduced) {
                remove();
                return;
            }
            const wipe = pixelWipe(el, {
                mode: "cover",
                color: "--bg",
                block: 16,
                duration: 300,
                frames: 6,
                keep: true,
            });
            exitCovers.current.set(id, wipe.cancel);
            wipe.done.then(() => {
                if (!exitCovers.current.has(id)) return;
                exitCovers.current.delete(id);
                remove();
            });
        });
    }, [slots, reduced]);

    const handleStageClick = (event: MouseEvent<HTMLDivElement>): void => {
        if ((event.target as HTMLElement).closest("[data-flip-id]")) return;
        dispatch(clearObservedAlgorithm());
    };

    // Stage size drives the layout; panels keep their category's minimum.
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
    useLayoutEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setStageSize((prev) =>
                Math.abs(prev.width - width) < 1 &&
                Math.abs(prev.height - height) < 1
                    ? prev
                    : { width, height }
            );
        });
        observer.observe(stage);
        return () => observer.disconnect();
    }, []);
    const wide = !isMobile;
    const gap = wide ? GRID_GAP : GRID_GAP_SMALL;
    const pad = wide ? GRID_PAD : GRID_GAP_SMALL;
    const box = categoryOf(category).panel;
    const innerWidth = stageSize.width - pad * 2;
    const innerHeight = stageSize.height - pad * 2;

    // How many panels this stage holds; the store parks or evicts by it.
    // Reported once the size settles, so dragging a window edge doesn't
    // send panels in and out on every frame. The first report is instant.
    const capacity = panelCapacity(innerWidth, innerHeight, gap, box);
    const reported = useRef<boolean>(false);
    useEffect(() => {
        if (stageSize.width <= 0) return;
        if (!reported.current) {
            reported.current = true;
            dispatch(setPanelCapacity(capacity));
            return;
        }
        const id = setTimeout(
            () => dispatch(setPanelCapacity(capacity)),
            CAPACITY_SETTLE_MS
        );
        return () => clearTimeout(id);
    }, [capacity, stageSize.width, dispatch]);

    // "Closed X to make room" shows briefly after an automatic close.
    const [shownEvicted, setShownEvicted] = useState<number>(0);
    useEffect(() => {
        if (!evicted) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShownEvicted(evicted.seq);
        const id = setTimeout(() => setShownEvicted(0), EVICTED_NOTE_MS);
        return () => clearTimeout(id);
    }, [evicted]);

    const focused = windowId !== null;
    const focusLayout =
        stageSize.width >= FOCUS_SIDE_MIN_WIDTH ? "side" : "stack";
    const columns = focused
        ? 1
        : panelColumns(slots.length, innerWidth, innerHeight, gap, box);
    const flipKey = `${slots.map((slot) => slot.algo.id).join("|")}/${columns}`;

    return (
        <Stage
            ref={stageRef}
            onClick={handleStageClick}
            data-stage
            data-window={focused ? focusLayout : undefined}
        >
            <CursorTrail />
            <FlipGrid flipKey={flipKey} reduced={reduced} columns={columns}>
                {slots.map(({ algo, exiting }) => {
                    const registry: AlgorithmRegistryItem | undefined =
                        registryApi.getAlgorithmRegistry(category, algo.id);
                    if (!registry) return null;
                    return (
                        <Slot
                            key={algo.id}
                            data-flip-id={algo.id}
                            data-exiting={exiting}
                            data-covered={focused && algo.id !== windowId}
                            aria-hidden={exiting || undefined}
                        >
                            <AlgorithmPanel registry={registry} />
                        </Slot>
                    );
                })}
            </FlipGrid>
            {slots.length === 0 && <EmptyStage />}
            <AlgorithmWindow />
            {!focused && (parked.length > 0 || shownEvicted > 0) && (
                <Notes role="status">
                    {evicted && shownEvicted === evicted.seq && (
                        <Note>
                            <span>
                                <b>{evicted.name}</b> closed to make room
                            </span>
                        </Note>
                    )}
                    {parked.length > 0 && (
                        <Note
                            title={parked
                                .map((algo) => algo.info.name)
                                .join(", ")}
                        >
                            <span>
                                <b>+{parked.length}</b> waiting for room:{" "}
                                {parked
                                    .map((algo) => algo.info.name)
                                    .join(", ")}
                            </span>
                            <NoteAction
                                type="button"
                                onClick={() =>
                                    parked.forEach((algo) =>
                                        dispatch(closeAlgorithm(algo.id))
                                    )
                                }
                            >
                                Close {parked.length > 1 ? "them" : "it"}
                            </NoteAction>
                        </Note>
                    )}
                </Notes>
            )}
        </Stage>
    );
}

export default PanelGrid;
