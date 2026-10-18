import { JSX, useLayoutEffect, useRef, type ReactNode } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { AlgorithmInstructions } from "../../algorithms/types";
import useReducedMotion from "../../hooks/useReducedMotion";
import type { RootState } from "../../store";
import { getActiveCategory, getCurrentSpeed } from "./playSlice";
import { STEP_LEGEND } from "./stepLegend";
import { useCodeSnapshot } from "./stepInfoStore";
import { labelText, pixelFrame } from "./pixel/primitives/pixel";

/*
 * Code view rules:
 * - The code is the source the animation is generated from: every step names
 *   the line that produced it (instructionId).
 * - The active line takes the step's legend color; syntax stays monochrome so
 *   color always means "what the algorithm is doing", never "token kind".
 * - Steps without a line (initial, finish) keep the last line highlighted.
 */

const SMOOTH_SCROLL_MIN_SPEED_MS = 100;

const Figure = styled.figure`
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    height: 100%;
    margin: var(--b);
    background-color: var(--bg-2);
    overflow: hidden;
    cursor: auto;
    ${pixelFrame("var(--line)")};
`;

const Caption = styled.figcaption`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    padding: 0.8rem 1.2rem;
    border-bottom: var(--b) solid var(--line);
    ${labelText};
    font-size: 1rem;
    color: var(--fg-4);
    white-space: nowrap;
`;

/* Status swatch blinks once per change: a two-frame "lit" pixel. */
const Status = styled.span<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--fg-2);

    &::before {
        content: "";
        flex: 0 0 auto;
        width: 0.8rem;
        height: 0.8rem;
        background-color: ${({ $color }) => $color};
    }
`;

const Scroller = styled.div`
    flex: 1;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 0.8rem 0;
`;

/* The description reads as a doc comment above the code, unnumbered. */
const DocComment = styled.p`
    margin: 0 0 0.8rem;
    padding: 0 1.2rem 0 calc(3.6rem + 1.2rem);
    font-family: var(--f-mono);
    font-size: 1.2rem;
    line-height: 1.6;
    color: var(--fg-4);
    text-wrap: pretty;

    &::before {
        content: "// ";
    }
`;

const Pre = styled.pre`
    margin: 0;
    font-family: var(--f-mono);
    font-size: 1.25rem;
    line-height: 1.8;
    tab-size: 2;
`;

const Line = styled.span<{ $active: boolean; $color: string }>`
    position: relative;
    display: grid;
    grid-template-columns: 3.6rem max-content auto;
    align-items: center;
    min-width: 100%;
    width: max-content;
    padding-right: 1.2rem;
    background-color: ${({ $active, $color }) =>
        $active
            ? `color-mix(in srgb, ${$color} 18%, transparent)`
            : "transparent"};

    /* Gutter marker: a square pixel block in the step color. */
    &::before {
        content: "";
        position: absolute;
        left: 0.4rem;
        top: 50%;
        width: 0.8rem;
        height: 0.8rem;
        translate: 0 -50%;
        background-color: ${({ $color }) => $color};
        opacity: ${({ $active }) => ($active ? 1 : 0)};
    }
`;

const LineNumber = styled.span<{ $active: boolean }>`
    padding-right: 1.2rem;
    text-align: right;
    color: ${({ $active }) => ($active ? "var(--fg-2)" : "var(--fg-4)")};
    font-variant-numeric: tabular-nums;
    user-select: none;
`;

const LineCode = styled.span<{ $indent: number }>`
    padding-left: ${({ $indent }) => `${$indent * 2}ch`};
    white-space: pre;
    color: var(--fg-2);
`;

const StepTag = styled.span<{ $color: string }>`
    justify-self: end;
    margin-left: 1.6rem;
    ${labelText};
    font-size: 1rem;
    color: ${({ $color }) => $color};
    white-space: nowrap;
`;

const Keyword = styled.span`
    color: var(--fg);
    font-weight: 600;
`;

const Comment = styled.span`
    color: var(--fg-4);
`;

const Literal = styled.span`
    color: var(--accent-2);
`;

const TOKEN =
    /(\/\/.*$)|\b(for|while|if|else|let|const|function|return|continue|break|of|new)\b|\b(\d+(?:\.\d+)?)\b/g;

function highlight(code: string): ReactNode[] {
    const parts: ReactNode[] = [];
    let last = 0;
    for (const match of code.matchAll(TOKEN)) {
        const index = match.index ?? 0;
        if (index > last) parts.push(code.slice(last, index));
        const [text, comment, keyword] = match;
        if (comment) parts.push(<Comment key={index}>{text}</Comment>);
        else if (keyword) parts.push(<Keyword key={index}>{text}</Keyword>);
        else parts.push(<Literal key={index}>{text}</Literal>);
        last = index + text.length;
    }
    if (last < code.length) parts.push(code.slice(last));
    return parts;
}

type CodePanelProps = {
    algorithmId: string;
    name: string;
    instructions: AlgorithmInstructions;
    description?: string;
};

function CodePanel({
    algorithmId,
    name,
    instructions,
    description,
}: CodePanelProps): JSX.Element {
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const reduced = useReducedMotion();
    const speed = useSelector<RootState, number>(getCurrentSpeed);
    const category = useSelector<RootState, string>(getActiveCategory);

    // Sticky highlight lives in the store, so a view opened mid-run is current.
    const {
        highlight: highlighted,
        stepType,
        gaveUp,
    } = useCodeSnapshot(algorithmId);

    const entries = Object.entries(instructions);
    const activeIds = new Set(highlighted?.ids ?? []);
    const legend = highlighted ? STEP_LEGEND[highlighted.type] : undefined;
    const activeColor = legend ? `var(${legend.colorVar})` : "transparent";
    const firstActive = entries.findIndex(([id]) => activeIds.has(id));

    const finished = stepType === "finish";
    const status = finished
        ? {
              label: gaveUp ? "Stopped" : category === "path" ? "Found" : "Sorted",
              color: gaveUp ? "var(--danger)" : "var(--color-step-finish)",
          }
        : legend
          ? { label: legend.label, color: activeColor }
          : null;

    // Keep the active line in view without scrolling the page.
    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller || firstActive < 0) return;
        const line = scroller.querySelector<HTMLElement>(
            `[data-line="${firstActive}"]`
        );
        if (!line) return;
        // Measure relative to the scroller itself, whatever offsetParent is.
        const top =
            line.getBoundingClientRect().top -
            scroller.getBoundingClientRect().top +
            scroller.scrollTop;
        const bottom = top + line.offsetHeight;
        const viewTop = scroller.scrollTop;
        const viewBottom = viewTop + scroller.clientHeight;
        if (top >= viewTop && bottom <= viewBottom) return;
        scroller.scrollTo({
            top: Math.max(0, top - scroller.clientHeight / 3),
            behavior:
                reduced || speed < SMOOTH_SCROLL_MIN_SPEED_MS
                    ? "auto"
                    : "smooth",
        });
    }, [firstActive, reduced, speed]);

    return (
        <Figure data-no-observe aria-label={`${name} source code`}>
            <Caption>
                <span>JavaScript</span>
                {status && (
                    <Status $color={status.color}>{status.label}</Status>
                )}
            </Caption>
            <Scroller ref={scrollerRef} tabIndex={0}>
                {description && <DocComment>{description}</DocComment>}
                <Pre>
                    <code>
                        {entries.map(([id, { line, indent }], index) => {
                            const active = activeIds.has(id);
                            return (
                                <Line
                                    key={id}
                                    data-line={index}
                                    $active={active}
                                    $color={activeColor}
                                    aria-current={active ? "true" : undefined}
                                >
                                    <LineNumber $active={active}>
                                        {index + 1}
                                    </LineNumber>
                                    <LineCode $indent={indent}>
                                        {highlight(line)}
                                    </LineCode>
                                    {active &&
                                    index === firstActive &&
                                    legend ? (
                                        <StepTag $color={activeColor}>
                                            {legend.label}
                                        </StepTag>
                                    ) : (
                                        <span />
                                    )}
                                </Line>
                            );
                        })}
                    </code>
                </Pre>
            </Scroller>
        </Figure>
    );
}

export default CodePanel;
