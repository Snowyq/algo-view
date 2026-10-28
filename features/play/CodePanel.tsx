import {
    Fragment,
    JSX,
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { CODE_NOTES } from "../../algorithms/codeNotes";
import {
    clearBreakpoints,
    toggleBreakpoint,
    useBreakpoints,
} from "./breakpoints";
import type { AlgorithmInstructions } from "../../algorithms/types";
import useReducedMotion from "../../hooks/useReducedMotion";
import type { RootState } from "../../store";
import { categoryOf } from "./categories";
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

/* A plain-language note above its line: unnumbered, wraps, and lights
   up in the step color while its line is the one running. */
const Note = styled.span<{ $indent: number; $active: boolean; $color: string }>`
    display: block;
    max-width: 52ch;
    padding: 0.4rem 1.2rem 0 calc(3.6rem + ${({ $indent }) => $indent * 2}ch);
    font-family: var(--f-mono);
    font-size: 1.15rem;
    line-height: 1.5;
    white-space: normal;
    /* Lit in the step color while its line runs; a finished run has no
       step color (transparent), so fall back to plain readable text. */
    color: ${({ $active, $color }) =>
        $active && $color !== "transparent"
            ? $color
            : $active
              ? "var(--fg-2)"
              : "var(--fg-4)"};

    &::before {
        content: "// ";
    }
`;

/* Comments on/off: a small pixel switch in the caption. */
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

/* The gutter is a button: click a line number to pause whenever that line
   runs. A breakpoint shows as a red block in front of the number. */
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
              label: gaveUp ? "Stopped" : categoryOf(category).doneLabel,
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
                            const note = notesVisible ? notes[id] : undefined;
                            return (
                                <Fragment key={id}>
                                    {note && (
                                        <Note
                                            $indent={indent}
                                            $active={active}
                                            $color={activeColor}
                                        >
                                            {note}
                                        </Note>
                                    )}
                                    <Line
                                        data-line={index}
                                        $active={active}
                                        $color={activeColor}
                                        aria-current={
                                            active ? "true" : undefined
                                        }
                                    >
                                        <LineNumber
                                            type="button"
                                            $active={active}
                                            aria-pressed={breaks.has(id)}
                                            aria-label={`Pause on line ${index + 1}`}
                                            title="Pause here"
                                            onClick={() =>
                                                toggleBreakpoint(
                                                    algorithmId,
                                                    id
                                                )
                                            }
                                        >
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
                                </Fragment>
                            );
                        })}
                    </code>
                </Pre>
            </Scroller>
        </Figure>
    );
}

export default CodePanel;
