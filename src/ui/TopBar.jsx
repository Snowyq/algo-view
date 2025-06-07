import { styled } from "styled-components";
import MainNav from "./MainNav";
import Logo from "./Logo";

const StyledTopBar = styled.div`
	background-color: var(--color-grey-0);
	display: flex;
	justify-content: space-between;
	margin: 0 2.4rem;
	align-items: center;
`;

const Container = styled.div`
	display: flex;
`;

function TopBar() {
	return (
		<StyledTopBar>
			<Logo />
			<Container>
				<MainNav />
			</Container>
		</StyledTopBar>
	);
}

export default TopBar;
