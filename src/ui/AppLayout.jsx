import { Outlet } from "react-router-dom";
import styled from "styled-components";
import TopBar from "./TopBar";

const Main = styled.main`
	background-color: var(--color-grey-100);
	padding: 4rem 4.8rem 6.4rem;
`;

const App = styled.div`
	display: grid;
	height: 100svh;
	width: 100svw;
	grid-template-rows: var(--nav-height) 1fr;
	grid-template-columns: auto;
`;

const Container = styled.div`
	max-width: 120rem;
	display: flex;
	flex-direction: column;
	gap: 3.2rem;
	height: 100%;
	margin: 0 auto;
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
