import { JSX, useCallback, useEffect, useRef, type MouseEvent } from "react";
import styled from "styled-components";
import { POINTS_MAX, type PointsInput } from "../../../../utils/pointsInput";

/*
 * Hull points, big: click empty space to add a point, click a point to
 * remove it. Edits a draft; the editor's Done applies it. Same mapping as the geometry worker (padding, capped
 * stretch), so the picture matches the panels.
 */

const PAD = 20;
const HIT = 12;

const Surface = styled.div`
    position: relative;
    flex: 1;
    min-height: 0;
    cursor: crosshair;

    canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
    }
`;

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
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const hoverRef = useRef<number>(-1);

    const draw = useCallback((): void => {
        const surface = surfaceRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!surface || !canvas || !ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const w = surface.offsetWidth;
        const h = surface.offsetHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const css = getComputedStyle(document.documentElement);
        const v = (name: string): string => css.getPropertyValue(name).trim();
        const { spanX, spanY, left } = mapping(w, h);
        ctx.strokeStyle = v("--line");
        ctx.strokeRect(left, PAD, spanX, spanY);
        input.points.forEach((p, i) => {
            const x = Math.round(left + p.x * spanX);
            const y = Math.round(PAD + p.y * spanY);
            ctx.fillStyle =
                i === hoverRef.current
                    ? v("--danger")
                    : v("--color-step-default");
            ctx.fillRect(x - 5, y - 5, 10, 10);
        });
    }, [input]);

    useEffect(() => {
        draw();
        const surface = surfaceRef.current;
        if (!surface) return;
        const observer = new ResizeObserver(draw);
        observer.observe(surface);
        return () => observer.disconnect();
    }, [draw]);

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
