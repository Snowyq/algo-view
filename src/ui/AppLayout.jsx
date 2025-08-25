import { Outlet } from "react-router-dom";
import styled from "styled-components";
import TopBar from "./TopBar";

const Main = styled.main`
	background-color: var(--color-grey-100);
`;

const App = styled.div`
	display: grid;
	height: 100svh;
	width: 100svw;
	grid-template-rows: var(--nav-height) 1fr;
	grid-template-columns: auto;
	overflow: hidden;
`;

const Container = styled.div`
	height: 100%;
`;

function AppLayout() {
	return (
		<App>
			<TopBar />
			<Main>
				<Container>
					<Outlet />
				</Container>
			</Main>
		</App>
	);
}

export default AppLayout;
