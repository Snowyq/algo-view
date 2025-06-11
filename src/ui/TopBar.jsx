import { styled } from "styled-components";
import MainNav from "./MainNav";
import Logo from "./Logo";

const StyledTopBar = styled.div`
	background-color: var(--color-grey-50);
	display: flex;
	justify-content: space-between;
	padding: 0 2.4rem;
	align-items: center;
	box-shadow: 1px 1px 5px 1px var(--color-grey-200);

	z-index: 1000;
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
