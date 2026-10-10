import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { BsCodeSlash, BsInfoCircle } from "react-icons/bs";
import { IoIosClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import type {
    AlgorithmMetrics,
    AlgorithmRegistryItem,
} from "../../algorithms/types";
import type { AppDispatch, RootState } from "../../store";
import useSizeFlag from "../../hooks/useSizeFlag";
import AnimatedText from "../../ui/AnimatedText";
import ButtonIcon from "../../ui/ButtonIcon";
import AlgorithmInfo from "./AlgorithmInfo";
import CodePanel from "./CodePanel";
import {
    closeAlgorithm,
    observeAlgorithm,
    getAllCodeVisible,
    getAllMetricsVisible,
    getInput,
    showCodeInSidebar,
    showInfoInSidebar,
} from "./playSlice";
import SortVisualizerCanvas from "./SortVisualizerCanvas";
import StepMetricsPanel from "./StepMetricsPanel";
import type { StepInfo } from "./stepLegend";
import { publishGaveUp, publishStepInfo } from "./stepInfoStore";
import useSideCodeFits from "./useSideCodeFits";

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    width: 100%;
    min-height: 3.6rem;
`;

const Heading = styled.h2`
    font-family: var(--font-display-stack);
    font-variation-settings: "opsz" 48;
    font-weight: 700;
    font-size: 2.6rem;
    line-height: 1;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    color: var(--text);
`;

/*
 * Compact (short panels, many open): the header stops taking height and
 * floats over the chart as two small labels, so the chart keeps the space.
 */
const TitleButton = styled.button`
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    text-align: left;
`;

const Container = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    container-type: inline-size;

    &[data-compact="true"] {
        /* Header floats over the chart. */
        & > [data-panel-top] {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 2;
            padding: 0;
            pointer-events: none;
        }

        & [data-panel-header] {
            align-items: flex-start;
            min-height: 0;
        }

        & [data-panel-title],
        & [data-panel-actions] {
            pointer-events: auto;
            padding: 0.2rem 0.4rem;
            border-radius: var(--radius-xs);
            background-color: color-mix(
                in srgb,
                var(--ink-900) 92%,
                transparent
            );
        }

        & [data-panel-title] {
            font-size: 1.5rem;
            padding: 0.4rem 0.6rem;
        }

        & [data-panel-actions] {
            gap: var(--space-1);
        }

        & [data-panel-meta] {
            display: none;
        }
    }
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
`;

const CodeToggle = styled(ButtonIcon)`
    flex: 0 0 auto;

    &[aria-pressed="true"] {
        --background: var(--ink-800);
        --color: var(--text);
    }
`;

const Top = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding-bottom: var(--space-2);
    width: 100%;
`;

/* Compact facts; best/worst only once the panel has room for them. */
const MetaLine = styled.dl`
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem var(--space-3);
    font-family: var(--font-mono-stack);
    font-size: 1.1rem;
    letter-spacing: 0.04em;
    color: var(--text-muted);

    div {
        display: inline-flex;
        gap: 0.5rem;
    }

    dt {
        color: var(--text-faint);
    }

    dd {
        color: var(--text-soft);
    }

    [data-wide] {
        display: none;
    }

    @container (min-width: 520px) {
        [data-wide] {
            display: inline-flex;
        }
    }
`;

/* Code sits next to the chart, and only when useSideCodeFits says it fits. */
const Main = styled.div<{ $withCode: boolean }>`
    display: grid;
    grid-template-columns: ${({ $withCode }) =>
        $withCode ? "minmax(0, 1fr) minmax(28rem, 0.85fr)" : "minmax(0, 1fr)"};
    grid-template-rows: minmax(0, 1fr);
    gap: var(--space-3);
    flex: 1;
    min-height: 0;
    width: 100%;
`;

const ChartCell = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
`;

/* Neutral at rest; red only on hover, since red also means "check false". */
const CloseButton = styled(ButtonIcon)`
    --hover-background: rgba(255, 125, 125, 0.16);
    --hover-color: var(--danger);
`;

/* Same surface as the code view, so the side column reads as one place. */
const InfoCard = styled.section`
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--space-4);
    border: 1px solid var(--ink-700);
    border-radius: var(--radius-md);
    background-color: var(--ink-950);
`;

const MetricsOverlay = styled.div`
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
`;

/* Below this the full header would leave the chart (almost) no height. */
const COMPACT_MAX_HEIGHT = 200;
const isCompactPanel = (_width: number, height: number): boolean =>
    height < COMPACT_MAX_HEIGHT;

type SideView = "code" | "info" | null;

type SortAlgorithmPanelProps = {
    registry: AlgorithmRegistryItem;
};

function SortAlgorithmPanel({
    registry,
}: SortAlgorithmPanelProps): JSX.Element {
    const [showMetrics, setShowMetrics] = useState<boolean>(false);
    const [baseMetrics, setBaseMetrics] = useState<AlgorithmMetrics | null>(
        null
    );
    const [stepMetrics, setStepMetrics] = useState<AlgorithmMetrics | null>(
        null
    );

    const allMetricsVisible = useSelector<RootState, boolean>(
        getAllMetricsVisible
    );
    const allCodeVisible = useSelector<RootState, boolean>(getAllCodeVisible);

    // One side column, showing code or info. The global code toggle drives
    // it too: on -> code, off -> closes it if it was showing code.
    const [sideView, setSideView] = useState<SideView>(
        allCodeVisible ? "code" : null
    );
    const [prevAllCode, setPrevAllCode] = useState<boolean>(allCodeVisible);
    if (allCodeVisible !== prevAllCode) {
        setPrevAllCode(allCodeVisible);
        if (allCodeVisible) setSideView("code");
        else if (sideView === "code") setSideView(null);
    }

    const dispatch = useDispatch<AppDispatch>();
    const mainRef = useRef<HTMLDivElement | null>(null);
    const sideFits = useSideCodeFits(mainRef);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const compact = useSizeFlag(containerRef, isCompactPanel);

    const { id, meta } = registry;
    const instructions = registry.algorithm.instructions;
    const canShowCode = Boolean(instructions);
    // Only shown in the panel when the side column fits; else -> sidebar.
    const inlineView: SideView = sideFits
        ? sideView === "code" && !canShowCode
            ? null
            : sideView
        : null;

    // Step position feeds every code view of this algorithm (panel + sidebar).
    const handleStepInfo = useCallback(
        (info: StepInfo | null) => publishStepInfo(id, info),
        [id]
    );
    const handleStepMetrics = useCallback(
        (metrics: AlgorithmMetrics | null) => {
            setStepMetrics(metrics);
            publishGaveUp(id, Boolean(metrics?.gaveUp?.count));
        },
        [id]
    );

    // Too tight for side-by-side: the buttons send the view to the sidebar.
    const viewLabel = (view: "code" | "info", name: string): string =>
        !sideFits
            ? `Show ${name} in sidebar`
            : inlineView === view
              ? `Hide ${name}`
              : `Show ${name}`;
    const handleViewButton = (view: "code" | "info"): void => {
        if (sideFits) {
            setSideView((current) => (current === view ? null : view));
            return;
        }
        dispatch(
            view === "code" ? showCodeInSidebar(id) : showInfoInSidebar(id)
        );
    };
    const codeLabel = viewLabel("code", "code");
    const infoLabel = viewLabel("info", "info");
    const input = useSelector<RootState, number[]>(getInput);
    const hasInput = Array.isArray(input) && input.length > 0;

    useEffect((): void => {
        setShowMetrics(allMetricsVisible);
    }, [allMetricsVisible]);

    return (
        <Container ref={containerRef} data-compact={compact}>
            <Top data-panel-top>
                <Header data-panel-header>
                    <Heading data-panel-title>
                        {/* Keyboard path to "observe this panel". */}
                        <TitleButton
                            type="button"
                            onClick={() => dispatch(observeAlgorithm(id))}
                            aria-label={`Show ${meta.name} in sidebar`}
                        >
                            <AnimatedText show={true}>
                                {registry.meta.name}
                            </AnimatedText>
                        </TitleButton>
                    </Heading>
                    <HeaderActions data-panel-actions>
                        {showMetrics && hasInput && (
                            <MetricsOverlay>
                                <StepMetricsPanel
                                    metrics={baseMetrics}
                                    stepMetrics={stepMetrics}
                                />
                            </MetricsOverlay>
                        )}
                        {canShowCode && (
                            <CodeToggle
                                type="button"
                                onClick={() => handleViewButton("code")}
                                aria-pressed={
                                    sideFits ? inlineView === "code" : undefined
                                }
                                aria-label={`${codeLabel}: ${registry.meta.name}`}
                                title={codeLabel}
                                size={compact ? "1.4rem" : "1.6rem"}
                                padding={compact ? "0.6rem" : "0.8rem"}
                            >
                                <BsCodeSlash />
                            </CodeToggle>
                        )}
                        <CodeToggle
                            type="button"
                            onClick={() => handleViewButton("info")}
                            aria-pressed={
                                sideFits ? inlineView === "info" : undefined
                            }
                            aria-label={`${infoLabel}: ${meta.name}`}
                            title={infoLabel}
                            size={compact ? "1.4rem" : "1.6rem"}
                            padding={compact ? "0.6rem" : "0.8rem"}
                        >
                            <BsInfoCircle />
                        </CodeToggle>
                        <CloseButton
                            type="button"
                            onClick={() => dispatch(closeAlgorithm(id))}
                            aria-label={`Close ${meta.name}`}
                            title="Close"
                            size={compact ? "1.6rem" : "2rem"}
                            padding={compact ? "0.5rem" : "0.6rem"}
                        >
                            <IoIosClose />
                        </CloseButton>
                    </HeaderActions>
                </Header>
                <MetaLine
                    data-panel-meta
                    aria-label={`${meta.name} properties`}
                >
                    <div data-wide>
                        <dt>best</dt>
                        <dd>{meta.bestCase}</dd>
                    </div>
                    <div>
                        <dt>avg</dt>
                        <dd>{meta.timeComplexity}</dd>
                    </div>
                    <div data-wide>
                        <dt>worst</dt>
                        <dd>{meta.worstCase}</dd>
                    </div>
                    <div>
                        <dt>space</dt>
                        <dd>{meta.auxiliarySpace}</dd>
                    </div>
                    <div>
                        <dd>{meta.stable ? "stable" : "unstable"}</dd>
                    </div>
                    <div data-wide>
                        <dd>{meta.inPlace ? "in-place" : "extra memory"}</dd>
                    </div>
                </MetaLine>
            </Top>
            <Main
                ref={mainRef}
                $withCode={inlineView !== null}
                data-side-view={inlineView ?? undefined}
            >
                <ChartCell>
                    <SortVisualizerCanvas
                        registry={registry}
                        onMetricsUpdate={setBaseMetrics}
                        onStepMetricsUpdate={handleStepMetrics}
                        onStepInfoUpdate={handleStepInfo}
                    />
                </ChartCell>
                {inlineView === "code" && instructions && (
                    <CodePanel
                        algorithmId={id}
                        name={meta.name}
                        instructions={instructions}
                        description={meta.description}
                    />
                )}
                {inlineView === "info" && (
                    <InfoCard data-no-observe aria-label={`${meta.name} info`}>
                        <AlgorithmInfo registry={registry} showTitle={false} />
                    </InfoCard>
                )}
            </Main>
        </Container>
    );
}

export default SortAlgorithmPanel;
