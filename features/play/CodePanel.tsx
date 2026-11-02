import {
    JSX,
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { CODE_NOTES } from "../../algorithms/codeNotes";
import type { AlgorithmInstructions } from "../../algorithms/types";
import useReducedMotion from "../../hooks/useReducedMotion";
import type { RootState } from "../../store";
import {
    clearBreakpoints,
    toggleBreakpoint,
    useBreakpoints,
} from "./breakpoints";
import { categoryOf } from "./categories";
import { labelText, pixelFrame } from "./pixel/primitives/pixel";
import { getActiveCategory, getCurrentSpeed } from "./playSlice";
import { STEP_LEGEND } from "./stepLegend";
import { useCodeSnapshot } from "./stepInfoStore";

/*
 * Every step names the line that produced it. The active line takes the
 * step's legend color; syntax stays monochrome so color always means the step.
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

/* A finished run has no step color (transparent): use plain text then. */
function noteColor(active: boolean, color: string): string {
    if (!active) return "var(--fg-4)";
    return color === "transparent" ? "var(--fg-2)" : color;
}

/* Plain-language note above its line, lit while that line runs. */
const Note = styled.span<{ $indent: number; $active: boolean; $color: string }>`
    display: block;
    max-width: 52ch;
    padding: 0.4rem 1.2rem 0 calc(3.6rem + ${({ $indent }) => $indent * 2}ch);
    font-family: var(--f-mono);
    font-size: 1.15rem;
    line-height: 1.5;
    white-space: normal;
    color: ${({ $active, $color }) => noteColor($active, $color)};

    &::before {
        content: "// ";
    }
`;

/* Comments on/off switch. */
const NotesToggle = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.2rem 0;
    border: 0;
    background: none;
    color: var(--fg-3);
    ${labelText};
    font-size: 1rem;

    i {
        position: relative;
        width: 2.4rem;
        height: 1.2rem;
        background-color: var(--bg);
        ${pixelFrame("var(--line-2)")};
    }
    i::after {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 0.8rem;
        height: calc(100% - 4px);
        background-color: var(--fg-4);
        transition: transform 120ms steps(2);
    }
    &[aria-pressed="true"] i::after {
        background-color: var(--accent);
        transform: translateX(1.2rem);
    }
    &[aria-pressed="true"] {
        color: var(--fg);
    }
`;

const NOTES_KEY = "algo-view:code-notes";

/* Remembered per browser; storage can be blocked, so default to on. */
function useNotesVisible(): [boolean, () => void] {
    const [visible, setVisible] = useState<boolean>(() => {
        try {
            return window.localStorage.getItem(NOTES_KEY) !== "off";
        } catch {
            return true;
        }
    });
    const toggle = (): void =>
        setVisible((value) => {
            const next = !value;
            try {
                window.localStorage.setItem(NOTES_KEY, next ? "on" : "off");
            } catch {
                // Not remembered, still toggled.
            }
            return next;
        });
    return [visible, toggle];
}

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

    /* Gutter marker in the step color. */
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

/* Line number toggles a breakpoint on that line. */
const LineNumber = styled.button<{ $active: boolean }>`
    position: relative;
    height: 100%;
    padding: 0 1.2rem 0 0;
    border: 0;
    background: none;
    font: inherit;
    text-align: right;
    color: ${({ $active }) => ($active ? "var(--fg-2)" : "var(--fg-4)")};
    font-variant-numeric: tabular-nums;
    user-select: none;
    cursor: pointer;

    &::after {
        content: "";
        position: absolute;
        left: 0.4rem;
        top: 50%;
        width: 0.8rem;
        height: 0.8rem;
        translate: 0 -50%;
        background-color: var(--danger);
        opacity: 0;
    }
    &[aria-pressed="true"] {
        color: var(--danger);
    }
    &[aria-pressed="true"]::after {
        opacity: 1;
        animation: px-dither-in 140ms both;
    }
    @media (hover: hover) {
        &:hover::after {
            opacity: 0.4;
        }
        &[aria-pressed="true"]:hover::after {
            opacity: 1;
        }
    }
`;

const BreakInfo = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--danger);

    button {
        border: 0;
        padding: 0;
        background: none;
        color: var(--fg-3);
        font: inherit;
        text-decoration: underline;
    }
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

/* Scrolls the scroller (never the page) so the line is in view. */
function useKeepLineInView(
    scrollerRef: RefObject<HTMLDivElement | null>,
    lineIndex: number,
    smooth: boolean
): void {
    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller || lineIndex < 0) return;
        const line = scroller.querySelector<HTMLElement>(
            `[data-line="${lineIndex}"]`
        );
        if (!line) return;
        // Relative to the scroller itself, whatever offsetParent is.
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
            behavior: smooth ? "smooth" : "auto",
        });
    }, [scrollerRef, lineIndex, smooth]);
}

type CodeLineProps = {
    index: number;
    code: string;
    indent: number;
    note?: string;
    active: boolean;
    color: string;
    /** Step label shown at the end of the first active line. */
    tag?: string;
    hasBreakpoint: boolean;
    onToggleBreakpoint: () => void;
};

function CodeLine({
    index,
    code,
    indent,
    note,
    active,
    color,
    tag,
    hasBreakpoint,
    onToggleBreakpoint,
}: CodeLineProps): JSX.Element {
    return (
        <>
            {note && (
                <Note $indent={indent} $active={active} $color={color}>
                    {note}
                </Note>
            )}
            <Line
                data-line={index}
                $active={active}
                $color={color}
                aria-current={active ? "true" : undefined}
            >
                <LineNumber
                    type="button"
                    $active={active}
                    aria-pressed={hasBreakpoint}
                    aria-label={`Pause on line ${index + 1}`}
                    title="Pause here"
                    onClick={onToggleBreakpoint}
                >
                    {index + 1}
                </LineNumber>
                <LineCode $indent={indent}>{highlight(code)}</LineCode>
                {tag ? <StepTag $color={color}>{tag}</StepTag> : <span />}
            </Line>
        </>
    );
}

type CodePanelProps = {
    algorithmId: string;
    name: string;
    instructions: AlgorithmInstructions;
};

function CodePanel({
    algorithmId,
    name,
    instructions,
}: CodePanelProps): JSX.Element {
    const notes = CODE_NOTES[algorithmId] ?? {};
    const hasNotes = Object.keys(notes).length > 0;
    const [notesVisible, toggleNotes] = useNotesVisible();
    const breakpoints = useBreakpoints();
    const breaks = new Set(
        breakpoints.algorithmId === algorithmId ? breakpoints.lines : []
    );
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const reduced = useReducedMotion();
    const speed = useSelector<RootState, number>(getCurrentSpeed);
    const category = useSelector<RootState, string>(getActiveCategory);

    // From the store, so a view opened mid-run is current.
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
              label: gaveUp ? "Stopped" : categoryOf(category).doneLabel,
              color: gaveUp ? "var(--danger)" : "var(--color-step-finish)",
          }
        : legend
          ? { label: legend.label, color: activeColor }
          : null;

    useKeepLineInView(
        scrollerRef,
        firstActive,
        !reduced && speed >= SMOOTH_SCROLL_MIN_SPEED_MS
    );

    return (
        <Figure data-no-observe aria-label={`${name} source code`}>
            <Caption>
                <span>JavaScript</span>
                {status && (
                    <Status $color={status.color}>{status.label}</Status>
                )}
                {breaks.size > 0 && (
                    <BreakInfo>
                        {breaks.size} breakpoint{breaks.size > 1 ? "s" : ""}
                        <button
                            type="button"
                            onClick={() => clearBreakpoints(algorithmId)}
                        >
                            clear
                        </button>
                    </BreakInfo>
                )}
                {hasNotes && (
                    <NotesToggle
                        type="button"
                        aria-pressed={notesVisible}
                        onClick={toggleNotes}
                    >
                        <i aria-hidden="true" />
                        Comments
                    </NotesToggle>
                )}
            </Caption>
            <Scroller ref={scrollerRef} tabIndex={0}>
                <Pre>
                    <code>
                        {entries.map(([id, { line, indent }], index) => {
                            const active = activeIds.has(id);
                            return (
                                <CodeLine
                                    key={id}
                                    index={index}
                                    code={line}
                                    indent={indent}
                                    note={notesVisible ? notes[id] : undefined}
                                    active={active}
                                    color={activeColor}
                                    tag={
                                        active && index === firstActive
                                            ? legend?.label
                                            : undefined
                                    }
                                    hasBreakpoint={breaks.has(id)}
                                    onToggleBreakpoint={() =>
                                        toggleBreakpoint(algorithmId, id)
                                    }
                                />
                            );
                        })}
                    </code>
                </Pre>
            </Scroller>
        </Figure>
    );
}

export default CodePanel;
