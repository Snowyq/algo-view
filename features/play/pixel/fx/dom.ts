import { REDUCED_MOTION_QUERY } from "../../../../hooks/useReducedMotion";

/* Small DOM helpers shared by the canvas effects. */

export function prefersReducedMotion(): boolean {
    return (
        typeof window !== "undefined" &&
        window.matchMedia(REDUCED_MOTION_QUERY).matches
    );
}

export function cssVar(el: Element, name: string, fallback: string): string {
    return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

/* Appends a click-through canvas over the host, positioning the host if needed. */
export function mountCanvas(
    host: HTMLElement,
    style: Partial<CSSStyleDeclaration>
): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {
        position: "absolute",
        pointerEvents: "none",
        ...style,
    });
    if (getComputedStyle(host).position === "static") {
        host.style.position = "relative";
    }
    host.appendChild(canvas);
    return canvas;
}
