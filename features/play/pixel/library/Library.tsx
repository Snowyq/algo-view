import { JSX, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../../../constants/breakpoints";
import useWindowSize from "../../../../hooks/useWindowSize";
import type { AppDispatch, RootState } from "../../../../store";
import {
    closeAlgorithm,
    changeCategory,
    closeAllAlgorithms,
    getActiveCategory,
    getActiveAlgorithms,
    getAlgorithms,
    openAlgorithm,
    type ActiveAlgorithm,
    type RegistryAlgorithm,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelTooltip from "../primitives/PixelTooltip";
import { labelText, pixelFrame } from "../primitives/pixel";

const MOBILE_LIMIT = 3;

const Dock = styled.nav`
    display: flex;
    flex-direction: column;
    min-height: 0;
    background-color: var(--bg-2);
    border-right: var(--b) solid var(--line);

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        border-right: 0;
        border-bottom: var(--b) solid var(--line);
    }
`;

const Head = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    padding: 1.2rem 1.2rem 0.8rem 1.6rem;

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: none;
    }
`;

const Title = styled.h2`
    ${labelText};
    font-size: 1.2rem;
    color: var(--fg-3);

    b {
        color: var(--accent);
        font-weight: 400;
    }
`;

const Scroll = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0.4rem 1.2rem 1.6rem;

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: flex;
        gap: 0.4rem;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 0.8rem 1.2rem;
        scrollbar-width: none;
    }
`;

const Group = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    & + & {
        margin-top: 1.6rem;
    }

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        flex-direction: row;
        gap: 0.4rem;

        & + & {
            margin-top: 0;
            margin-left: 1.2rem;
        }
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

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: none;
    }
`;

const Row = styled.button`
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
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

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: flex;
        width: auto;
        min-height: 4.4rem;
        padding: 0.4rem 1.2rem 0.4rem 0.6rem;
        white-space: nowrap;
        background-color: var(--surface);
        ${pixelFrame("var(--line)")};
        margin: var(--b);

        &[aria-pressed="true"] {
            ${pixelFrame("var(--accent)")};
        }
        &[aria-pressed="true"]::before {
            display: none;
        }
        [data-complexity] {
            display: none;
        }
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
    white-space: nowrap;
    line-height: 1.3;
    font-family: var(--f-mono);
    font-size: 1.1rem;
    color: var(--fg-4);
`;

/* Category switch: two pixel keys; the active one is pressed in. */
const Categories = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
    padding: 1.2rem 1.2rem 0.4rem;

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: flex;
        padding: 0.8rem 1.2rem 0;
    }
`;

const CategoryKey = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    height: 3.6rem;
    margin: var(--b);
    padding: 0 1.2rem;
    border: 0;
    background-color: var(--surface);
    color: var(--fg-3);
    ${labelText};
    ${pixelFrame("var(--line)")};

    &[aria-pressed="true"] {
        background-color: var(--accent);
        color: var(--accent-ink);
        ${pixelFrame("var(--accent-2)")};
        transform: translateY(1px);
    }
    @media (hover: hover) {
        &:hover:not([aria-pressed="true"]) {
            color: var(--fg);
            ${pixelFrame("var(--fg-3)")};
        }
    }
`;

const CATEGORIES = [
    { id: "sort", label: "Sort", icon: "metrics" as const },
    { id: "path", label: "Path", icon: "share" as const },
];

const Note = styled.p`
    margin: 0 1.6rem 1.2rem;
    font-size: 1.3rem;
    color: var(--fg-3);
`;

function Library(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const algorithms = useSelector<RootState, RegistryAlgorithm[]>(
        getAlgorithms
    );
    const category = useSelector<RootState, string>(getActiveCategory);
    const { size } = useWindowSize();
    const breakpoint = Number.parseInt(PLAY_LAYOUT_BREAKPOINT, 10);
    const isMobile =
        size.width > 0 &&
        Number.isFinite(breakpoint) &&
        size.width < breakpoint;
    const limitReached = isMobile && active.length >= MOBILE_LIMIT;

    // Small screens show at most three panels; trim extras on resize.
    useEffect(() => {
        if (!isMobile || active.length <= MOBILE_LIMIT) return;
        active
            .slice(MOBILE_LIMIT)
            .forEach((algo) => dispatch(closeAlgorithm(algo.id)));
    }, [active, dispatch, isMobile]);

    const renderRow = (algo: RegistryAlgorithm): JSX.Element => {
        const selected = active.some((item) => item.id === algo.id);
        const disabled = !selected && limitReached;
        return (
            <li key={algo.id} data-lib-row>
                <Row
                    type="button"
                    aria-pressed={selected}
                    disabled={disabled}
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

    return (
        <Dock aria-label="Algorithms" data-library>
            <Categories role="group" aria-label="Category">
                {CATEGORIES.map((item) => (
                    <CategoryKey
                        key={item.id}
                        type="button"
                        aria-pressed={category === item.id}
                        onClick={() => dispatch(changeCategory(item.id))}
                    >
                        <PixelIcon name={item.icon} scale={1} />
                        {item.label}
                    </CategoryKey>
                ))}
            </Categories>
            <Head>
                <Title>
                    Algorithms <b>{active.length}</b>/{algorithms.length}
                </Title>
                <PixelTooltip label="Close all" side="bottom" align="end">
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        $size="sm"
                        $square
                        aria-label="Close all algorithms"
                        disabled={active.length === 0}
                        onClick={() => dispatch(closeAllAlgorithms())}
                    >
                        <PixelIcon name="trash" scale={2} />
                    </PixelButton>
                </PixelTooltip>
            </Head>
            {limitReached && (
                <Note role="status">
                    Small screens show up to {MOBILE_LIMIT} at once.
                </Note>
            )}
            <Scroll>
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
            </Scroll>
        </Dock>
    );
}

export default Library;
