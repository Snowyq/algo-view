import styled from "styled-components";
import PlayWindow from "./PlayWindow";

const Block = styled.div`
	grid-column: span 1;
	grid-row: span ${({ val }) => val} / -1;
	background-color: var(--color-grey-300);
	border-radius: 0.3rem;
`;

const BlockArea = styled.div`
	display: grid;
	height: 100%;
	width: 100%;
	grid-template-rows: repeat(20, 1fr);
	grid-template-columns: repeat(20, 1fr);
	grid-gap: 0 1%;
`;

function PlayView() {
	return (
		<PlayWindow>
			<PlayWindow.Header>BubbleSort</PlayWindow.Header>
			<PlayWindow.Body>
				<BlockArea>
					{Array.from({ length: 20 }, (_, index) => (
						<Block
							index={index}
							key={index}
							val={Math.floor(Math.random() * 18) + 2}
						/>
					))}
				</BlockArea>
			</PlayWindow.Body>
		</PlayWindow>
	);
}

export default PlayView;
