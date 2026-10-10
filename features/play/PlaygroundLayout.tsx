import { JSX } from "react";
import styled from "styled-components";
import AlgorithmGrid from "./AlgorithmGrid";
import ConfigSidebar from "./ConfigSidebar";
import PlaybackControls from "./PlaybackControls";
const StyledPlayground = styled.div`
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
`;

const Container = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
`;

const PlayMain = styled.div`
    flex-direction: column;
    width: 100%;
    min-width: 0;
    height: 100%;
    display: flex;
`;

/* Takes what the playback bar leaves; never pushes it off screen. */
const PlayGroup = styled.div`
    display: flex;
    flex: 1;
    min-height: 0;
`;

function PlaygroundLayout(): JSX.Element {
    return (
        <StyledPlayground>
            <Container>
                <PlayMain>
                    <PlayGroup>
                        <AlgorithmGrid />
                    </PlayGroup>
                    <PlaybackControls />
                </PlayMain>
                <ConfigSidebar />
            </Container>
        </StyledPlayground>
    );
}

export default PlaygroundLayout;
