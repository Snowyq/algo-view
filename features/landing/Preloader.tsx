import { JSX, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { setFx } from "../play/pixel/fx/fxStore";
import { pixelWipe } from "../play/pixel/fx/pixelWipe";
import { labelText } from "../play/pixel/primitives/pixel";
import { layoutWord } from "../play/pixel/toolbar/PixelLogo";

const SEEN_KEY = "algo-view:landing-intro";
const MIN_MS = 1100;
const MAX_MS = 3200;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 300;
    display: grid;
    grid-template-rows: 1fr auto;
    padding: 3.2rem clamp(1.6rem, 4vw, 4.8rem);
    background-color: var(--bg);
    color: var(--fg);

    &[data-leaving="true"] {
        background-color: transparent;
    }
`;

const Mark = styled.svg`
    align-self: center;
    justify-self: center;
    width: min(72vw, 88rem);
    height: auto;
`;

const Foot = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2.4rem;
`;

const Count = styled.p`
    font-family: var(--f-display);
    font-size: clamp(8rem, 18vw, 22rem);
    line-height: 0.75;
    font-variant-numeric: tabular-nums;
`;

const Meta = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1.2rem;
    ${labelText};
    color: var(--fg-3);
`;

const Bar = styled.div`
    display: flex;
    gap: 3px;

    i {
        width: 1rem;
        height: 1rem;
        background-color: var(--surface-2);
    }
    i[data-on="true"] {
        background-color: var(--accent);
    }
`;

const BLOCKS = 20;

function shouldShow(): boolean {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return false;
    }
    try {
        return window.sessionStorage.getItem(SEEN_KEY) !== "1";
    } catch {
        return true;
    }
}

/*
 * Once per session: the wordmark lights up pixel by pixel while a counter
 * runs to 100, paced by real font loading (min 1.1s, max 3.2s). Then the
 * screen dissolves into the hero. Any key or click skips.
 */
function Preloader(): JSX.Element | null {
    const [show, setShow] = useState<boolean>(true);
    const [leaving, setLeaving] = useState<boolean>(false);
    const [count, setCount] = useState<number>(0);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const leavingRef = useRef<boolean>(false);
    const { pixels, width } = useMemo(() => layoutWord("ALGO·VIEW"), []);

    const leave = (): void => {
        if (leavingRef.current) return;
        leavingRef.current = true;
        try {
            window.sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
            // Private mode: it just plays again next time.
        }
        setLeaving(true);
        setFx({ introDone: true });
        const overlay = overlayRef.current;
        if (!overlay) {
            setShow(false);
            return;
        }
        pixelWipe(overlay, {
            mode: "reveal",
            color: "--bg",
            block: 32,
            duration: 640,
            frames: 10,
        }).done.then(() => setShow(false));
    };

    useEffect(() => {
        if (shouldShow()) return;

        setShow(false);
        setFx({ introDone: true });
    }, []);

    useEffect(() => {
        if (!show) return;
        const svg = svgRef.current;
        const rects = svg ? Array.from(svg.querySelectorAll("rect")) : [];
        const order = rects
            .map((rect) => ({ rect, at: Math.random() }))
            .sort((a, b) => a.at - b.at);
        let fontsReady = false;
        document.fonts?.ready.then(() => (fontsReady = true));
        const start = performance.now();
        let frame = 0;
        let lit = 0;
        let shown = -1;

        const tick = (now: number): void => {
            const elapsed = now - start;
            // Paced by time, but never reaches 100 before fonts are in.
            const target = Math.min(
                1,
                elapsed / MIN_MS,
                fontsReady || elapsed > MAX_MS ? 1 : 0.92
            );
            const value = Math.floor(target * 100);
            if (value !== shown) {
                shown = value;
                setCount(value);
            }
            const toLight = Math.floor(target * order.length);
            for (; lit < toLight; lit += 1) {
                order[lit].rect.setAttribute("opacity", "1");
            }
            if (target < 1) frame = requestAnimationFrame(tick);
            else window.setTimeout(leave, 220);
        };
        frame = requestAnimationFrame(tick);

        const skip = (): void => leave();
        window.addEventListener("keydown", skip);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("keydown", skip);
        };
    }, [show]);

    if (!show) return null;
    const on = Math.round((count / 100) * BLOCKS);

    return (
        <Overlay
            ref={overlayRef}
            data-preloader
            data-leaving={leaving}
            onClick={leave}
            role="status"
            aria-label="Loading"
        >
            {!leaving && (
                <>
                    <Mark
                        ref={svgRef}
                        data-pixel
                        viewBox={`0 0 ${width} 5`}
                        aria-hidden="true"
                    >
                        {pixels.map((pixel, index) => (
                            <rect
                                key={index}
                                x={pixel.x}
                                y={pixel.y}
                                width={1}
                                height={1}
                                opacity={0}
                                fill={
                                    pixel.accent
                                        ? "var(--accent)"
                                        : "currentColor"
                                }
                            />
                        ))}
                    </Mark>
                    <Foot>
                        <Count aria-hidden="true">
                            {String(count).padStart(3, "0")}
                        </Count>
                        <Meta>
                            <Bar aria-hidden="true">
                                {Array.from({ length: BLOCKS }, (_, i) => (
                                    <i key={i} data-on={i < on} />
                                ))}
                            </Bar>
                            <span>Sorting visualizer · press any key</span>
                        </Meta>
                    </Foot>
                </>
            )}
        </Overlay>
    );
}

export default Preloader;
