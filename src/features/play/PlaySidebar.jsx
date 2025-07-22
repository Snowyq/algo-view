import styled from "styled-components";
import PlayWindow from "./PlayWindow";
import React, { useContext, useMemo } from "react";
import { PlayContext } from "./PlayContext";
import { getAlgorithmRegistriesByCategory } from "../../algorithms/algorithmsRegistry";

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

function PlaySidebarComponent() {
	const { category } = useContext(PlayContext);

	const algorithmsRegistries = useMemo(() => {
		return getAlgorithmRegistriesByCategory(category);
	}, [category]);

	return (
		<PlayWindow>
			<AlgorithmSelection>
				<h3>Algorithm Selection</h3>
				<InputContainer>
					<label>Select category</label>
					<select></select>
					{algorithmsRegistries.map(registry => {
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

const PlaySidebar = React.memo(PlaySidebarComponent);

export default PlaySidebar;
