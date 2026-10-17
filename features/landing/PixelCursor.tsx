import gsap from "gsap";
import { JSX, useEffect, useRef, useState } from "react";
import styled from "styled-components";

const Box = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    z-index: 400;
    width: 1.2rem;
    height: 1.2rem;
    margin: -0.6rem 0 0 -0.6rem;
    pointer-events: none;
    background-color: var(--accent);
    mix-blend-mode: difference;
    transition:
        width 120ms steps(3),
        height 120ms steps(3),
        margin 120ms steps(3),
        background-color 120ms steps(2);

    &[data-hover="true"] {
        width: 4.4rem;
        height: 4.4rem;
        margin: -2.2rem 0 0 -2.2rem;
        background-color: transparent;
        box-shadow:
            0 -3px 0 0 var(--accent),
            0 3px 0 0 var(--accent),
            -3px 0 0 0 var(--accent),
            3px 0 0 0 var(--accent);
    }
    &[data-hidden="true"] {
        opacity: 0;
    }
`;

/*
 * A pixel block that trails the pointer on a 4px grid and opens into a
 * notched frame over anything clickable. Additive: the native cursor
 * stays, it is off on touch and under reduced motion.
 */
function PixelCursor(): JSX.Element | null {
    const ref = useRef<HTMLDivElement | null>(null);
    const [enabled, setEnabled] = useState<boolean>(false);

    useEffect(() => {
        const ok =
            window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEnabled(ok);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!enabled || !el) return;
        const snap = gsap.utils.snap(4);
        const toX = gsap.quickTo(el, "x", {
            duration: 0.18,
            ease: "power3.out",
        });
        const toY = gsap.quickTo(el, "y", {
            duration: 0.18,
            ease: "power3.out",
        });
        const onMove = (event: PointerEvent): void => {
            toX(snap(event.clientX));
            toY(snap(event.clientY));
            el.dataset.hidden = "false";
            const target = event.target as HTMLElement;
            el.dataset.hover = String(
                Boolean(target.closest("a, button, [role='radio']"))
            );
        };
        const onLeave = (): void => {
            el.dataset.hidden = "true";
        };
        window.addEventListener("pointermove", onMove);
        document.addEventListener("pointerleave", onLeave);
        window.addEventListener("blur", onLeave);
        return () => {
            window.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("blur", onLeave);
        };
    }, [enabled]);

    if (!enabled) return null;
    return <Box ref={ref} data-hidden="true" aria-hidden="true" />;
}

export default PixelCursor;
