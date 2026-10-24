import { JSX, useEffect, useRef, type PointerEvent } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled from "styled-components";
import type { AppDispatch, RootState } from "../../store";
import {
    CELL_EMPTY,
    CELL_MUD,
    CELL_WALL,
    cellAt,
    gridLayout,
} from "../../utils/grid";
import {
    getBrush,
    moveGridMarker,
    paintGridCells,
    stopAnimation,
    type GridBrush,
} from "./playSlice";

const Layer = styled.div`
    position: absolute;
    inset: 0;
    z-index: 1;
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
        pointer-events: none;
    }
`;

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

/* A drag paints the brush's material, or clears it if it starts on it. */
function paintValue(brush: GridBrush, current: number): number {
    if (brush === "erase") return CELL_EMPTY;
    const material = brush === "wall" ? CELL_WALL : CELL_MUD;
    return current === material ? CELL_EMPTY : material;
}

/*
 * Interactive layer over a path panel: drag to paint walls or mud, drag
 * the start or the end to move it. Strokes preview on a light canvas and
 * are applied once, on release, so every panel recomputes only once.
 * Uses the same layout function as the worker, so cells line up exactly.
 */
function GridEditor({ label }: { label: string }): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const brush = useSelector<RootState, GridBrush>(getBrush);
    const layerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const dragRef = useRef<Drag | null>(null);

    const grid = () => store.getState().play.inputs.path.value;

    // Keep the preview canvas at device resolution.
    useEffect(() => {
        const layer = layerRef.current;
        const canvas = canvasRef.current;
        if (!layer || !canvas) return;
        const fit = (): void => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.round(layer.offsetWidth * dpr);
            canvas.height = Math.round(layer.offsetHeight * dpr);
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(layer);
        return () => observer.disconnect();
    }, []);

    const layout = () => {
        const layer = layerRef.current;
        if (!layer) return null;
        const { cols, rows } = grid();
        return {
            rect: layer.getBoundingClientRect(),
            layout: gridLayout(
                cols,
                rows,
                layer.offsetWidth,
                layer.offsetHeight
            ),
            cols,
            rows,
        };
    };

    const cellFrom = (event: PointerEvent<HTMLDivElement>): number => {
        const info = layout();
        if (!info) return -1;
        return cellAt(
            info.layout,
            info.cols,
            info.rows,
            event.clientX - info.rect.left,
            event.clientY - info.rect.top
        );
    };

    const preview = (hover: number): void => {
        const canvas = canvasRef.current;
        const info = layout();
        const ctx = canvas?.getContext("2d");
        if (!canvas || !info || !ctx) return;
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const { layout: l, cols } = info;
        const size = l.cell - l.gap;
        const css = getComputedStyle(document.documentElement);
        const v = (name: string): string => css.getPropertyValue(name).trim();
        const box = (cell: number, fill: string, alpha: number): void => {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = fill;
            ctx.fillRect(
                l.x + (cell % cols) * l.cell,
                l.y + Math.floor(cell / cols) * l.cell,
                size,
                size
            );
            ctx.globalAlpha = 1;
        };
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
                v(
                    drag.marker === "start"
                        ? "--color-path-start"
                        : "--color-path-end"
                ),
                0.85
            );
        } else if (hover >= 0) {
            box(hover, v("--fg"), 0.18);
        }
    };

    const onDown = (event: PointerEvent<HTMLDivElement>): void => {
        if (event.button !== 0) return;
        const cell = cellFrom(event);
        if (cell < 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        if (store.getState().play.animation.status === "playing") {
            dispatch(stopAnimation());
        }
        const { start, end, cells } = grid();
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
        preview(cell);
    };

    const onMove = (event: PointerEvent<HTMLDivElement>): void => {
        const cell = cellFrom(event);
        const drag = dragRef.current;
        if (!drag) {
            const { start, end } = grid();
            event.currentTarget.dataset.over =
                cell === start || cell === end ? "marker" : "cell";
            preview(cell);
            return;
        }
        if (cell < 0) return;
        if (drag.kind === "paint") {
            cellsBetween(drag.last, cell, grid().cols).forEach((c) =>
                drag.cells.add(c)
            );
            drag.last = cell;
        } else {
            drag.cell = cell;
        }
        preview(cell);
    };

    const onUp = (event: PointerEvent<HTMLDivElement>): void => {
        const drag = dragRef.current;
        dragRef.current = null;
        delete event.currentTarget.dataset.dragging;
        if (drag?.kind === "paint") {
            dispatch(
                paintGridCells({ cells: [...drag.cells], value: drag.value })
            );
        } else if (drag?.kind === "marker") {
            dispatch(moveGridMarker({ marker: drag.marker, cell: drag.cell }));
        }
        preview(-1);
    };

    return (
        <Layer
            ref={layerRef}
            data-no-observe
            role="img"
            aria-label={`${label} on the grid. Drag to draw walls, drag the start or end to move them.`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={() => !dragRef.current && preview(-1)}
        >
            <canvas ref={canvasRef} aria-hidden="true" />
        </Layer>
    );
}

export default GridEditor;
