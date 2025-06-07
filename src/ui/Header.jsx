import styled from "styled-components";
import MainNav from "./MainNav";

const StyledHeader = styled.header`
	color: yellow;
`;

function Header() {
	return (
		<StyledHeader>
			<MainNav />
		</StyledHeader>
	);
}

export default Header;
