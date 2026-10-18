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
    getActiveAlgorithms,
    getActiveCategory,
    type ActiveAlgorithm,
} from "../../playSlice";
import CursorTrail from "../fx/CursorTrail";
import { useFx } from "../fx/fxStore";
import { pixelWipe } from "../fx/pixelWipe";
import AlgorithmPanel from "./AlgorithmPanel";
import EmptyStage from "./EmptyStage";
import FlipGrid, { revealPanels } from "./FlipGrid";

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
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
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
    const visible = isMobile ? active.slice(0, 3) : active;

    const stageRef = useRef<HTMLDivElement | null>(null);
    const exitingIds = useRef<Set<string>>(new Set());
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
            if (!slot.exiting || exitingIds.current.has(id)) return;
            exitingIds.current.add(id);

            const remove = (): void => {
                exitingIds.current.delete(id);
                setSlots((prev) => prev.filter((s) => s.algo.id !== id));
            };

            const el = stage.querySelector<HTMLElement>(
                `[data-flip-id="${id}"]`
            );
            if (!el || reduced) {
                remove();
                return;
            }
            pixelWipe(el, {
                mode: "cover",
                color: "--bg",
                block: 16,
                duration: 300,
                frames: 6,
                keep: true,
            }).done.then(remove);
        });
    }, [slots, reduced]);

    const handleStageClick = (event: MouseEvent<HTMLDivElement>): void => {
        if ((event.target as HTMLElement).closest("[data-flip-id]")) return;
        dispatch(clearObservedAlgorithm());
    };

    const flipKey = slots.map((slot) => slot.algo.id).join("|");

    return (
        <Stage ref={stageRef} onClick={handleStageClick} data-stage>
            <CursorTrail />
            <FlipGrid
                flipKey={flipKey}
                reduced={reduced}
                twoColumns={slots.length > 2}
            >
                {slots.map(({ algo, exiting }) => {
                    const registry: AlgorithmRegistryItem | undefined =
                        registryApi.getAlgorithmRegistry(category, algo.id);
                    if (!registry) return null;
                    return (
                        <Slot
                            key={algo.id}
                            data-flip-id={algo.id}
                            data-exiting={exiting}
                            aria-hidden={exiting || undefined}
                        >
                            <AlgorithmPanel registry={registry} />
                        </Slot>
                    );
                })}
            </FlipGrid>
            {slots.length === 0 && <EmptyStage />}
        </Stage>
    );
}

export default PanelGrid;
