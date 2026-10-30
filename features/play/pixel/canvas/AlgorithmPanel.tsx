import {
    JSX,
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent,
} from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled, { css, keyframes } from "styled-components";
import type {
    AlgorithmMetrics,
    AlgorithmRegistryItem,
} from "../../../../algorithms/types";
import useSizeFlag from "../../../../hooks/useSizeFlag";
import type { AppDispatch, RootState } from "../../../../store";
import {
    closeAlgorithm,
    getHighlightedPanelId,
    getActiveCategory,
    getInput,
    getWindowAlgorithmId,
    openAlgorithmWindow,
} from "../../playSlice";
import { clearBreakpoints } from "../../breakpoints";
import { categoryOf } from "../../categories";
import type { StepInfo } from "../../stepLegend";
import {
    publishGaveUp,
    publishStepInfo,
    publishCaption,
    publishStepMetrics,
    useCaption,
    useCodeSnapshot,
} from "../../stepInfoStore";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelTooltip from "../primitives/PixelTooltip";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";
import PixelMetrics from "./PixelMetrics";

/* Clicks on the panel's own controls keep their job; anywhere else follows
   the algorithm in the Details sidebar (its code and description). */
const INTERACTIVE =
    "button, a, input, select, textarea, [role='slider'], [data-no-observe]";

/* Below every category's minimum panel height, so compact mode only
   kicks in when a panel truly has no room (e.g. a very short window). */
const COMPACT_MAX_HEIGHT = 200;
const isCompactPanel = (_w: number, height: number): boolean =>
    height < COMPACT_MAX_HEIGHT;

/* Counters need room to be readable: below this, the picture wins and
   the numbers wait in focus mode (click the panel). */
const STATS_MIN_HEIGHT = 320;
const STATS_MIN_WIDTH = 300;
const isTooSmallForStats = (width: number, height: number): boolean =>
    height < STATS_MIN_HEIGHT || width < STATS_MIN_WIDTH;

const ants = keyframes`
    to {
        background-position: 8px 0, -8px 100%, 0 -8px, 100% 8px;
    }
`;

const sweep = keyframes`
    from { transform: translateY(-100%); }
    to { transform: translateY(100%); }
`;

const Frame = styled.article<{ $observed: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    min-height: 0;
    padding: 1.2rem 1.6rem 1.2rem;
    background-color: var(--surface);
    cursor: pointer;
    ${pixelFrame("var(--line)")};

    &[data-focused="true"] {
        cursor: default;
    }

    @media (hover: hover) {
        &:hover {
            ${pixelFrame("var(--line-2)")};
        }
    }

    /* Observed by the Inspector: marching-ants pixel border. */
    &::before {
        content: "";
        position: absolute;
        inset: calc(var(--b) * -1);
        pointer-events: none;
        opacity: 0;
        background-image:
            linear-gradient(90deg, var(--accent) 50%, transparent 50%),
            linear-gradient(90deg, var(--accent) 50%, transparent 50%),
            linear-gradient(0deg, var(--accent) 50%, transparent 50%),
            linear-gradient(0deg, var(--accent) 50%, transparent 50%);
        background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
        background-size:
            8px 2px,
            8px 2px,
            2px 8px,
            2px 8px;
        background-position:
            0 0,
            0 100%,
            0 0,
            100% 0;
    }

    ${({ $observed }) =>
        $observed &&
        css`
            &::before {
                opacity: 1;
                animation: ${ants} 0.5s steps(2) infinite;
            }
        `}

    /* Finished: one lit band scans down the panel. */
    &::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
            180deg,
            transparent 0 44%,
            rgba(95, 214, 198, 0.16) 44% 56%,
            transparent 56%
        );
        transform: translateY(-100%);
        opacity: 0;
    }
    &[data-flash="true"]::after {
        opacity: 1;
        animation: ${sweep} 560ms steps(8) both;
    }

    &[data-glitch="true"] [data-chart] {
        animation: px-dither-in 180ms both;
    }

    &[data-compact="true"] {
        padding: 0.6rem 0.8rem 0.6rem;
    }
`;

const Header = styled.header`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.2rem;
    min-width: 0;
`;

const TitleBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    min-width: 0;
`;

const TitleLine = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-width: 0;
`;

const TitleButton = styled.button`
    min-width: 0;
    border: 0;
    background: none;
    color: var(--fg);
    font-family: var(--f-display);
    font-size: 3.2rem;
    line-height: 0.8;
    text-transform: uppercase;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    [data-compact="true"] & {
        font-size: 2.2rem;
    }
`;

const DoneBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.5rem;
    background-color: var(--color-step-finish);
    color: var(--bg);
    ${labelText};
    font-size: 1rem;
    animation: px-dither-in 160ms steps(4) both;

    &[data-gave-up] {
        background-color: var(--danger);
    }
`;

const Egg = styled.span`
    display: inline-flex;
    color: var(--fg-3);
`;

const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.2rem;
    flex: 0 0 auto;

    &[hidden] {
        display: none;
    }
`;

/* What is happening right now, in words. Polite to screen readers only
   while paused: during playback it would talk non-stop. */
const CaptionLine = styled.p`
    flex: 0 0 auto;
    min-height: 2.2rem;
    margin-top: 0.8rem;
    padding-top: 0.6rem;
    border-top: 2px dashed var(--line);
    font-family: var(--f-mono);
    font-size: 1.25rem;
    line-height: 1.4;
    color: var(--fg-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    [data-compact="true"] & {
        margin-top: 0.4rem;
        padding-top: 0.3rem;
        font-size: 1.1rem;
    }
`;

function StepCaption({ id }: { id: string }): JSX.Element {
    const caption = useCaption(id);
    const playing = useSelector<RootState, boolean>(
        (state) => state.play.animation.status === "playing"
    );
    return (
        <CaptionLine
            aria-live={playing ? "off" : "polite"}
            title={caption}
            data-no-observe
        >
            {caption || "\u00a0"}
        </CaptionLine>
    );
}

const MetricsBar = styled.div`
    margin-top: 1.2rem;
    min-width: 0;

    [data-compact="true"] & {
        display: none;
    }
`;

const ChartCell = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
`;

/* Rolling die for the random sorts, sparkle for the miracle. */
function AlgorithmEgg({ id }: { id: string }): JSX.Element | null {
    const [face, setFace] = useState<number>(0);
    const isDice = id === "bogoSort" || id === "bozoSort";

    const roll = useCallback((): (() => void) => {
        let count = 0;
        const timer = setInterval(() => {
            count += 1;
            setFace(Math.floor(Math.random() * 6));
            if (count > 10) clearInterval(timer);
        }, 90);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => (isDice ? roll() : undefined), [isDice, roll]);

    if (isDice) {
        return (
            <Egg onPointerEnter={roll} title="Good luck">
                <PixelIcon name={DICE[face]} scale={2} />
            </Egg>
        );
    }
    if (id === "miracleSort") {
        return (
            <Egg
                title="Waiting for a miracle"
                style={{ animation: "px-blink 1.2s steps(1) infinite" }}
            >
                <PixelIcon name="sparkle" scale={2} />
            </Egg>
        );
    }
    return null;
}

type AlgorithmPanelProps = {
    registry: AlgorithmRegistryItem;
};

function AlgorithmPanel({ registry }: AlgorithmPanelProps): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const { id, meta } = registry;

    const [totals, setTotals] = useState<AlgorithmMetrics | null>(null);
    const observed =
        useSelector<RootState, string | null>(getHighlightedPanelId) === id;
    const input = useSelector<RootState, number[]>(getInput);
    const category = useSelector<RootState, string>(getActiveCategory);
    const def = categoryOf(category);
    const hasInput = category !== "sort" || input.length > 0;
    const Visualizer = def.Visualizer;
    const { gaveUp } = useCodeSnapshot(id);

    // Finished = the global step reached this algorithm's last step.
    const done = useSelector<RootState, boolean>((state) => {
        const algo = state.play.active.algorithms.find((a) => a.id === id);
        if (!algo || algo.stepsLength <= 1) return false;
        return state.play.animation.step.value >= algo.stepsLength - 1;
    });

    const frameRef = useRef<HTMLElement | null>(null);
    const compact = useSizeFlag(frameRef, isCompactPanel);
    const statsHidden = useSizeFlag(frameRef, isTooSmallForStats);
    // Step position feeds every code view of this algorithm.
    const handleStepInfo = useCallback(
        (info: StepInfo | null) => {
            publishStepInfo(id, info);
            publishCaption(id, info?.caption ?? "");
        },
        [id]
    );

    // A closed panel takes its breakpoints with it.
    useEffect(() => () => clearBreakpoints(id), [id]);
    const handleStepMetrics = useCallback(
        (metrics: AlgorithmMetrics | null) => {
            publishStepMetrics(id, metrics);
            publishGaveUp(
                id,
                Boolean(metrics?.gaveUp?.count || metrics?.noPath?.count)
            );
        },
        [id]
    );

    // Lit-band sweep the moment the algorithm finishes.
    const [flash, setFlash] = useState<boolean>(false);
    const prevDone = useRef<boolean>(done);
    useEffect(() => {
        if (done && !prevDone.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFlash(true);
            const timer = setTimeout(() => setFlash(false), 600);
            prevDone.current = done;
            return () => clearTimeout(timer);
        }
        prevDone.current = done;
    }, [done]);

    // Two-frame pixel shift when the input is regenerated.
    const [glitch, setGlitch] = useState<boolean>(false);
    const firstInput = useRef<boolean>(true);
    useEffect(() => {
        if (firstInput.current) {
            firstInput.current = false;
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGlitch(true);
        const timer = setTimeout(() => setGlitch(false), 140);
        return () => clearTimeout(timer);
    }, [input]);

    // In focus mode the window owns the controls (back, tabs): the panel
    // itself is just the picture.
    const focused =
        useSelector<RootState, string | null>(getWindowAlgorithmId) === id;

    // Focus mode: this panel alone, with its code, about and stats.
    const follow = (): void => {
        dispatch(openAlgorithmWindow(id));
    };

    const handleFrameClick = (event: MouseEvent<HTMLElement>): void => {
        if (focused) return;
        if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
        follow();
    };

    return (
        <Frame
            ref={frameRef}
            $observed={observed}
            data-compact={compact}
            data-focused={focused}
            data-flash={flash}
            data-glitch={glitch}
            onClick={handleFrameClick}
            aria-label={`${meta.name}${done ? ", finished" : ""}`}
        >
            <Header>
                <TitleBlock>
                    <TitleLine>
                        <TitleButton as="h3">{meta.name}</TitleButton>
                        <AlgorithmEgg id={id} />
                        {done && (
                            <DoneBadge data-gave-up={gaveUp || undefined}>
                                <PixelIcon
                                    name={gaveUp ? "close" : "check"}
                                    scale={1}
                                />
                                {gaveUp ? def.failLabel(totals) : def.doneLabel}
                            </DoneBadge>
                        )}
                    </TitleLine>
                </TitleBlock>
                <Actions hidden={focused}>
                    {def.panelAction && (
                        <PixelTooltip
                            label={def.panelAction.label}
                            side="bottom"
                        >
                            <PixelButton
                                type="button"
                                $variant="ghost"
                                $size="sm"
                                $square
                                aria-label={`${def.panelAction.label}: ${meta.name}`}
                                onClick={() =>
                                    def.panelAction
                                        ?.run(id, store.getState().play)
                                        .forEach((action) => dispatch(action))
                                }
                            >
                                <PixelIcon
                                    name={def.panelAction.icon}
                                    scale={2}
                                />
                            </PixelButton>
                        </PixelTooltip>
                    )}
                    <PixelTooltip label="Code · About" side="bottom">
                        <PixelButton
                            type="button"
                            $variant="ghost"
                            $size="sm"
                            $square
                            aria-label={`Code and description of ${meta.name}`}
                            onClick={() => dispatch(openAlgorithmWindow(id))}
                        >
                            <PixelIcon name="info" scale={2} />
                        </PixelButton>
                    </PixelTooltip>
                    <PixelTooltip label="Close" side="bottom" align="end">
                        <PixelButton
                            type="button"
                            $variant="ghost"
                            $size="sm"
                            $square
                            aria-label={`Close ${meta.name}`}
                            onClick={() => dispatch(closeAlgorithm(id))}
                        >
                            <PixelIcon name="close" scale={2} />
                        </PixelButton>
                    </PixelTooltip>
                </Actions>
            </Header>
            {hasInput && !statsHidden && (
                <MetricsBar data-metrics-bar>
                    <PixelMetrics id={id} totals={totals} />
                </MetricsBar>
            )}
            <ChartCell data-chart>
                <Visualizer
                    registry={registry}
                    onMetricsUpdate={setTotals}
                    onStepMetricsUpdate={handleStepMetrics}
                    onStepInfoUpdate={handleStepInfo}
                />
            </ChartCell>
            <StepCaption id={id} />
        </Frame>
    );
}

export default AlgorithmPanel;
