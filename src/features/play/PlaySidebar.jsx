import styled from "styled-components";
import PlayWindow from "./PlayWindow";
import { useContext } from "react";
import { PlayContext } from "./PlayContext";
import { getAlgorithmRegistriesByCategory } from "../../algorithms/algorithmsRegistry";

const StyledPlaySidebar = styled.div`
	background-color: var(--color-grey-100);
	width: 100%;
	height: 100%;
	box-shadow: 1px 1px 15px 5px var(--color-grey-300);
	border: 5px solid var(--color-grey-200);
	border-radius: 2.5rem;
	padding: 2rem;
	gap: 2rem;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
`;

const AlgorithmSelection = styled.div`
	background-color: var(--color-grey-50);
	border: 5px solid var(--color-grey-200);
	border-radius: 2rem;
	gap: 1rem;
	display: flex;
	flex-direction: column;
	padding: 1rem;
`;

const InputContainer = styled.div`
	padding: 0.5rem;
	display: flex;
	flex-direction: column;
`;

function PlaySidebar() {
	const { activeAlgorithmsCategory } = useContext(PlayContext);
	const algorithms = getAlgorithmRegistriesByCategory(
		activeAlgorithmsCategory
	);

	console.log(algorithms);

	return (
		<PlayWindow>
			<AlgorithmSelection>
				<h3>Algorithm Selection</h3>
				<InputContainer>
					<label>Select category</label>
					<select></select>
					{algorithms.map(registry => {
						return <p>{registry.meta.name}</p>;
					})}
				</InputContainer>
				<InputContainer>
					<label>Select algorithms</label>
					<select></select>
				</InputContainer>
			</AlgorithmSelection>
			<AlgorithmSelection>
				<h3>Algorithm Selection</h3>
				<InputContainer>
					<label>Select category</label>
					<select></select>
				</InputContainer>
				<InputContainer>
					<label>Select algorithms</label>
					<select></select>
				</InputContainer>
			</AlgorithmSelection>
		</PlayWindow>
	);
}

export default PlaySidebar;
