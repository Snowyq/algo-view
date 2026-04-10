import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
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

const Tools = styled.div`
    display: flex;
    gap: 0.25rem;
`;

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;

    flex-direction: column;
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
    height: 100%;
    width: 100%;
    padding: 0.25rem 0.5rem;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        padding: 0rem;
    }
`;

const VisualizerShell = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`;

const MetricsOverlay = styled.div`
    /* position: absolute; */
    left: 0;
    top: 0;
    z-index: 2;
`;

function SortAlgorithmPanel({ registry }) {
    const [showMetrics, setShowMetrics] = useState(false);
    const [baseMetrics, setBaseMetrics] = useState(null);
    const [stepMetrics, setStepMetrics] = useState(null);

    const allMetricsVisible = useSelector(getAllMetricsVisible);
    const input = useSelector(getInput);
    const hasInput = Array.isArray(input) && input.length > 0;

    const toggleDisplayMetrics = () => setShowMetrics((x) => !x);
    useEffect(() => {
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
                    <Tools>
                        {/* <ButtonIcon>
                            <FaCode />
                        </ButtonIcon> */}
                        {/* <ButtonIcon onClick={toggleDisplayMetrics}>
                            <RiNumbersLine />
                        </ButtonIcon> */}
                        {/* <ButtonIcon>
                            <IoSettings />
                        </ButtonIcon> */}
                    </Tools>
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
