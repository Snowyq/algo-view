import { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

/* Shared canvas plumbing for the editor's drawing surfaces. */

export const Surface = styled.div`
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

/** Reads a CSS custom property from the theme. */
export type ThemeColor = (name: string) => string;

export type Paint = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: ThemeColor
) => void;

/** Keeps the canvas sized to its surface and repaints on resize. */
export function useCanvasSurface(paint: Paint) {
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const draw = useCallback((): void => {
        const surface = surfaceRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!surface || !canvas || !ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const w = surface.offsetWidth;
        const h = surface.offsetHeight;
        if (canvas.width !== Math.round(w * dpr))
            canvas.width = Math.round(w * dpr);
        if (canvas.height !== Math.round(h * dpr))
            canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const css = getComputedStyle(document.documentElement);
        paint(ctx, w, h, (name) => css.getPropertyValue(name).trim());
    }, [paint]);

    useEffect(() => {
        draw();
        const surface = surfaceRef.current;
        if (!surface) return;
        const observer = new ResizeObserver(draw);
        observer.observe(surface);
        return () => observer.disconnect();
    }, [draw]);

    return { surfaceRef, canvasRef, draw };
}
