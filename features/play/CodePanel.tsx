import { JSX, useLayoutEffect, useRef, type ReactNode } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { AlgorithmInstructions } from "../../algorithms/types";
import useReducedMotion from "../../hooks/useReducedMotion";
import type { RootState } from "../../store";
import { getCurrentSpeed } from "./playSlice";
import { STEP_LEGEND } from "./stepLegend";
import { useCodeSnapshot } from "./stepInfoStore";

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
    border: 1px solid var(--ink-700);
    border-radius: var(--radius-md);
    background-color: var(--ink-950);
    overflow: hidden;
`;

const Caption = styled.figcaption`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding: 0.6rem var(--space-3);
    border-bottom: 1px solid var(--ink-700);
    font-family: var(--font-mono-stack);
    font-size: 1.1rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
    white-space: nowrap;
`;

const Status = styled.span<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-soft);

    &::before {
        content: "";
        flex: 0 0 auto;
        width: 0.8rem;
        height: 0.8rem;
        border-radius: 2px;
        background-color: ${({ $color }) => $color};
    }
`;

const Scroller = styled.div`
    flex: 1;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: var(--space-2) 0;
`;

/* The description reads as a doc comment above the code, unnumbered. */
const DocComment = styled.p`
    margin: 0 0 var(--space-2);
    padding: 0 var(--space-3) 0 calc(3.6rem + var(--space-3));
    font-family: var(--font-mono-stack);
    font-size: 1.2rem;
    line-height: 1.6;
    font-style: italic;
    color: var(--text-faint);
    text-wrap: pretty;

    &::before {
        content: "// ";
    }
`;

const Pre = styled.pre`
    margin: 0;
    font-family: var(--font-mono-stack);
    font-size: 1.25rem;
    line-height: 1.75;
    tab-size: 2;
`;

const Line = styled.span<{ $active: boolean; $color: string }>`
    position: relative;
    display: grid;
    grid-template-columns: 3.6rem max-content auto;
    align-items: center;
    min-width: 100%;
    width: max-content;
    padding-right: var(--space-3);
    background-color: ${({ $active, $color }) =>
        $active
            ? `color-mix(in srgb, ${$color} 16%, transparent)`
            : "transparent"};

    /* Gutter marker: an editor convention, sits inside the line number column. */
    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0.3rem;
        bottom: 0.3rem;
        width: 3px;
        border-radius: 0 2px 2px 0;
        background-color: ${({ $color }) => $color};
        opacity: ${({ $active }) => ($active ? 1 : 0)};
    }
`;

const LineNumber = styled.span<{ $active: boolean }>`
    padding-right: var(--space-3);
    text-align: right;
    color: ${({ $active }) =>
        $active ? "var(--text-soft)" : "var(--text-faint)"};
    font-variant-numeric: tabular-nums;
    user-select: none;
`;

const LineCode = styled.span<{ $indent: number }>`
    padding-left: ${({ $indent }) => `${$indent * 2}ch`};
    white-space: pre;
    color: var(--text-soft);
`;

const StepTag = styled.span<{ $color: string }>`
    justify-self: end;
    margin-left: var(--space-4);
    font-size: 1.05rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${({ $color }) => $color};
    white-space: nowrap;
`;

const Keyword = styled.span`
    color: var(--text);
    font-weight: 600;
`;

const Comment = styled.span`
    color: var(--text-faint);
    font-style: italic;
`;

const Literal = styled.span`
    color: var(--text);
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
              label: gaveUp ? "Gave up" : "Sorted",
              color: gaveUp ? "var(--danger)" : "var(--finish)",
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
