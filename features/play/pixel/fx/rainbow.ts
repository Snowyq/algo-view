/* Konami palette: louder step colors set inline on the root. */

export const PALETTE_EVENT = "algo-view:palette";

const RAINBOW: Record<string, string> = {
    "--color-step-default": "#5c4a7a",
    "--color-step-swap": "#ff5fa2",
    "--color-step-select": "#ffd23f",
    "--color-step-check": "#3bceac",
    "--color-step-check-value": "#3bceac",
    "--color-step-check-true": "#7dff6b",
    "--color-step-check-value-true": "#7dff6b",
    "--color-step-check-false": "#ff4d4d",
    "--color-step-check-value-false": "#ff4d4d",
    "--color-step-finish": "#a77bff",
    "--color-step-copy": "#5ec8ff",
    "--color-step-copy-to": "#2f8fd8",
};

export function setRainbow(on: boolean): void {
    const root = document.documentElement;
    Object.entries(RAINBOW).forEach(([name, value]) => {
        if (on) root.style.setProperty(name, value);
        else root.style.removeProperty(name);
    });
    window.dispatchEvent(new Event(PALETTE_EVENT));
}
