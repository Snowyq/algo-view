import styled from "styled-components";
import IndexHero from "../ui/IndexHero";
import GraphBackground from "../ui/GraphBackground";

const Layout = styled.div`
	height: 100%;
	width: 100%;
`;

const Container = styled.div`
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
`;

function Index() {
	return (
		<Layout>
			<GraphBackground />
			<Container>
				<IndexHero />
			</Container>
		</Layout>
	);
}

export default Index;
