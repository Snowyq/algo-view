import {
    JSX,
    useEffect,
    useRef,
    useState,
    type PointerEvent,
    type RefObject,
} from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled from "styled-components";
import type {
    AlgorithmMetrics,
    AlgorithmRegistryItem,
} from "../../algorithms/types";
import useOnResize from "../../hooks/useOnResize";
import useReducedMotion from "../../hooks/useReducedMotion";
import useSortCanvas, { getStepColors } from "../../hooks/useSortCanvas";
import type { AppDispatch, RootState } from "../../store";
import {
    CELL_EMPTY,
    CELL_MUD,
    CELL_WALL,
    cellAt,
    gridLayout,
    type GridInput,
} from "../../utils/grid";
import PixelLoader from "./pixel/canvas/PixelLoader";
import { PALETTE_EVENT } from "./pixel/fx/rainbow";
import { pixelWipe } from "./pixel/fx/pixelWipe";
import {
    decrementSortWorkerLoading,
    getBrush,
    getGrid,
    incrementSortWorkerLoading,
    moveGridMarker,
    paintGridCells,
    passAlgorithmInfo,
    setSortWorkerReady,
    stopAnimation,
    type GridBrush,
} from "./playSlice";
import type { StepInfo } from "./stepLegend";

const Container = styled.div`
    position: relative;
    display: flex;
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding-top: 1.2rem;
`;

const Sizer = styled.div`
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    touch-action: none;
    cursor: crosshair;

    &[data-over="marker"] {
        cursor: grab;
    }
    &[data-dragging="marker"] {
        cursor: grabbing;
    }
    canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
    }
`;

const LoaderOverlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
`;

type Props = {
    registry: AlgorithmRegistryItem;
    onMetricsUpdate?: (metrics: AlgorithmMetrics | null) => void;
    onStepMetricsUpdate?: (metrics: AlgorithmMetrics | null) => void;
    onStepInfoUpdate?: (info: StepInfo | null) => void;
};

type RenderDonePayload = { stepsLength?: number; metrics?: AlgorithmMetrics };
type StepMetricsPayload = {
    metrics?: AlgorithmMetrics;
    stepType?: string;
    instructionId?: string[];
};

type Drag =
    | { kind: "paint"; value: number; cells: Set<number>; last: number }
    | { kind: "marker"; marker: "start" | "end"; cell: number };

/* Every cell on the straight line between two cells (Bresenham). */
function cellsBetween(a: number, b: number, cols: number): number[] {
    let x0 = a % cols;
    let y0 = Math.floor(a / cols);
    const x1 = b % cols;
    const y1 = Math.floor(b / cols);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    const out: number[] = [];
    for (;;) {
        out.push(y0 * cols + x0);
        if (x0 === x1 && y0 === y1) break;
        const e2 = err * 2;
        if (e2 >= dy) {
            err += dy;
            x0 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y0 += sy;
        }
    }
    return out;
}

/* What a drag starting on `cell` paints: toggles the brush's material. */
function paintValue(brush: GridBrush, current: number): number {
    if (brush === "erase") return CELL_EMPTY;
    const material = brush === "wall" ? CELL_WALL : CELL_MUD;
    return current === material ? CELL_EMPTY : material;
}

/*
 * Path-finding panel canvas. The worker computes the search and draws
 * it; this component feeds it the shared grid and lets you edit that
 * grid in place: drag to paint walls or mud, drag a marker to move the
 * start or the end. Strokes preview on a light overlay and are applied
 * once, on release, so every panel recomputes only once.
 */
function PathVisualizerCanvas({
    registry,
    onMetricsUpdate,
    onStepMetricsUpdate,
    onStepInfoUpdate,
}: Props): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const grid = useSelector<RootState, GridInput>(getGrid);
    const brush = useSelector<RootState, GridBrush>(getBrush);
    const reduced = useReducedMotion();

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayRef = useRef<HTMLCanvasElement | null>(null);
    const sizerRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<Drag | null>(null);
    const pendingLoadsRef = useRef<number>(0);
    const wasLoadingRef = useRef<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { worker, changeSize, renderAlgorithm, onStatusType, changeColors } =
        useSortCanvas(canvasRef, registry.id, "pathCanvasWorker.ts");

    useEffect(() => {
        const onPalette = (): void => changeColors(getStepColors());
        window.addEventListener(PALETTE_EVENT, onPalette);
        return () => window.removeEventListener(PALETTE_EVENT, onPalette);
    }, [changeColors]);

    const onResize = (ref: RefObject<HTMLDivElement | null>): void => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        changeSize(rect);
        const overlay = overlayRef.current;
        if (overlay) {
            const dpr = window.devicePixelRatio || 1;
            overlay.width = Math.round(rect.width * dpr);
            overlay.height = Math.round(rect.height * dpr);
        }
    };
    useOnResize(onResize, sizerRef);

    useEffect((): void => {
        dispatch(setSortWorkerReady(Boolean(worker)));
    }, [dispatch, worker]);

    useEffect((): void => {
        if (!worker || !sizerRef.current) return;
        const rect = sizerRef.current.getBoundingClientRect();
        pendingLoadsRef.current += 1;
        dispatch(incrementSortWorkerLoading());
        onStepMetricsUpdate?.(null);
        renderAlgorithm(grid, {}, rect);
    }, [grid, worker, renderAlgorithm, dispatch, onStepMetricsUpdate]);

    // A finished render dissolves in from blocks instead of popping in.
    useEffect((): void => {
        const wasLoading = wasLoadingRef.current;
        wasLoadingRef.current = isLoading;
        if (!wasLoading || isLoading || reduced || !sizerRef.current) return;
        pixelWipe(sizerRef.current, {
            mode: "reveal",
            color: "--surface",
            block: 12,
            duration: 280,
            frames: 5,
        });
    }, [isLoading, reduced]);

    useEffect((): void => {
        onStatusType("mounted", () => dispatch(setSortWorkerReady(true)));
        onStatusType("canvas-initialized", () =>
            dispatch(setSortWorkerReady(true))
        );
        onStatusType("render-start", () => setIsLoading(true));
        onStatusType("render-done", (payload) => {
            const { stepsLength, metrics } = (payload ?? {}) as RenderDonePayload;
            if (typeof stepsLength === "number") {
                dispatch(
                    passAlgorithmInfo({ id: registry.id, stepsLength, metrics })
                );
            }
            onMetricsUpdate?.(metrics ?? null);
            setIsLoading(false);
            if (pendingLoadsRef.current > 0) {
                pendingLoadsRef.current -= 1;
                dispatch(decrementSortWorkerLoading());
            }
        });
        onStatusType("step-metrics", (payload) => {
            if (!payload) return;
            const { metrics, stepType, instructionId } =
                payload as StepMetricsPayload;
            onStepMetricsUpdate?.(metrics ?? null);
            onStepInfoUpdate?.(
                stepType ? { type: stepType, instructionId: instructionId ?? [] } : null
            );
        });
    }, [
        onStatusType,
        registry,
        dispatch,
        onMetricsUpdate,
        onStepMetricsUpdate,
        onStepInfoUpdate,
    ]);

    useEffect(
        () => () => {
            const pending = pendingLoadsRef.current;
            pendingLoadsRef.current = 0;
            for (let i = 0; i < pending; i += 1) {
                dispatch(decrementSortWorkerLoading());
            }
        },
        [dispatch]
    );

    // ---------- Editing ----------

    const layoutNow = () => {
        const sizer = sizerRef.current;
        if (!sizer) return null;
        const { cols, rows } = store.getState().play.grid;
        return {
            rect: sizer.getBoundingClientRect(),
            layout: gridLayout(cols, rows, sizer.offsetWidth, sizer.offsetHeight),
            cols,
            rows,
        };
    };

    const cellFromEvent = (event: PointerEvent<HTMLDivElement>): number => {
        const info = layoutNow();
        if (!info) return -1;
        return cellAt(
            info.layout,
            info.cols,
            info.rows,
            event.clientX - info.rect.left,
            event.clientY - info.rect.top
        );
    };

    /* Preview strokes and hover on a cheap main-thread overlay. */
    const paintOverlay = (hover: number): void => {
        const overlay = overlayRef.current;
        const info = layoutNow();
        const ctx = overlay?.getContext("2d");
        if (!overlay || !info || !ctx) return;
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        const { layout, cols } = info;
        const size = layout.cell - layout.gap;
        const box = (cell: number, fill: string, alpha = 1): void => {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = fill;
            ctx.fillRect(
                layout.x + (cell % cols) * layout.cell,
                layout.y + Math.floor(cell / cols) * layout.cell,
                size,
                size
            );
            ctx.globalAlpha = 1;
        };
        const css = getComputedStyle(document.documentElement);
        const v = (name: string): string => css.getPropertyValue(name).trim();
        const drag = dragRef.current;
        if (drag?.kind === "paint") {
            const fill =
                drag.value === CELL_WALL
                    ? v("--color-path-wall")
                    : drag.value === CELL_MUD
                      ? v("--color-path-mud-dot")
                      : v("--color-path-empty");
            drag.cells.forEach((cell) => box(cell, fill, 0.9));
        } else if (drag?.kind === "marker") {
            box(
                drag.cell,
                v(drag.marker === "start" ? "--color-path-start" : "--color-path-end"),
                0.85
            );
        } else if (hover >= 0) {
            box(hover, v("--fg"), 0.18);
        }
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
        if (event.button !== 0) return;
        const cell = cellFromEvent(event);
        if (cell < 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        if (store.getState().play.animation.status === "playing") {
            dispatch(stopAnimation());
        }
        const { start, end, cells } = store.getState().play.grid;
        if (cell === start || cell === end) {
            dragRef.current = {
                kind: "marker",
                marker: cell === start ? "start" : "end",
                cell,
            };
            event.currentTarget.dataset.dragging = "marker";
        } else {
            dragRef.current = {
                kind: "paint",
                value: paintValue(brush, cells[cell]),
                cells: new Set([cell]),
                last: cell,
            };
        }
        paintOverlay(cell);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
        const cell = cellFromEvent(event);
        const drag = dragRef.current;
        if (!drag) {
            const { start, end } = store.getState().play.grid;
            event.currentTarget.dataset.over =
                cell === start || cell === end ? "marker" : "cell";
            paintOverlay(cell);
            return;
        }
        if (cell < 0) return;
        if (drag.kind === "paint") {
            const { cols } = store.getState().play.grid;
            cellsBetween(drag.last, cell, cols).forEach((c) => drag.cells.add(c));
            drag.last = cell;
        } else {
            drag.cell = cell;
        }
        paintOverlay(cell);
    };

    const finish = (event: PointerEvent<HTMLDivElement>): void => {
        const drag = dragRef.current;
        dragRef.current = null;
        delete event.currentTarget.dataset.dragging;
        if (drag?.kind === "paint") {
            dispatch(paintGridCells({ cells: [...drag.cells], value: drag.value }));
        } else if (drag?.kind === "marker") {
            dispatch(moveGridMarker({ marker: drag.marker, cell: drag.cell }));
        }
        paintOverlay(-1);
    };

    return (
        <Container data-no-observe>
            <Sizer
                ref={sizerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finish}
                onPointerCancel={finish}
                onPointerLeave={() => !dragRef.current && paintOverlay(-1)}
                aria-label={`${registry.meta.name} on the grid. Drag to draw walls, drag the start or end to move them.`}
                role="img"
            >
                {isLoading && (
                    <LoaderOverlay>
                        <PixelLoader label="Searching" />
                    </LoaderOverlay>
                )}
                <canvas ref={canvasRef} />
                <canvas ref={overlayRef} aria-hidden="true" />
            </Sizer>
        </Container>
    );
}

export default PathVisualizerCanvas;
