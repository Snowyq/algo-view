import { JSX, useCallback, useRef, type MouseEvent } from "react";
import { Surface, useCanvasSurface, type Paint } from "./surface";
import { POINTS_MAX, type PointsInput } from "../../../../utils/pointsInput";

/*
 * Hull points: click empty space to add one, click a point to remove it.
 * Uses the geometry worker's mapping so the picture matches the panels.
 */

const PAD = 20;
const HIT = 12;

function mapping(w: number, h: number) {
    const spanY = h - PAD * 2;
    const spanX = Math.min(w - PAD * 2, spanY * 1.8);
    const left = (w - spanX) / 2;
    return { spanX, spanY, left };
}

function PointsSurface({
    value: input,
    onChange,
}: {
    value: PointsInput;
    onChange: (next: PointsInput) => void;
}): JSX.Element {
    const hoverRef = useRef<number>(-1);

    const paint = useCallback<Paint>(
        (ctx, w, h, color) => {
            const { spanX, spanY, left } = mapping(w, h);
            ctx.strokeStyle = color("--line");
            ctx.strokeRect(left, PAD, spanX, spanY);
            input.points.forEach((p, i) => {
                const x = Math.round(left + p.x * spanX);
                const y = Math.round(PAD + p.y * spanY);
                ctx.fillStyle = color(
                    i === hoverRef.current ? "--danger" : "--color-step-default"
                );
                ctx.fillRect(x - 5, y - 5, 10, 10);
            });
        },
        [input]
    );
    const { surfaceRef, canvasRef, draw } = useCanvasSurface(paint);

    const pointAt = (event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const { spanX, spanY, left } = mapping(rect.width, rect.height);
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const hit = input.points.findIndex(
            (p) =>
                Math.hypot(left + p.x * spanX - x, PAD + p.y * spanY - y) <= HIT
        );
        return { hit, nx: (x - left) / spanX, ny: (y - PAD) / spanY };
    };

    const onClick = (event: MouseEvent<HTMLDivElement>): void => {
        const { hit, nx, ny } = pointAt(event);
        let points = input.points;
        if (hit >= 0) {
            if (points.length <= 3) return;
            points = points.filter((_, i) => i !== hit);
        } else {
            if (points.length >= POINTS_MAX) return;
            if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
            const round = (value: number): number =>
                Math.round(value * 1000) / 1000;
            // A hair off the grid, so no three points line up exactly.
            points = [
                ...points,
                { x: round(nx) + 0.0004, y: round(ny) + 0.0007 },
            ];
        }
        hoverRef.current = -1;
        onChange({ points });
    };

    return (
        <Surface
            ref={surfaceRef}
            onClick={onClick}
            onMouseMove={(event) => {
                const { hit } = pointAt(event);
                if (hit !== hoverRef.current) {
                    hoverRef.current = hit;
                    draw();
                }
            }}
        >
            <canvas ref={canvasRef} aria-hidden="true" />
        </Surface>
    );
}

export default PointsSurface;
