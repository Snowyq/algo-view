import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef, type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

/*
 * The page's single smooth-scroll engine. One RAF driver (gsap.ticker)
 * advances Lenis; ScrollTrigger reads the smoothed position from the same
 * tick. Skipped entirely under reduced motion and on touch (native touch
 * momentum already feels right).
 */
function useSmoothScroll(): RefObject<Lenis | null> {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        if (reduced || coarse) return;

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

        // In-page anchors glide with the same easing; the hash still updates.
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

        // Fonts swap widths: re-measure every trigger once they are in.
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
