import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef, type RefObject } from "react";
import { prefersReducedMotion } from "../play/pixel/fx/dom";

gsap.registerPlugin(ScrollTrigger);

/* Lenis driven by gsap.ticker, so ScrollTrigger reads the same tick.
   Off on touch and under reduced motion. */
function useSmoothScroll(): RefObject<Lenis | null> {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        if (prefersReducedMotion() || coarse) return;

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
        });
        lenisRef.current = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number): void => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // Smooth in-page anchors, still updating the hash.
        const onClick = (event: MouseEvent): void => {
            const link = (
                event.target as HTMLElement
            ).closest<HTMLAnchorElement>('a[href^="#"]');
            const href = link?.getAttribute("href");
            if (!link || !href || href === "#") return;
            const target = document.querySelector<HTMLElement>(href);
            if (!target) return;
            event.preventDefault();
            lenis.scrollTo(target, { offset: -64, duration: 1.4 });
            history.pushState(null, "", href);
            target.focus({ preventScroll: true });
        };
        document.addEventListener("click", onClick);

        // Font swap changes layout, so re-measure triggers.
        document.fonts?.ready.then(() => ScrollTrigger.refresh());

        return () => {
            document.removeEventListener("click", onClick);
            gsap.ticker.remove(tick);
            gsap.ticker.lagSmoothing(500, 33);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    return lenisRef;
}

export default useSmoothScroll;
