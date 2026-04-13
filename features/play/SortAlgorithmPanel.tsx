import { JSX, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type {
    AlgorithmMetrics,
    AlgorithmRegistryItem,
} from "../../algorithms/types";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
import type { RootState } from "../../store";
import AnimatedText from "../../ui/AnimatedText";
import { getAllMetricsVisible, getInput } from "./playSlice";
import SortVisualizerCanvas from "./SortVisualizerCanvas";
import StepMetricsPanel from "./StepMetricsPanel";

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

const Heading = styled.h2``;

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;

    flex-direction: column;
    min-height: 0;
`;

const Top = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0rem 0rem 0.5rem 0.5rem;
    width: 100%;
`;

const Main = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    min-height: 0;
    width: 100%;
    padding: 0.25rem 0.5rem;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        padding: 0rem;
    }
`;

const MetricsOverlay = styled.div`
    left: 0;
    top: 0;
    z-index: 2;
`;

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
    const input = useSelector<RootState, number[]>(getInput);
    const hasInput = Array.isArray(input) && input.length > 0;

    useEffect((): void => {
        setShowMetrics(allMetricsVisible);
    }, [allMetricsVisible]);

    return (
        <Container>
            <Top>
                <Header>
                    <Heading>
                        <AnimatedText show={true}>
                            {registry.meta.name}
                        </AnimatedText>
                    </Heading>
                    {showMetrics && hasInput && (
                        <MetricsOverlay>
                            <StepMetricsPanel
                                metrics={baseMetrics}
                                stepMetrics={stepMetrics}
                            />
                        </MetricsOverlay>
                    )}
                </Header>
            </Top>
            <Main>
                <SortVisualizerCanvas
                    registry={registry}
                    onMetricsUpdate={setBaseMetrics}
                    onStepMetricsUpdate={setStepMetrics}
                />
            </Main>
        </Container>
    );
}

export default SortAlgorithmPanel;
