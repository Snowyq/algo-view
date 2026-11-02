import { JSX, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { RootState } from "../../../../store";
import {
    getActiveAlgorithms,
    getCanvasWorkerLoading,
    getCanvasWorkerReady,
    getStepWorkerReady,
    type ActiveAlgorithm,
} from "../../playSlice";
import { prefersReducedMotion } from "../fx/dom";
import { setFx } from "../fx/fxStore";
import { pixelWipe } from "../fx/pixelWipe";
import { labelText } from "../primitives/pixel";
import { WORDMARK, WordmarkRects } from "../toolbar/PixelLogo";
import { introSeen, markIntroSeen } from "./introSeen";

const ASSEMBLE_MS = 760;
/* Stop waiting for readiness after this. */
const MAX_WAIT_MS = 4000;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 200;
    display: grid;
    place-items: center;
    background-color: var(--bg);
    cursor: pointer;

    &[data-leaving="true"] {
        background-color: transparent;
    }
`;

const Center = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3.2rem;
    color: var(--fg);
`;

const Meter = styled.div`
    display: flex;
    gap: 4px;

    i {
        width: 1.2rem;
        height: 1.2rem;
        background-color: var(--surface-2);
    }
    i[data-on="true"] {
        background-color: var(--accent);
    }
`;

const Status = styled.p`
    ${labelText};
    color: var(--fg-3);
    min-height: 1.2rem;

    &::after {
        content: "";
        display: inline-block;
        width: 0.8rem;
        height: 1.1rem;
        margin-left: 0.4rem;
        vertical-align: -1px;
        background-color: var(--accent);
        animation: px-blink 0.8s steps(1) infinite;
    }
`;

const Skip = styled.p`
    position: absolute;
    bottom: 3.2rem;
    left: 0;
    right: 0;
    text-align: center;
    ${labelText};
    font-size: 1rem;
    color: var(--fg-4);
`;

const BLOCKS = 16;

function shouldShowIntro(): boolean {
    return (
        typeof window !== "undefined" && !prefersReducedMotion() && !introSeen()
    );
}

function statusText(fonts: boolean, steps: boolean, canvas: boolean): string {
    if (!fonts) return "Loading pixels";
    if (!steps) return "Starting step engine";
    if (!canvas) return "Sorting first input";
    return "Ready";
}

/*
 * Once per session the wordmark assembles while the workers boot, then
 * dissolves. The meter tracks real readiness; any key or click skips.
 */
function PixelIntro(): JSX.Element | null {
    const [show, setShow] = useState<boolean>(true);
    const [leaving, setLeaving] = useState<boolean>(false);
    const [assembled, setAssembled] = useState<boolean>(false);
    const [fontsReady, setFontsReady] = useState<boolean>(false);
    const [timedOut, setTimedOut] = useState<boolean>(false);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const leavingRef = useRef<boolean>(false);

    const stepReady = useSelector<RootState, boolean>(getStepWorkerReady);
    const sortReady = useSelector<RootState, boolean>(getCanvasWorkerReady);
    const sortLoading = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const hasPanels =
        useSelector<RootState, ActiveAlgorithm[]>(getActiveAlgorithms).length >
        0;
    const canvasReady = !hasPanels || (sortReady && !sortLoading);

    // decide on the client; a skipped intro hands over at once
    useEffect(() => {
        if (shouldShowIntro()) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShow(false);
        setFx({ introDone: true });
    }, []);

    useEffect(() => {
        if (!show) return;
        let alive = true;
        document.fonts?.ready.then(() => alive && setFontsReady(true));
        const timer = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
        return () => {
            alive = false;
            clearTimeout(timer);
        };
    }, [show]);

    // every wordmark pixel lights up in random order
    useEffect(() => {
        const svg = svgRef.current;
        if (!show || !svg) return;
        const rects = Array.from(svg.querySelectorAll("rect"));
        const order = rects
            .map((rect) => ({ rect, at: Math.random() * ASSEMBLE_MS * 0.85 }))
            .sort((a, b) => a.at - b.at);
        const start = performance.now();
        let index = 0;
        let frame = 0;
        const tick = (now: number): void => {
            const elapsed = now - start;
            while (index < order.length && order[index].at <= elapsed) {
                order[index].rect.setAttribute("opacity", "1");
                index += 1;
            }
            if (index < order.length) frame = requestAnimationFrame(tick);
            else setAssembled(true);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [show]);

    const checks = [fontsReady, stepReady, canvasReady];
    const progress = checks.filter(Boolean).length / checks.length;
    const lit = Math.round((assembled ? progress : progress * 0.6) * BLOCKS);
    const status = statusText(fontsReady, stepReady, canvasReady);

    const leave = (): void => {
        if (leavingRef.current) return;
        leavingRef.current = true;
        markIntroSeen();
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
            block: 24,
            duration: 520,
            frames: 9,
        }).done.then(() => setShow(false));
    };

    const ready = assembled && (progress === 1 || timedOut);
    useEffect(() => {
        if (!show || !ready) return;
        const timer = setTimeout(leave, 260);
        return () => clearTimeout(timer);
    }, [ready, show]);

    useEffect(() => {
        if (!show) return;
        const onKey = (): void => leave();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [show]);

    if (!show) return null;

    return (
        <Overlay
            ref={overlayRef}
            data-leaving={leaving}
            onClick={leave}
            role="status"
            aria-label="Loading playground"
        >
            {!leaving && (
                <>
                    <Center>
                        <svg
                            ref={svgRef}
                            data-pixel
                            width={WORDMARK.width * 10}
                            height={50}
                            viewBox={`0 0 ${WORDMARK.width} 5`}
                            aria-hidden="true"
                            style={{ maxWidth: "86vw", height: "auto" }}
                        >
                            <WordmarkRects opacity={0} />
                        </svg>
                        <Meter aria-hidden="true">
                            {Array.from({ length: BLOCKS }, (_, i) => (
                                <i key={i} data-on={i < lit} />
                            ))}
                        </Meter>
                        <Status>{status}</Status>
                    </Center>
                    <Skip>Press any key to skip</Skip>
                </>
            )}
        </Overlay>
    );
}

export default PixelIntro;
