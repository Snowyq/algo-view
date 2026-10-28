import {
    JSX,
    memo,
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type KeyboardEvent,
} from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled from "styled-components";
import useClickOutside from "../../../../hooks/useClickOutside";
import type { AppDispatch, RootState } from "../../../../store";
import {
    changeSpeed,
    freezeAnimation,
    getActiveAlgorithms,
    getCurrentSpeed,
    getSpeeds,
    startAnimation,
    type ActiveAlgorithm,
} from "../../playSlice";
import PixelIcon from "../primitives/PixelIcon";
import { labelText, pixelFrame, pixelRaised } from "../primitives/pixel";
import { ANIMALS } from "../sprites/animals";
import PixelSprite from "../sprites/PixelSprite";
import { TINY, SHORT } from "../media";
import { animalForSpeed, formatSpeed, paceOf } from "../sprites/speedAnimals";

const Wrap = styled.div`
    position: relative;
`;

const Trigger = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    height: 4.8rem;
    padding: 0 1rem 0 0.2rem;
    margin: var(--b);
    border: 0;
    background-color: var(--surface-2);
    color: var(--fg);
    ${pixelRaised("var(--line-2)")};

    &[aria-expanded="true"] {
        ${pixelFrame("var(--accent)")};
    }
    &:active {
        transform: translateY(var(--b));
    }

    /* The runner above already shows the animal; keep only the time. */
    @media ${TINY} {
        padding: 0 0.8rem;

        & > canvas,
        small {
            display: none !important;
        }
    }
    @media ${SHORT} {
        height: 4rem;
    }
`;

const TriggerText = styled.span`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;

    small {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-3);
    }
    strong {
        font-family: var(--f-display);
        font-weight: 400;
        font-size: 2.2rem;
        line-height: 0.8;
    }
`;

/* Opens upward from the dock in four frames, like a menu in a bitmap OS. */
const Panel = styled.div`
    position: absolute;
    right: 0;
    bottom: calc(100% + 1.2rem);
    z-index: 70;
    width: min(46rem, calc(100vw - 3.2rem));
    padding: 1.2rem;
    background-color: var(--surface);
    ${pixelFrame("var(--line-2)")};
    transform-origin: bottom right;
    animation: px-menu-in 140ms steps(4) both;
    /* Never taller than the room above the dock; scroll if it must. */
    max-height: calc(100svh - var(--toolbar-h) - 12rem);
    overflow-y: auto;
    overscroll-behavior: contain;

    /* Landscape phones: one wide strip, every speed visible at once. */
    @media ${SHORT} {
        width: min(72rem, calc(100vw - 3.2rem));
    }
`;

const PanelHead = styled.p`
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    ${labelText};
    color: var(--fg-3);
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.8rem;

    @media ${SHORT} {
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.4rem;
    }
`;

const Option = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.4rem 0.8rem;
    margin: var(--b);
    background-color: var(--bg-2);
    color: var(--fg-2);
    cursor: pointer;
    outline: none;
    ${pixelFrame("var(--line)")};

    &:hover,
    &:focus-visible {
        background-color: var(--surface-2);
        ${pixelFrame("var(--fg-3)")};
    }
    &[aria-selected="true"] {
        background-color: var(--surface-3);
        color: var(--fg);
        ${pixelFrame("var(--accent)")};
    }
`;

const OptionName = styled.span`
    ${labelText};
    font-size: 1rem;
`;

const OptionSpeed = styled.span`
    font-family: var(--f-display);
    font-size: 2rem;
    line-height: 0.8;
`;

/* Ten blocks of relative pace, log scale. */
const Pace = styled.span`
    display: flex;
    gap: 2px;

    i {
        width: 4px;
        height: 4px;
        background-color: var(--line);
    }
    i[data-on="true"] {
        background-color: var(--accent);
    }
`;

const Warn = styled.span`
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    color: var(--color-step-check);
    animation: px-blink 1s steps(1) infinite;
`;

/* Fast intervals with many panels can drop frames. */
const isUnstableSpeed = (ms: number): boolean => ms === 1 || ms === 5;

function SpeedMenu(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const speeds = useSelector<RootState, number[]>(getSpeeds);
    const speed = useSelector<RootState, number>(getCurrentSpeed);
    const panels = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    ).length;
    const [open, setOpen] = useState<boolean>(false);
    const [hovered, setHovered] = useState<number | null>(null);
    const resumeRef = useRef<boolean>(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
    const listId = useId();

    const close = useCallback(
        (refocus = false): void => {
            setOpen(false);
            setHovered(null);
            if (resumeRef.current) {
                resumeRef.current = false;
                dispatch(startAnimation());
            }
            if (refocus) triggerRef.current?.focus();
        },
        [dispatch]
    );

    const closeOutside = useCallback(() => {
        if (open) close();
    }, [close, open]);
    const { ref } = useClickOutside<HTMLDivElement>(closeOutside);

    // Pause while choosing, so the runner and the menu don't disagree.
    const openMenu = (): void => {
        if (store.getState().play.animation.status === "playing") {
            resumeRef.current = true;
            dispatch(freezeAnimation());
        }
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;
        const index = Math.max(0, speeds.indexOf(speed));
        optionRefs.current[index]?.focus();
        // Focus only when opening.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Escape closes the menu wherever focus is.
    useEffect(() => {
        if (!open) return;
        const onKey = (event: globalThis.KeyboardEvent): void => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            close(true);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, close]);

    const choose = (ms: number): void => {
        dispatch(changeSpeed(ms));
        close(true);
    };

    const handleKey = (event: KeyboardEvent<HTMLDivElement>): void => {
        const current = optionRefs.current.findIndex(
            (el) => el === document.activeElement
        );
        // Whatever the grid shows right now (3 columns, 5 in landscape).
        const grid = optionRefs.current[0]?.parentElement;
        const cols = grid
            ? getComputedStyle(grid).gridTemplateColumns.split(" ").length
            : 3;
        const moves: Record<string, number> = {
            ArrowRight: 1,
            ArrowLeft: -1,
            ArrowDown: cols,
            ArrowUp: -cols,
        };
        if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            optionRefs.current[
                event.key === "Home" ? 0 : speeds.length - 1
            ]?.focus();
            return;
        }
        if (event.key in moves) {
            event.preventDefault();
            event.stopPropagation();
            const next = Math.min(
                speeds.length - 1,
                Math.max(0, current + moves[event.key])
            );
            optionRefs.current[next]?.focus();
            return;
        }
        if ((event.key === "Enter" || event.key === " ") && current >= 0) {
            event.preventDefault();
            choose(speeds[current]);
        }
    };

    const animal = ANIMALS[animalForSpeed(speed)];

    return (
        <Wrap ref={ref}>
            <Trigger
                ref={triggerRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listId}
                aria-label={`Speed: ${animal.name}, one step every ${formatSpeed(speed)}`}
                onClick={() => (open ? close() : openMenu())}
            >
                <PixelSprite animal={animal.id} state="idle" scale={2} />
                <TriggerText>
                    <small>{animal.name}</small>
                    <strong>{formatSpeed(speed)}</strong>
                </TriggerText>
                <PixelIcon
                    name={open ? "chevronDown" : "chevronUp"}
                    scale={1}
                />
            </Trigger>
            {open && (
                <Panel>
                    <PanelHead>
                        <span>One step every…</span>
                        <span>{panels} panels</span>
                    </PanelHead>
                    <Grid
                        id={listId}
                        role="listbox"
                        aria-label="Playback speed"
                        onKeyDown={handleKey}
                    >
                        {speeds.map((ms, index) => {
                            const option = ANIMALS[animalForSpeed(ms)];
                            const pace = Math.round(paceOf(ms, speeds) * 9) + 1;
                            const active = hovered === ms;
                            return (
                                <Option
                                    key={ms}
                                    ref={(el) => {
                                        optionRefs.current[index] = el;
                                    }}
                                    role="option"
                                    tabIndex={ms === speed ? 0 : -1}
                                    aria-selected={ms === speed}
                                    aria-label={`${option.name}, ${formatSpeed(ms)}${isUnstableSpeed(ms) ? ", may stutter with many panels" : ""}`}
                                    onClick={() => choose(ms)}
                                    onPointerEnter={() => setHovered(ms)}
                                    onPointerLeave={() => setHovered(null)}
                                    onFocus={() => setHovered(ms)}
                                >
                                    <PixelSprite
                                        animal={option.id}
                                        state={
                                            active || ms === speed
                                                ? "run"
                                                : "idle"
                                        }
                                        scale={2}
                                    />
                                    <OptionSpeed>{formatSpeed(ms)}</OptionSpeed>
                                    <OptionName>
                                        {option.name} {option.gait}
                                    </OptionName>
                                    <Pace aria-hidden="true">
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <i key={i} data-on={i < pace} />
                                        ))}
                                    </Pace>
                                    {isUnstableSpeed(ms) && panels > 2 && (
                                        <Warn title="May stutter with many panels">
                                            <PixelIcon
                                                name="warning"
                                                scale={2}
                                            />
                                        </Warn>
                                    )}
                                </Option>
                            );
                        })}
                    </Grid>
                </Panel>
            )}
        </Wrap>
    );
}

export default memo(SpeedMenu);
