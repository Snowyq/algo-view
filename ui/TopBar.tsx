import { JSX } from "react";
import { styled } from "styled-components";
import Logo from "./Logo";
import MainNav from "./MainNav";
const StyledTopBar = styled.div`
    display: flex;
    padding: 0 var(--gutter);
    background-color: var(--ink-950);
    border-bottom: 1px solid var(--ink-700);
    z-index: 1000;
`;

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
`;

function TopBar(): JSX.Element {
    return (
        <StyledTopBar>
            <Container>
                <Logo />
                <MainNav />
            </Container>
        </StyledTopBar>
    );
}

export default TopBar;
