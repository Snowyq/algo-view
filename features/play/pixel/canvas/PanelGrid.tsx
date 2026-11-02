import {
    JSX,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type Dispatch,
    type MouseEvent,
    type RefObject,
    type SetStateAction,
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
    getEditorOpen,
    getEvicted,
    getParkedAlgorithms,
    getSidebarOpen,
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
import ResultsCard from "./ResultsCard";
import DataEditor from "../editor/DataEditor";
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
    panelCapacity,
    panelColumns,
} from "./panelLayout";
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

    /* Focus mode: the panel keeps its share, the window takes the rest.
       Other panels stay mounted (state survives) but hidden. */
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

/* Notes about parked and evicted panels, at the bottom of the stage. */
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
    animation: px-dither-in 160ms steps(4) both;

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

/* Closed panels stay in the list, marked exiting, until their exit plays. */
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

const allEntering = (algorithms: ActiveAlgorithm[]): PanelSlot[] =>
    algorithms.map((algo) => ({ algo, exiting: false }));

const panelGridOf = (stage: HTMLElement | null): Element | null =>
    stage?.querySelector("[data-panel-grid]") ?? null;

/*
 * Slots derived during render, so a closing panel is never unmounted early.
 * A new category replaces the stage outright: old panels kept as exiting
 * slots would count in the column maths.
 */
function usePanelSlots(
    visible: ActiveAlgorithm[],
    category: string
): [PanelSlot[], Dispatch<SetStateAction<PanelSlot[]>>] {
    const [slots, setSlots] = useState<PanelSlot[]>(() => allEntering(visible));
    const visibleKey = visible.map((algo) => algo.id).join("|");
    const [prevKey, setPrevKey] = useState<string>(visibleKey);
    const [prevCategory, setPrevCategory] = useState<string>(category);
    if (category !== prevCategory) {
        setPrevCategory(category);
        setPrevKey(visibleKey);
        setSlots(allEntering(visible));
    } else if (visibleKey !== prevKey) {
        setPrevKey(visibleKey);
        setSlots((prev) => mergeSlots(prev, visible));
    }
    return [slots, setSlots];
}

/* Exiting slots get covered in blocks, then dropped. */
function usePanelExits(
    stageRef: RefObject<HTMLDivElement | null>,
    slots: PanelSlot[],
    setSlots: Dispatch<SetStateAction<PanelSlot[]>>,
    category: string,
    reduced: boolean
): void {
    const exitingIds = useRef<Set<string>>(new Set());
    // Running exit covers, so a panel that comes back can be uncovered.
    const exitCovers = useRef<Map<string, () => void>>(new Map());

    // Slots replaced by a category switch never finish their exit.
    useLayoutEffect(() => {
        exitCovers.current.forEach((cancel) => cancel());
        exitCovers.current.clear();
        exitingIds.current.clear();
    }, [category]);

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

            // Drop it only if still leaving: it may have come back meanwhile.
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
    }, [stageRef, slots, setSlots, reduced]);
}

/* Stage content size, ignoring sub-pixel jitter. */
function useStageSize(stageRef: RefObject<HTMLDivElement | null>): {
    width: number;
    height: number;
} {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useLayoutEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize((prev) =>
                Math.abs(prev.width - width) < 1 &&
                Math.abs(prev.height - height) < 1
                    ? prev
                    : { width, height }
            );
        });
        observer.observe(stage);
        return () => observer.disconnect();
    }, [stageRef]);
    return size;
}

/* Reports capacity once the stage width settles, so dragging a window edge
   doesn't park and unpark panels every frame. The first report is instant. */
function useReportCapacity(capacity: number, stageWidth: number): void {
    const dispatch = useDispatch<AppDispatch>();
    const reported = useRef<boolean>(false);
    useEffect(() => {
        if (stageWidth <= 0) return;
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
    }, [capacity, stageWidth, dispatch]);
}

/* Seq of the eviction to announce, cleared after a short while. */
function useEvictedNote(evicted: { seq: number } | null): number {
    const [shown, setShown] = useState<number>(0);
    useEffect(() => {
        if (!evicted) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShown(evicted.seq);
        const id = setTimeout(() => setShown(0), EVICTED_NOTE_MS);
        return () => clearTimeout(id);
    }, [evicted]);
    return shown;
}

type StageNotesProps = {
    parked: ActiveAlgorithm[];
    evictedName: string | null;
};

function StageNotes({ parked, evictedName }: StageNotesProps): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const parkedNames = parked.map((algo) => algo.info.name).join(", ");
    return (
        <Notes role="status">
            {evictedName && (
                <Note>
                    <span>
                        <b>{evictedName}</b> closed to make room
                    </span>
                </Note>
            )}
            {parked.length > 0 && (
                <Note title={parkedNames}>
                    <span>
                        <b>+{parked.length}</b> waiting for room: {parkedNames}
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
    );
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
    const editorOpen = useSelector<RootState, boolean>(getEditorOpen);
    const inspectorOpen = useSelector<RootState, boolean>(getSidebarOpen);
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
    const revealed = useRef<boolean>(false);
    const [slots, setSlots] = usePanelSlots(visible, category);
    usePanelExits(stageRef, slots, setSlots, category, reduced);

    // First appearance waits for the intro, then dissolves in panel by panel.
    useEffect(() => {
        if (!introDone || revealed.current) return;
        revealed.current = true;
        const grid = panelGridOf(stageRef.current);
        if (!grid || reduced) return;
        revealPanels(Array.from(grid.children), 90);
    }, [introDone, reduced]);

    // Opening Input (wide layout) or the window resizes panels in one go:
    // rebuild the visible ones from blocks, before paint, so a canvas never
    // shows its drawing at the old size.
    const prevLayout = useRef({ inspectorOpen, windowId });
    useLayoutEffect(() => {
        const prev = prevLayout.current;
        prevLayout.current = { inspectorOpen, windowId };
        const changed =
            prev.windowId !== windowId ||
            (prev.inspectorOpen !== inspectorOpen && !isMobile);
        if (!changed || reduced) return;
        const grid = panelGridOf(stageRef.current);
        if (!grid) return;
        revealPanels(
            Array.from(grid.children).filter((el) => {
                const { exiting, covered } = (el as HTMLElement).dataset;
                return exiting !== "true" && covered !== "true";
            })
        );
    }, [inspectorOpen, windowId, reduced, isMobile]);

    const handleStageClick = (event: MouseEvent<HTMLDivElement>): void => {
        if ((event.target as HTMLElement).closest("[data-flip-id]")) return;
        dispatch(clearObservedAlgorithm());
    };

    // Stage size drives the layout; panels keep their category's minimum.
    const stageSize = useStageSize(stageRef);
    const gap = isMobile ? GRID_GAP_SMALL : GRID_GAP;
    const pad = isMobile ? GRID_GAP_SMALL : GRID_PAD;
    const box = categoryOf(category).panel;
    const innerWidth = stageSize.width - pad * 2;
    const innerHeight = stageSize.height - pad * 2;
    useReportCapacity(
        panelCapacity(innerWidth, innerHeight, gap, box),
        stageSize.width
    );
    const shownEvicted = useEvictedNote(evicted);

    const focused = windowId !== null;
    const focusLayout =
        stageSize.width >= FOCUS_SIDE_MIN_WIDTH ? "side" : "stack";
    const columns = focused
        ? 1
        : panelColumns(slots.length, innerWidth, innerHeight, gap, box);
    const flipKey = `${slots.map((slot) => slot.algo.id).join("|")}/${columns}`;
    const evictedName =
        evicted && shownEvicted === evicted.seq ? evicted.name : null;

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
            {!focused && !editorOpen && <ResultsCard />}
            {editorOpen && <DataEditor />}
            {!focused && (parked.length > 0 || shownEvicted > 0) && (
                <StageNotes parked={parked} evictedName={evictedName} />
            )}
        </Stage>
    );
}

export default PanelGrid;
