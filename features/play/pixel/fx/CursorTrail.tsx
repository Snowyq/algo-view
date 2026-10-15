import { JSX, useEffect, useRef } from "react";
import styled from "styled-components";
import useReducedMotion from "../../../../hooks/useReducedMotion";

const Canvas = styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
`;

const CELL = 16;
const LIFE = 520;

type Dot = { x: number; y: number; born: number };

/*
 * Moving over the bare stage lights the grid cells under the cursor; they
 * blink out in four steps. Drawn behind the panels, so it only shows in
 * the gaps. Off under reduced motion.
 */
function CursorTrail(): JSX.Element | null {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const reduced = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        const host = canvas?.parentElement;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !host || !ctx || reduced) return;
        if (!window.matchMedia("(hover: hover)").matches) return;

        const color =
            getComputedStyle(host).getPropertyValue("--accent").trim() ||
            "#e8825c";
        let dots: Dot[] = [];
        let frame = 0;
        let lastKey = "";

        const resize = (): void => {
            canvas.width = host.offsetWidth;
            canvas.height = host.offsetHeight;
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(host);

        const draw = (now: number): void => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            dots = dots.filter((dot) => now - dot.born < LIFE);
            dots.forEach((dot) => {
                const age = (now - dot.born) / LIFE;
                const level = 1 - Math.floor(age * 4) / 4;
                ctx.globalAlpha = 0.35 * level;
                ctx.fillStyle = color;
                ctx.fillRect(dot.x + 4, dot.y + 4, CELL - 8, CELL - 8);
            });
            ctx.globalAlpha = 1;
            frame = dots.length > 0 ? requestAnimationFrame(draw) : 0;
        };

        const onMove = (event: PointerEvent): void => {
            const target = event.target as HTMLElement;
            if (target.closest("[data-flip-id], [data-empty-card]")) return;
            const rect = host.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / CELL) * CELL;
            const y = Math.floor((event.clientY - rect.top) / CELL) * CELL;
            const key = `${x}:${y}`;
            if (key === lastKey) return;
            lastKey = key;
            dots.push({ x, y, born: performance.now() });
            if (!frame) frame = requestAnimationFrame(draw);
        };

        host.addEventListener("pointermove", onMove);
        return () => {
            host.removeEventListener("pointermove", onMove);
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [reduced]);

    if (reduced) return null;
    return <Canvas ref={canvasRef} aria-hidden="true" />;
}

export default CursorTrail;
