import { JSX, useCallback, useEffect, useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    LIBRARY_COLLAPSE,
    LIBRARY_MIN_WIDTH,
} from "../../../../constants/breakpoints";
import useClickOutside from "../../../../hooks/useClickOutside";
import useWindowSize from "../../../../hooks/useWindowSize";
import type { AppDispatch, RootState } from "../../../../store";
import {
    closeAlgorithm,
    closeAllAlgorithms,
    getActiveCategory,
    getActiveAlgorithms,
    getAlgorithms,
    getOverviewOpen,
    getPanelCapacity,
    setOverviewOpen,
    openAlgorithm,
    type ActiveAlgorithm,
    type RegistryAlgorithm,
} from "../../playSlice";
import { categoryOf } from "../../categories";
import PixelIcon from "../primitives/PixelIcon";
import { NARROW, SHORT, TINY } from "../media";
import { labelText, pixelFrame } from "../primitives/pixel";

/*
 * Category and algorithm choice. Wide screens: a sidebar, "1 Category"
 * keys on top, "2 Algorithms" checklist below. Below LIBRARY_COLLAPSE the
 * sidebar folds into two selects in the toolbar (LibraryPicker), each
 * opening the same lists in a sheet, so the panels and Details keep the
 * width.
 */

const Dock = styled.nav`
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background-color: var(--bg-2);
    border-right: var(--b) solid var(--line);

    @media (max-width: ${LIBRARY_COLLAPSE}) {
        display: none;
    }
`;

const Section = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    padding: 1.6rem 1.2rem 0.8rem 1.6rem;
`;

/* "1 Category", "2 Algorithms": the order to read the sidebar in. */
const Heading = styled.h2`
    display: flex;
    align-items: baseline;
    gap: 0.8rem;
    min-width: 0;
    ${labelText};
    font-size: 1.1rem;
    color: var(--fg-3);
    white-space: nowrap;

    i {
        font-style: normal;
        color: var(--accent);
    }
    b {
        font-weight: 400;
        color: var(--fg-4);
    }
`;

/* Plain text button: small enough to sit beside the heading. */
const Clear = styled.button`
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    height: 2.8rem;
    padding: 0 0.8rem;
    border: 0;
    background: none;
    color: var(--fg-4);
    ${labelText};
    font-size: 1rem;

    @media (hover: hover) {
        &:hover:not(:disabled) {
            color: var(--danger);
            background-color: var(--surface);
        }
    }
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

const Scroll = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0.4rem 1.2rem 1.6rem;
`;

const Group = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    & + & {
        margin-top: 1.6rem;
    }
`;

const GroupLabel = styled.li`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0.4rem 0.8rem;
    ${labelText};
    font-size: 1rem;
    color: var(--fg-4);

    &::after {
        content: "";
        flex: 1;
        height: 2px;
        background-image: repeating-linear-gradient(
            90deg,
            var(--line) 0 2px,
            transparent 2px 4px
        );
    }
`;

const Row = styled.button`
    position: relative;
    display: grid;
    /* The name gets its full width first; complexity takes what is left
       and is the one that truncates. */
    grid-template-columns: auto minmax(0, max-content) minmax(0, 1fr);
    align-items: center;
    gap: 1rem;
    width: 100%;
    min-height: 4rem;
    padding: 0.4rem 0.8rem;
    border: 0;
    background-color: transparent;
    color: var(--fg-2);
    text-align: left;
    font-size: 1.5rem;

    @media (hover: hover) {
        &:hover:not(:disabled) {
            background-color: var(--surface);
            color: var(--fg);
        }
        &:hover:not(:disabled) [data-box] {
            ${pixelFrame("var(--fg-3)")};
        }
    }

    &[aria-pressed="true"] {
        background-color: var(--surface-2);
        color: var(--fg);
    }

    /* Selected rows get a pixel notch on the left edge. */
    &[aria-pressed="true"]::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0.8rem;
        bottom: 0.8rem;
        width: 4px;
        background-color: var(--accent);
        animation: px-drop-in 120ms steps(3) both;
    }

    &:disabled {
        color: var(--fg-4);
        cursor: not-allowed;
    }

    &:active:not(:disabled) [data-box] {
        transform: translateY(2px);
    }

    @media (pointer: coarse) {
        min-height: 4.8rem;
    }
`;

/* Pixel checkbox: the tick draws itself in three frames. */
const Box = styled.span`
    display: grid;
    place-items: center;
    width: 1.6rem;
    height: 1.6rem;
    margin: var(--b);
    background-color: var(--bg);
    color: var(--accent-ink);
    ${pixelFrame("var(--line-2)")};

    svg {
        clip-path: inset(0 100% 0 0);
    }

    [aria-pressed="true"] & {
        background-color: var(--accent);
        ${pixelFrame("var(--accent-2)")};
    }
    [aria-pressed="true"] & svg {
        animation: px-tick 150ms steps(3) forwards;
    }

    @keyframes px-tick {
        to {
            clip-path: inset(0 0 0 0);
        }
    }
`;

/* One line, always: the row's icon zeroes line-height for the button,
   so a wrapped name would draw its lines on top of each other. */
const Name = styled.span`
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    line-height: 1.3;
`;

const Complexity = styled.span`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
    white-space: nowrap;
    line-height: 1.3;
    font-family: var(--f-mono);
    font-size: 1.1rem;
    color: var(--fg-4);
`;

const Note = styled.p`
    margin: 0 1.6rem 1.2rem;
    font-size: 1.3rem;
    color: var(--fg-3);

    &[data-full] {
        color: var(--fg-2);
    }

    [data-sheet] & {
        margin: 0 0 1.2rem;
    }
`;

/* ---------- Toolbar picker: two selects + a sheet ---------- */

/* Category lives here at every width; the Algorithms select only where
   the sidebar has folded away. */
const Picker = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;

    @media (min-width: ${LIBRARY_MIN_WIDTH}px) {
        [data-algorithms-select] {
            display: none;
        }
    }
`;

const Select = styled.button`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-width: 0;
    height: 3.6rem;
    padding: 0 1rem;
    margin: var(--b);
    border: 0;
    background-color: var(--surface);
    color: var(--fg);
    ${labelText};
    ${pixelFrame("var(--line)")};

    span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    b {
        font-weight: 400;
        color: var(--accent);
    }
    /* Chevron flips while its sheet is open. */
    [data-chevron] {
        display: inline-flex;
        flex: 0 0 auto;
        transition: transform 120ms steps(2);
    }
    &[aria-expanded="true"] {
        ${pixelFrame("var(--accent)")};
    }
    &[aria-expanded="true"] [data-chevron] {
        transform: rotate(180deg);
    }
    @media (hover: hover) {
        &:hover:not([aria-expanded="true"]) {
            ${pixelFrame("var(--fg-3)")};
        }
    }

    /* The count never gives way; names do. */
    [data-count] {
        flex: 0 0 auto;
        overflow: visible;
    }

    /* Phones: icon + count; the words come back on wider screens. */
    @media ${NARROW} {
        padding: 0 0.8rem;
        gap: 0.6rem;

        [data-word] {
            display: none;
        }
    }
    /* Smallest phones: the category is just its icon. */
    @media ${TINY} {
        [data-name] {
            display: none;
        }
    }
    @media ${SHORT} {
        height: 3.2rem;
    }
`;

/* Positioned against the toolbar, so it spans the full width under it. */
const Sheet = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 60;
    max-height: min(70svh, 56rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 1.6rem 1.2rem 2rem;
    background-color: var(--bg-2);
    border-bottom: var(--b) solid var(--line-2);
    box-shadow: 0 1.2rem 0 rgba(21, 18, 15, 0.6);
    animation: px-sheet-down 160ms steps(4) both;

    @keyframes px-sheet-down {
        from {
            clip-path: inset(0 0 100% 0);
        }
        to {
            clip-path: inset(0 0 0 0);
        }
    }

    /* Two columns of algorithms when the sheet is wide enough. */
    ul {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(26rem, 1fr));
        gap: 0.2rem 1.2rem;
    }
    ul > li:first-child {
        grid-column: 1 / -1;
    }
`;

const SheetHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
`;

type SheetKind = "algorithms" | null;

function useWidthBelow(px: number): boolean {
    const { size } = useWindowSize();
    return size.width > 0 && size.width < px;
}

/* Everything both layouts need: data, the lists and the Clear button. */
function useLibrary(): {
    active: ActiveAlgorithm[];
    algorithms: RegistryAlgorithm[];
    category: string;
    capacity: number;
    full: boolean;
    algorithmGroups: JSX.Element;
    clearButton: JSX.Element | null;
} {
    const dispatch = useDispatch<AppDispatch>();
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const algorithms = useSelector<RootState, RegistryAlgorithm[]>(
        getAlgorithms
    );
    const category = useSelector<RootState, string>(getActiveCategory);
    const capacity = useSelector<RootState, number>(getPanelCapacity);
    const full = active.length >= capacity;

    const renderRow = (algo: RegistryAlgorithm): JSX.Element => {
        const selected = active.some((item) => item.id === algo.id);
        return (
            <li key={algo.id} data-lib-row>
                <Row
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                        dispatch(
                            selected
                                ? closeAlgorithm(algo.id)
                                : openAlgorithm(algo.id)
                        )
                    }
                >
                    <Box data-box aria-hidden="true">
                        <PixelIcon name="check" scale={2} />
                    </Box>
                    <Name title={algo.name}>{algo.name}</Name>
                    <Complexity data-complexity>
                        {algo.timeComplexity}
                    </Complexity>
                </Row>
            </li>
        );
    };

    const classic = algorithms.filter((algo) => algo.group !== "fun");
    const fun = algorithms.filter((algo) => algo.group === "fun");

    const algorithmGroups = (
        <>
            <Group aria-label="Classic">
                <GroupLabel aria-hidden="true">Classic</GroupLabel>
                {classic.map(renderRow)}
            </Group>
            {fun.length > 0 && (
                <Group aria-label="Just for fun">
                    <GroupLabel aria-hidden="true">
                        <PixelIcon name="sparkle" scale={1} />
                        Just for fun
                    </GroupLabel>
                    {fun.map(renderRow)}
                </Group>
            )}
        </>
    );

    const clearButton =
        active.length === 0 ? null : (
            <Clear
                type="button"
                aria-label="Close all algorithms"
                disabled={active.length === 0}
                onClick={() => dispatch(closeAllAlgorithms())}
            >
                <PixelIcon name="trash" scale={1} />
                Clear
            </Clear>
        );

    return {
        active,
        algorithms,
        category,
        capacity,
        full,
        algorithmGroups,
        clearButton,
    };
}

/* Wide screens: the algorithm checklist as a sidebar (category is in the
   toolbar at every width). */
function Library(): JSX.Element | null {
    const { active, algorithms, algorithmGroups, clearButton, capacity, full } =
        useLibrary();
    const collapsed = useWidthBelow(LIBRARY_MIN_WIDTH);
    if (collapsed) return null;
    return (
        <Dock aria-label="Algorithms" data-library>
            <Section>
                <Heading>
                    Algorithms
                    <b>
                        {active.length}/{algorithms.length}
                    </b>
                </Heading>
                {clearButton}
            </Section>
            {full && capacity < algorithms.length && (
                <Note role="status" data-full>
                    Full: room for {capacity} here. The next one replaces the
                    oldest.
                </Note>
            )}
            <Scroll>{algorithmGroups}</Scroll>
        </Dock>
    );
}

/*
 * Narrower screens: two selects in the toolbar. Each opens its list in a
 * sheet under the toolbar; picking a category closes it, the algorithm
 * checklist stays open for several picks. Escape or a click outside closes.
 */
export function LibraryPicker(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const overviewOpen = useSelector<RootState, boolean>(getOverviewOpen);
    const {
        active,
        algorithms,
        category,
        capacity,
        full,
        algorithmGroups,
        clearButton,
    } = useLibrary();
    const current = categoryOf(category);
    const collapsed = useWidthBelow(LIBRARY_MIN_WIDTH);
    const [sheet, setSheet] = useState<SheetKind>(null);
    const sheetId = useId();
    const closeSheet = useCallback(() => setSheet(null), []);
    const { ref } = useClickOutside<HTMLDivElement>(closeSheet);

    // Sheets close with Escape, and never linger once the sidebar is back.
    useEffect(() => {
        if (!sheet) return;
        if (!collapsed) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSheet(null);
            return;
        }
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "Escape") setSheet(null);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [sheet, collapsed]);

    const toggle = (kind: Exclude<SheetKind, null>): void =>
        setSheet((open) => (open === kind ? null : kind));

    return (
        <Picker ref={ref}>
            <Select
                type="button"
                aria-expanded={overviewOpen}
                aria-controls={sheetId}
                aria-label={`Category: ${current.label}. Change`}
                onClick={() => {
                    setSheet(null);
                    dispatch(setOverviewOpen(!overviewOpen));
                }}
            >
                <PixelIcon name={current.icon} scale={2} />
                <span data-name>{current.label}</span>
                <i data-chevron aria-hidden="true">
                    <PixelIcon name="chevronDown" scale={2} />
                </i>
            </Select>
            <Select
                type="button"
                data-algorithms-select
                aria-expanded={sheet === "algorithms"}
                aria-controls={sheetId}
                aria-label={`Algorithms: ${active.length} of ${algorithms.length} open. Choose`}
                onClick={() => toggle("algorithms")}
            >
                <span data-word>Algorithms</span>
                <span data-count>
                    <b>{active.length}</b>/{algorithms.length}
                </span>
                <i data-chevron aria-hidden="true">
                    <PixelIcon name="chevronDown" scale={2} />
                </i>
            </Select>
            {sheet === "algorithms" && collapsed && (
                <Sheet id={sheetId} data-sheet>
                    <>
                        <SheetHead>
                            <Heading>{current.label} algorithms</Heading>
                            {clearButton}
                        </SheetHead>
                        {full && (
                            <Note role="status">
                                Room for {capacity} at this size: opening
                                another closes the oldest.
                            </Note>
                        )}
                        {algorithmGroups}
                    </>
                </Sheet>
            )}
        </Picker>
    );
}

export default Library;
