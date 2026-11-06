import {
    JSX,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type RefObject,
} from "react";
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
import {
    blockPattern,
    labelText,
    pixelCorners,
    pixelFrame,
    scrollY,
} from "../primitives/pixel";
import { useEscapeKey } from "../../../../hooks/useEscapeKey";
import AlgorithmPeek from "./AlgorithmPeek";

/*
 * Algorithm checklist: a sidebar on wide screens, a toolbar select with a
 * sheet below LIBRARY_COLLAPSE (LibraryPicker).
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

/* Plain text button, small enough to sit beside the heading. */
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
        &:hover {
            color: var(--danger);
            background-color: var(--surface);
        }
    }
`;

const Scroll = styled.div`
    flex: 1;
    min-height: 0;
    ${scrollY};
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
        ${blockPattern("var(--line)", 2, 2)};
    }
`;

const Row = styled.button`
    position: relative;
    display: grid;
    /* name gets its full width first; complexity truncates */
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

    /* selected rows get a notch on the left edge */
    &[aria-pressed="true"]::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0.8rem;
        bottom: 0.8rem;
        width: 4px;
        background-color: var(--accent);
        animation: px-dither-in 120ms steps(3) both;
    }

    &:disabled {
        color: var(--fg-4);
        cursor: not-allowed;
    }

    &:active:not(:disabled) [data-box] {
        transform: translateY(2px);
    }

    ${pixelCorners("var(--fg-3)", "&:hover, &:focus-visible", "0.8rem")};

    @media (pointer: coarse) {
        min-height: 4.8rem;
    }
`;

/* Checkbox whose tick draws itself in three frames. */
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

/* Single line: the row's icon zeroes line-height, so wrapped lines would overlap. */
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

/* Category select at every width; Algorithms only once the sidebar folds. */
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
    position: relative;
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
    /* chevron flips while its sheet is open */
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
    ${pixelCorners("var(--accent)", "&:hover, &:focus-visible", "0.8rem")};

    /* the count never shrinks; names do */
    [data-count] {
        flex: 0 0 auto;
        overflow: visible;
    }

    /* phones: icon and count only */
    @media ${NARROW} {
        padding: 0 0.8rem;
        gap: 0.6rem;

        [data-word] {
            display: none;
        }
    }
    /* smallest phones: category is just its icon */
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
    ${scrollY};
    padding: 1.6rem 1.2rem 2rem;
    background-color: var(--bg-2);
    border-bottom: var(--b) solid var(--line-2);
    box-shadow: 0 1.2rem 0 rgba(21, 18, 15, 0.6);
    animation: px-dither-in 160ms steps(4) both;

    /* two columns when the sheet is wide enough */
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

function useWidthBelow(px: number): boolean {
    const { size } = useWindowSize();
    return size.width > 0 && size.width < px;
}

/* Data both layouts need. */
function useLibrary(): {
    active: ActiveAlgorithm[];
    algorithms: RegistryAlgorithm[];
    category: string;
    capacity: number;
    full: boolean;
} {
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const algorithms = useSelector<RootState, RegistryAlgorithm[]>(
        getAlgorithms
    );
    const category = useSelector<RootState, string>(getActiveCategory);
    const capacity = useSelector<RootState, number>(getPanelCapacity);
    const full = active.length >= capacity;
    return { active, algorithms, category, capacity, full };
}

type AlgorithmRowProps = {
    algo: RegistryAlgorithm;
    index: number;
    selected: boolean;
};

function AlgorithmRow({
    algo,
    index,
    selected,
}: AlgorithmRowProps): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    return (
        <li
            data-lib-row
            data-id={algo.id}
            style={{ "--i": index } as CSSProperties}
        >
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
                <Complexity data-complexity>{algo.timeComplexity}</Complexity>
            </Row>
        </li>
    );
}

function AlgorithmGroups({
    algorithms,
    active,
}: {
    algorithms: RegistryAlgorithm[];
    active: ActiveAlgorithm[];
}): JSX.Element {
    const renderRow = (algo: RegistryAlgorithm, index: number): JSX.Element => (
        <AlgorithmRow
            key={algo.id}
            algo={algo}
            index={index}
            selected={active.some((item) => item.id === algo.id)}
        />
    );
    const classic = algorithms.filter((algo) => algo.group !== "fun");
    const fun = algorithms.filter((algo) => algo.group === "fun");

    return (
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
}

function ClearButton(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    return (
        <Clear
            type="button"
            aria-label="Close all algorithms"
            onClick={() => dispatch(closeAllAlgorithms())}
        >
            <PixelIcon name="trash" scale={1} />
            Clear
        </Clear>
    );
}

type Peek = { id: string; top: number; left: number };

/* Hover or focus on a row shows its card after `delay`; leaving hides it at once. */
function useRowPeek(dockRef: RefObject<HTMLElement | null>): {
    peek: Peek | null;
    showPeek: (target: EventTarget | null, delay: number) => void;
    hidePeek: () => void;
} {
    const [peek, setPeek] = useState<Peek | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showPeek = (target: EventTarget | null, delay: number): void => {
        const row = (target as HTMLElement | null)?.closest<HTMLElement>(
            "[data-lib-row]"
        );
        if (timer.current) clearTimeout(timer.current);
        if (!row?.dataset.id) {
            setPeek(null);
            return;
        }
        const id = row.dataset.id;
        const top = row.getBoundingClientRect().top;
        const left = (dockRef.current?.getBoundingClientRect().right ?? 0) + 8;
        timer.current = setTimeout(() => setPeek({ id, top, left }), delay);
    };
    const hidePeek = (): void => {
        if (timer.current) clearTimeout(timer.current);
        setPeek(null);
    };
    useEffect(() => hidePeek, []);

    return { peek, showPeek, hidePeek };
}

/* Wide screens: the algorithm checklist as a sidebar. */
function Library(): JSX.Element {
    const { active, algorithms, category, capacity, full } = useLibrary();
    // visibility is CSS only (see Dock); doing it in JS flickered across the breakpoint
    const dockRef = useRef<HTMLElement | null>(null);
    const { peek, showPeek, hidePeek } = useRowPeek(dockRef);

    const peeked = peek
        ? algorithms.find((algo) => algo.id === peek.id)
        : undefined;

    return (
        <Dock aria-label="Algorithms" data-library ref={dockRef}>
            <Section>
                <Heading>
                    Algorithms
                    <b>
                        {active.length}/{algorithms.length}
                    </b>
                </Heading>
                {active.length > 0 && <ClearButton />}
            </Section>
            {full && capacity < algorithms.length && (
                <Note role="status" data-full>
                    Full: room for {capacity} here. The next one replaces the
                    oldest.
                </Note>
            )}
            <Scroll
                key={category}
                onPointerOver={(event) =>
                    event.pointerType === "mouse" && showPeek(event.target, 280)
                }
                onPointerLeave={hidePeek}
                onFocus={(event) => showPeek(event.target, 0)}
                onBlur={hidePeek}
                onScroll={hidePeek}
            >
                <AlgorithmGroups algorithms={algorithms} active={active} />
            </Scroll>
            {peeked && peek && (
                <AlgorithmPeek
                    algorithm={peeked}
                    left={peek.left}
                    top={Math.max(
                        64,
                        Math.min(peek.top, window.innerHeight - 280)
                    )}
                />
            )}
        </Dock>
    );
}

/*
 * Narrower screens: toolbar selects. Category opens the overview; Algorithms
 * opens a checklist sheet that stays open for several picks.
 */
export function LibraryPicker(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const overviewOpen = useSelector<RootState, boolean>(getOverviewOpen);
    const { active, algorithms, category, capacity, full } = useLibrary();
    const current = categoryOf(category);
    const collapsed = useWidthBelow(LIBRARY_MIN_WIDTH);
    const [sheetOpen, setSheetOpen] = useState<boolean>(false);
    const sheetId = useId();
    const closeSheet = useCallback(() => setSheetOpen(false), []);
    const { ref } = useClickOutside<HTMLDivElement>(closeSheet);

    // never linger once the sidebar is back
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (sheetOpen && !collapsed) setSheetOpen(false);
    }, [sheetOpen, collapsed]);
    useEscapeKey(sheetOpen && collapsed, closeSheet);

    return (
        <Picker ref={ref}>
            <Select
                type="button"
                aria-expanded={overviewOpen}
                aria-controls={sheetId}
                aria-label={`Category: ${current.label}. Change`}
                onClick={() => {
                    setSheetOpen(false);
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
                aria-expanded={sheetOpen}
                aria-controls={sheetId}
                aria-label={`Algorithms: ${active.length} of ${algorithms.length} open. Choose`}
                onClick={() => setSheetOpen((open) => !open)}
            >
                <span data-word>Algorithms</span>
                <span data-count>
                    <b>{active.length}</b>/{algorithms.length}
                </span>
                <i data-chevron aria-hidden="true">
                    <PixelIcon name="chevronDown" scale={2} />
                </i>
            </Select>
            {sheetOpen && collapsed && (
                <Sheet id={sheetId} data-sheet>
                    <SheetHead>
                        <Heading>{current.label} algorithms</Heading>
                        {active.length > 0 && <ClearButton />}
                    </SheetHead>
                    {full && (
                        <Note role="status">
                            Room for {capacity} at this size: opening another
                            closes the oldest.
                        </Note>
                    )}
                    <AlgorithmGroups algorithms={algorithms} active={active} />
                </Sheet>
            )}
        </Picker>
    );
}

export default Library;
