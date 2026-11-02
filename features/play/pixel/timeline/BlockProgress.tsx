import {
    JSX,
    useMemo,
    useRef,
    type KeyboardEvent,
    type PointerEvent,
    type ReactNode,
} from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled from "styled-components";
import useRateLimit from "../../../../hooks/useRateLimit";
import type { AppDispatch, RootState } from "../../../../store";
import {
    changeStep,
    freezeAnimation,
    getVisibleAlgorithms,
    getMaxStep,
    getStep,
    startAnimation,
    stopAnimation,
    type ActiveAlgorithm,
} from "../../playSlice";
import { setFx } from "../fx/fxStore";
import { NARROW, SHORT } from "../media";
import PixelIcon from "../primitives/PixelIcon";
import { blockPattern, labelText, pixelFrame } from "../primitives/pixel";
import { useWidth } from "../../../../hooks/useWidth";

const BLOCK = 6;
const GAP = 2;
const UNIT = BLOCK + GAP;

/* Lead (step counter) on the left; runner, bar and markers on the right. */
const Root = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 1.6rem;
    width: 100%;

    & > * {
        grid-column: 2;
    }
    & > [data-lead] {
        grid-column: 1;
        grid-row: 2;
        align-self: center;
    }

    @media ${NARROW} {
        column-gap: 1rem;
    }
`;

const Hit = styled.div`
    position: relative;
    height: 2.8rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    touch-action: none;
    outline: none;

    &:focus-visible > [data-bar] {
        ${pixelFrame("var(--accent)")};
    }
`;

const Bar = styled.div`
    position: relative;
    width: 100%;
    height: 1.6rem;
    background-color: var(--bg);
    ${pixelFrame("var(--line-2)")};

    &::before {
        content: "";
        position: absolute;
        inset: 3px;
        ${blockPattern("var(--surface-3)", BLOCK, GAP)};
    }
`;

const Fill = styled.div`
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    ${blockPattern("var(--accent)", BLOCK, GAP)};
`;

/* Hover line: where a click would land. */
const Ghost = styled.div`
    position: absolute;
    top: -0.6rem;
    bottom: -0.6rem;
    width: 2px;
    background-color: var(--fg);
    pointer-events: none;
    opacity: 0;

    ${Hit}:hover & {
        opacity: 1;
    }
`;

const GhostLabel = styled.span`
    position: absolute;
    bottom: calc(100% + 0.4rem);
    left: 50%;
    translate: -50% 0;
    padding: 0.3rem 0.5rem;
    background-color: var(--fg);
    color: var(--bg);
    ${labelText};
    font-size: 1rem;
    white-space: nowrap;
`;

const Markers = styled.div`
    position: relative;
    height: 2.4rem;
    margin-top: 0.4rem;
    pointer-events: none;

    /* Landscape phones: no room for the marker rows. */
    @media ${SHORT} {
        display: none;
    }
`;

const Tick = styled.span`
    display: inline-flex;
    animation: px-dither-in 200ms both;
`;

/* Where an algorithm finishes; click to jump there. */
const Marker = styled.button<{ $row: number; $done: boolean }>`
    position: absolute;
    padding: 0;
    border: 0;
    background: none;
    pointer-events: auto;
    cursor: pointer;
    top: ${({ $row }) => $row * 1.2}rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    ${labelText};
    font-size: 1rem;
    color: ${({ $done }) =>
        $done ? "var(--color-step-finish)" : "var(--fg-4)"};
    white-space: nowrap;
    transition: color 120ms steps(2);

    &::before {
        content: "";
        width: 2px;
        height: 0.8rem;
        background-color: currentColor;
    }

    &[data-align="end"] {
        translate: -100% 0;
        flex-direction: row-reverse;
    }
    @media (hover: hover) {
        &:hover {
            color: var(--fg);
        }
        &:hover::before {
            box-shadow:
                -2px 0 0 currentColor,
                2px 0 0 currentColor;
        }
    }
`;

type MarkerInfo = {
    id: string;
    name: string;
    at: number;
    /** Last finish among the algorithms sharing this label. */
    doneAt: number;
    row: number;
    align: "start" | "end";
};

const MARKER_MIN_GAP = 90;

/* Finish points along the bar. A label that would collide takes the second
   row; with both rows taken it joins the previous label. */
function layoutMarkers(
    algorithms: ActiveAlgorithm[],
    maxStep: number,
    width: number
): MarkerInfo[] {
    if (maxStep <= 0 || algorithms.length < 2) return [];
    const list = algorithms
        .filter((algo) => algo.stepsLength > 0)
        .map((algo) => ({
            id: algo.id,
            name: algo.info.name,
            at: (algo.stepsLength - 1) / maxStep,
        }))
        .sort((a, b) => a.at - b.at);
    const lastX: number[] = [-Infinity, -Infinity];
    const out: MarkerInfo[] = [];
    list.forEach((item) => {
        const x = item.at * width;
        const row = lastX.findIndex((last) => x - last > MARKER_MIN_GAP);
        if (row < 0) {
            const previous = out[out.length - 1];
            previous.name = `${previous.name} · ${item.name}`;
            previous.doneAt = item.at;
            return;
        }
        lastX[row] = x;
        out.push({
            ...item,
            doneAt: item.at,
            row,
            align: item.at > 0.85 ? "end" : "start",
        });
    });
    return out;
}

/* Arrow keys step by 1 (10 with shift), Page keys by a tenth of the run. */
function keyTarget(
    key: string,
    shift: boolean,
    step: number,
    maxStep: number
): number | undefined {
    const small = shift ? 10 : 1;
    const big = Math.max(10, Math.round(maxStep / 10));
    const targets: Record<string, number> = {
        ArrowRight: step + small,
        ArrowUp: step + small,
        ArrowLeft: step - small,
        ArrowDown: step - small,
        PageUp: step + big,
        PageDown: step - big,
        Home: 0,
        End: maxStep,
    };
    return targets[key];
}

type BlockProgressProps = {
    /** Rendered over the bar, positioned by the caller (the runner). */
    children?: ReactNode;
    /** Shown left of the bar, level with it (the step counter). */
    lead?: ReactNode;
};

function BlockProgress({ children, lead }: BlockProgressProps): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const { value: step } = useSelector<RootState, { value: number }>(getStep);
    const maxStep = useSelector<RootState, number>(getMaxStep);
    // Markers only for panels on the stage; parked ones don't play.
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getVisibleAlgorithms
    );
    const barRef = useRef<HTMLDivElement | null>(null);
    const ghostRef = useRef<HTMLDivElement | null>(null);
    const ghostLabelRef = useRef<HTMLSpanElement | null>(null);
    const draggingRef = useRef<boolean>(false);
    const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const width = useWidth(barRef);
    const inner = Math.max(0, width - 6);
    const safeMax = Math.max(0, maxStep);
    const ratio = safeMax > 0 ? Math.min(1, step / safeMax) : 0;
    const fillWidth = Math.round((ratio * inner) / UNIT) * UNIT;

    const valueAt = (clientX: number): number => {
        const rect = barRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0) return 0;
        const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        return Math.round(t * safeMax);
    };

    const scrubTo = (value: number): void => {
        if (store.getState().play.animation.status === "playing") {
            dispatch(freezeAnimation());
        }
        dispatch(changeStep({ value }));
    };
    const limitedScrub = useRateLimit(scrubTo, 16);

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
        if (event.button !== 0 || safeMax <= 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        draggingRef.current = true;
        setFx({ scrubbing: true });
        limitedScrub(valueAt(event.clientX));
    };

    const moveGhost = (clientX: number): void => {
        const rect = barRef.current?.getBoundingClientRect();
        const ghost = ghostRef.current;
        if (!rect || !ghost) return;
        const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
        ghost.style.transform = `translateX(${Math.round(x / 2) * 2}px)`;
        if (ghostLabelRef.current) {
            ghostLabelRef.current.textContent = `${valueAt(clientX)}`;
        }
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
        moveGhost(event.clientX);
        if (!draggingRef.current) return;
        limitedScrub(valueAt(event.clientX));
    };

    const endDrag = (): void => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        setFx({ scrubbing: false });
        if (store.getState().play.animation.status === "freezed") {
            if (resumeRef.current) clearTimeout(resumeRef.current);
            resumeRef.current = setTimeout(
                () => dispatch(startAnimation()),
                50
            );
        }
    };

    const handleKey = (event: KeyboardEvent<HTMLDivElement>): void => {
        const value = keyTarget(event.key, event.shiftKey, step, safeMax);
        if (value === undefined) return;
        event.preventDefault();
        event.stopPropagation();
        dispatch(changeStep({ value }));
    };

    // Click a finish point: pause there.
    const jumpTo = (at: number): void => {
        if (store.getState().play.animation.status === "playing") {
            dispatch(stopAnimation());
        }
        dispatch(changeStep({ value: Math.round(at * safeMax) }));
    };

    const markers = useMemo(
        () => layoutMarkers(active, safeMax, width),
        [active, safeMax, width]
    );

    return (
        <Root>
            {lead && <div data-lead>{lead}</div>}
            {children}
            <Hit
                role="slider"
                tabIndex={0}
                aria-label="Step"
                aria-valuemin={0}
                aria-valuemax={safeMax}
                aria-valuenow={Math.min(step, safeMax)}
                aria-valuetext={`Step ${step} of ${safeMax}`}
                aria-disabled={safeMax <= 0 || undefined}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={handleKey}
            >
                <Bar ref={barRef} data-bar>
                    <Fill style={{ width: Math.min(inner, fillWidth) }} />
                    {safeMax > 0 && (
                        <Ghost ref={ghostRef}>
                            <GhostLabel ref={ghostLabelRef} />
                        </Ghost>
                    )}
                </Bar>
            </Hit>
            <Markers aria-label="Finish points">
                {markers.map((marker) => {
                    const done = step >= marker.doneAt * safeMax;
                    return (
                        <Marker
                            key={marker.id}
                            $row={marker.row}
                            $done={done}
                            data-align={marker.align}
                            style={{ left: `${marker.at * 100}%` }}
                            type="button"
                            aria-label={`Jump to where ${marker.name} finishes`}
                            title="Jump here"
                            onClick={() => jumpTo(marker.at)}
                        >
                            {marker.name}
                            {done && (
                                <Tick aria-hidden="true">
                                    <PixelIcon name="check" scale={1} />
                                </Tick>
                            )}
                        </Marker>
                    );
                })}
            </Markers>
        </Root>
    );
}

export default BlockProgress;
