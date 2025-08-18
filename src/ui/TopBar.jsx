import { styled } from "styled-components";
import MainNav from "./MainNav";
import Logo from "./Logo";

const StyledTopBar = styled.div`
	background-color: var(--color-grey-200);
	display: flex;
	padding: 0 2.4rem;
	box-shadow: 0 0 0px 0.5rem var(--color-grey-300);

	z-index: 1000;
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
