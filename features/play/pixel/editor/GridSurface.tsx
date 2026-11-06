import { JSX, useCallback, useRef, type PointerEvent } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { Surface, useCanvasSurface, type Paint } from "./surface";
import type { RootState } from "../../../../store";
import type { FillInput } from "../../../../utils/fillInput";
import {
    CELL_EMPTY,
    CELL_MUD,
    CELL_WALL,
    cellAt,
    gridLayout,
    type GridInput,
} from "../../../../utils/grid";
import type { LifeInput } from "../../../../utils/lifeInput";
import { getBrush, type GridBrush } from "../../playSlice";

/*
 * Drawing surface for grid inputs (path, fill, life). Drag to paint, a stroke
 * starting on a painted cell erases, drag a marker to move it.
 */

export type GridKind = "path" | "fill" | "life";
export type GridDraft = GridInput | FillInput | LifeInput;

const GridCanvas = styled(Surface)`
    touch-action: none;

    &[data-over="marker"] {
        cursor: grab;
    }
`;

type View = {
    cols: number;
    rows: number;
    cells: number[];
    markers: Array<{ name: "start" | "end"; cell: number }>;
};

type Drag =
    | { kind: "paint"; value: number; cells: Set<number>; last: number }
    | { kind: "marker"; name: "start" | "end"; cell: number };

function viewOf(kind: GridKind, draft: GridDraft): View {
    if (kind === "path") {
        const v = draft as GridInput;
        return {
            cols: v.cols,
            rows: v.rows,
            cells: v.cells,
            markers: [
                { name: "start", cell: v.start },
                { name: "end", cell: v.end },
            ],
        };
    }
    if (kind === "fill") {
        const v = draft as FillInput;
        return {
            cols: v.cols,
            rows: v.rows,
            cells: v.walls,
            markers: [{ name: "start", cell: v.start }],
        };
    }
    const v = draft as LifeInput;
    return { cols: v.cols, rows: v.rows, cells: v.cells, markers: [] };
}

/* Same rules as the store: markers are never painted over, a marker dropped
   on a wall clears it, two markers never share a cell. */
function applyDrag(kind: GridKind, draft: GridDraft, drag: Drag): GridDraft {
    const view = viewOf(kind, draft);
    const markerCells = new Set(view.markers.map((m) => m.cell));
    const cells = view.cells.slice();
    if (drag.kind === "marker") {
        if (markerCells.has(drag.cell)) return draft;
        if (cells[drag.cell] === CELL_WALL) cells[drag.cell] = CELL_EMPTY;
        if (kind === "path") {
            return { ...(draft as GridInput), cells, [drag.name]: drag.cell };
        }
        return { ...(draft as FillInput), walls: cells, start: drag.cell };
    }
    drag.cells.forEach((cell) => {
        if (!markerCells.has(cell)) cells[cell] = drag.value;
    });
    if (kind === "path") return { ...(draft as GridInput), cells };
    if (kind === "fill") return { ...(draft as FillInput), walls: cells };
    return { ...(draft as LifeInput), cells };
}

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

/* What a stroke paints, decided by the first cell it touches. */
function strokeValue(
    kind: GridKind,
    brush: GridBrush,
    current: number
): number {
    if (kind !== "path") return current ? 0 : 1;
    if (brush === "erase") return CELL_EMPTY;
    const material = brush === "wall" ? CELL_WALL : CELL_MUD;
    return current === material ? CELL_EMPTY : material;
}

function GridSurface({
    kind,
    value,
    onChange,
}: {
    kind: GridKind;
    value: GridDraft;
    onChange: (next: GridDraft) => void;
}): JSX.Element {
    const brush = useSelector<RootState, GridBrush>(getBrush);
    const dragRef = useRef<Drag | null>(null);
    const hoverRef = useRef<number>(-1);

    const paint = useCallback<Paint>(
        (ctx, w, h, color) => {
            const view = viewOf(kind, value);
            const l = gridLayout(view.cols, view.rows, w, h);
            const size = l.cell - l.gap;
            const colorOf = (cell: number): string => {
                if (kind === "life")
                    return color(
                        cell ? "--color-path-end" : "--color-path-empty"
                    );
                if (cell === CELL_WALL) return color("--color-path-wall");
                if (cell === CELL_MUD) return color("--color-path-mud-dot");
                return color("--color-path-empty");
            };
            const box = (cell: number, fill: string): void => {
                ctx.fillStyle = fill;
                ctx.fillRect(
                    l.x + (cell % view.cols) * l.cell,
                    l.y + Math.floor(cell / view.cols) * l.cell,
                    size,
                    size
                );
            };
            const drag = dragRef.current;
            const painted = drag?.kind === "paint" ? drag : null;
            view.cells.forEach((cellValue, cell) =>
                box(
                    cell,
                    colorOf(
                        painted?.cells.has(cell) ? painted.value : cellValue
                    )
                )
            );
            view.markers.forEach(({ name, cell }) => {
                const at =
                    drag?.kind === "marker" && drag.name === name
                        ? drag.cell
                        : cell;
                box(
                    at,
                    color(
                        name === "start"
                            ? "--color-path-start"
                            : "--color-path-end"
                    )
                );
            });
            if (!drag && hoverRef.current >= 0) {
                ctx.globalAlpha = 0.25;
                box(hoverRef.current, color("--fg"));
                ctx.globalAlpha = 1;
            }
        },
        [kind, value]
    );
    const { surfaceRef, canvasRef, draw } = useCanvasSurface(paint);

    const cellFrom = (event: PointerEvent<HTMLDivElement>): number => {
        const surface = surfaceRef.current;
        if (!surface) return -1;
        const view = viewOf(kind, value);
        const rect = surface.getBoundingClientRect();
        const l = gridLayout(
            view.cols,
            view.rows,
            surface.offsetWidth,
            surface.offsetHeight
        );
        return cellAt(
            l,
            view.cols,
            view.rows,
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    };

    const onDown = (event: PointerEvent<HTMLDivElement>): void => {
        if (event.button !== 0) return;
        const cell = cellFrom(event);
        if (cell < 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const view = viewOf(kind, value);
        const marker = view.markers.find((m) => m.cell === cell);
        dragRef.current = marker
            ? { kind: "marker", name: marker.name, cell }
            : {
                  kind: "paint",
                  value: strokeValue(kind, brush, view.cells[cell]),
                  cells: new Set([cell]),
                  last: cell,
              };
        draw();
    };

    const onMove = (event: PointerEvent<HTMLDivElement>): void => {
        const cell = cellFrom(event);
        const drag = dragRef.current;
        if (!drag) {
            hoverRef.current = cell;
            event.currentTarget.dataset.over = viewOf(kind, value).markers.some(
                (m) => m.cell === cell
            )
                ? "marker"
                : "cell";
            draw();
            return;
        }
        if (cell < 0) return;
        if (drag.kind === "paint") {
            cellsBetween(drag.last, cell, viewOf(kind, value).cols).forEach(
                (c) => drag.cells.add(c)
            );
            drag.last = cell;
        } else {
            drag.cell = cell;
        }
        draw();
    };

    const onUp = (): void => {
        const drag = dragRef.current;
        dragRef.current = null;
        if (!drag) return;
        onChange(applyDrag(kind, value, drag));
    };

    return (
        <GridCanvas
            ref={surfaceRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={() => {
                hoverRef.current = -1;
                if (!dragRef.current) draw();
            }}
        >
            <canvas ref={canvasRef} aria-hidden="true" />
        </GridCanvas>
    );
}

export default GridSurface;
