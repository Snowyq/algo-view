import gsap from "gsap";
import { JSX, useEffect, useRef } from "react";
import styled from "styled-components";
import { prefersReducedMotion } from "../play/pixel/fx/dom";
import { useFx } from "../play/pixel/fx/fxStore";
import { WORDMARK } from "../play/pixel/toolbar/PixelLogo";

const Svg = styled.svg`
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    color: var(--fg);

    rect {
        transform-box: fill-box;
    }
`;

// Both in pixel cells.
const RADIUS = 5.5;
const PUSH = 1.6;

/* Hero wordmark whose pixels shy away from the pointer (fine pointers only). */
function InteractiveWordmark(): JSX.Element {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const ready = useFx((fx) => fx.introDone);
    const { pixels, width } = WORDMARK;

    // Entrance: pixels drop into place in random order.
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || !ready || prefersReducedMotion()) return;
        const rects = svg.querySelectorAll("rect");
        const tween = gsap.from(rects, {
            y: () => -gsap.utils.random(2, 6, 1),
            opacity: 0,
            duration: 0.5,
            ease: "steps(5)",
            stagger: { each: 0.004, from: "random" },
            clearProps: "opacity",
        });
        return () => {
            tween.kill();
        };
    }, [ready]);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg || prefersReducedMotion()) return;
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
            return;

        const rects = Array.from(svg.querySelectorAll<SVGRectElement>("rect"));
        const movers = rects.map((rect) => ({
            x: gsap.quickTo(rect, "x", { duration: 0.35, ease: "power3.out" }),
            y: gsap.quickTo(rect, "y", { duration: 0.35, ease: "power3.out" }),
            cx: Number(rect.getAttribute("x")) + 0.5,
            cy: Number(rect.getAttribute("y")) + 0.5,
        }));
        const snap = gsap.utils.snap(0.5);
        let box = svg.getBoundingClientRect();
        let frame = 0;
        let px = -999;
        let py = -999;

        const apply = (): void => {
            frame = 0;
            movers.forEach((m) => {
                const dx = m.cx - px;
                const dy = m.cy - py;
                const dist = Math.hypot(dx, dy) || 0.001;
                const force = Math.max(0, 1 - dist / RADIUS) * PUSH;
                m.x(snap((dx / dist) * force));
                m.y(snap((dy / dist) * force));
            });
        };

        const onMove = (event: PointerEvent): void => {
            const scale = box.width / width;
            px = (event.clientX - box.left) / scale;
            py = (event.clientY - box.top) / scale;
            if (!frame) frame = requestAnimationFrame(apply);
        };
        const onLeave = (): void => {
            px = -999;
            py = -999;
            if (!frame) frame = requestAnimationFrame(apply);
        };
        const onResize = (): void => {
            box = svg.getBoundingClientRect();
        };

        const host = svg.closest("section") ?? svg;
        host.addEventListener("pointermove", onMove as EventListener);
        host.addEventListener("pointerleave", onLeave);
        window.addEventListener("scroll", onResize, { passive: true });
        window.addEventListener("resize", onResize);
        window.addEventListener("blur", onLeave);
        return () => {
            cancelAnimationFrame(frame);
            host.removeEventListener("pointermove", onMove as EventListener);
            host.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("scroll", onResize);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("blur", onLeave);
        };
    }, [width]);

    return (
        <Svg
            ref={svgRef}
            data-pixel
            viewBox={`0 0 ${width} 5`}
            role="img"
            aria-label="Algo View"
        >
            {pixels.map((pixel, index) => (
                <rect
                    key={index}
                    x={pixel.x}
                    y={pixel.y}
                    width={1.02}
                    height={1.02}
                    fill={pixel.accent ? "var(--accent)" : "currentColor"}
                />
            ))}
        </Svg>
    );
}

export default InteractiveWordmark;
