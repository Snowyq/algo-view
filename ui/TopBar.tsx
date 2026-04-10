import { styled } from "styled-components";
import { NAV_BREAKPOINT } from "../constants/breakpoints";
import Logo from "./Logo";
import MainNav from "./MainNav";

const StyledTopBar = styled.div`
    background-color: var(--color-grey-200);
    display: flex;
    padding: 0 2.4rem;
    border-bottom: 5px solid var(--color-grey-400);

    z-index: 1000;

    @media screen and (min-width: ${NAV_BREAKPOINT}) {
        border-bottom: 5px solid var(--color-grey-300);
        background-color: var(--color-grey-200);
    }
`;

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
`;

function TopBar() {
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
