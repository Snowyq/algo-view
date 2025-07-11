import styled from "styled-components";
import Button from "./Button";

const StyledIndexHero = styled.div`
	position: relative;
	background-color: var(--color-grey-50);
	padding: 10rem 5rem;
	border-radius: 6.4rem;
	width: 100%;
	max-width: 1000px;
	display: flex;
	flex-direction: column;
	gap: 3.6rem;
	box-shadow: 1px 1px 25px 5px var(--color-grey-200);
	font-size: 1.6rem;

	/* background: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(5px);
	-webkit-backdrop-filter: blur(5px);
	border: 1px solid rgba(255, 255, 255, 0.3); */
`;

const H1 = styled.h1`
	font-size: 4.8rem;
	font-family: "Josefin Sans";
	text-align: center;
`;

const ButtonsContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1.6rem;
`;

function IndexHero() {
	return (
		<StyledIndexHero>
			<H1>Explore world of algorithms</H1>
			<p>
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim
				voluptatum recusandae magni, vero eius maiores tempora
				architecto nam magnam perspiciatis dignissimos est provident
				consequuntur eligendi quisquam iusto. Ducimus, ea quis?
			</p>
			<ButtonsContainer>
				<Button size="xlarge">Learn</Button>
				<Button variation="secondary" size="xlarge">
					Play
				</Button>
			</ButtonsContainer>
		</StyledIndexHero>
	);
}

export default IndexHero;
