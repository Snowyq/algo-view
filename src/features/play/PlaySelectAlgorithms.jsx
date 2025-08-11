import { useContext } from "react";
import styled from "styled-components";
import { PlayContext } from "./PlayContext";

const Algorithms = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

function PlaySelectAlgorithms() {
	const { algorithms, openAlgorithm, closeAlgorithm } =
		useContext(PlayContext);
	console.log(algorithms);
	return (
		<Algorithms>
			{algorithms.map(algo => {
				return (
					<>
						<span
							onClick={e => {
								openAlgorithm(algo.id);
							}}
						>
							{algo.meta.name}
						</span>
						<span onClick={() => closeAlgorithm(algo.id)}>
							close
						</span>
					</>
				);
			})}
		</Algorithms>
	);
}

export default PlaySelectAlgorithms;
