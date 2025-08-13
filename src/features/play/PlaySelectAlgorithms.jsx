import { useContext } from "react";
import styled, { css } from "styled-components";
import { PlayContext } from "./PlayContext";
import ButtonIcon from "../../ui/ButtonIcon";
import { IoIosClose } from "react-icons/io";

const Algorithms = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

const ItemCloseButton = styled(ButtonIcon)`
	background-color: var(--color-blue-400);
	padding: 0.2rem;
	opacity: ${({ state }) => (state === "selected" ? 1 : 0)};
	visibility: ${({ state }) => (state === "selected" ? "visible" : "hidden")};
	svg {
		color: white;
		width: 2.2rem;
		height: 2.2rem;
	}

	&:hover {
		background-color: var(--color-red-500);

		svg {
			color: white;
		}
	}
`;

const itemStates = {
	default: css`
		box-shadow: 3px 3px 0px 1px var(--color-grey-300);
		&:hover {
			background-color: var(--color-blue-200);
			box-shadow: 3px 3px 0px 1px var(--color-blue-300);
		}
	`,
	selected: css`
		background-color: var(--color-blue-400);
		box-shadow: 3px 3px 0px 1px var(--color-blue-500);
		color: white;
		transition:
			background-color 0.2s,
			box-shadow 0.2s;

		&:has(${ItemCloseButton}:hover) {
			background-color: var(--color-red-400);
			box-shadow: 3px 3px 0px 1px var(--color-red-500);
		}
	`,
};

const StyledItem = styled.div`
	background-color: var(--color-grey-50);
	padding: 1rem 0.5rem 1rem 1.5rem;
	border-radius: 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
	${({ state }) => itemStates[state]};
`;

const AlgorithmsList = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 1.5rem;
	padding: 1rem 1rem;
	border-radius: 15px;
	background-color: var(--color-grey-200);
`;

function PlaySelectAlgorithms() {
	const { algorithms, openAlgorithm, closeAlgorithm, activeAlgorithms } =
		useContext(PlayContext);

	return (
		<Algorithms>
			<p>Select Algorithms</p>
			<AlgorithmsList>
				{algorithms.map(algo => {
					const isSelected = activeAlgorithms.some(
						x => x.id === algo.id
					);
					return (
						<Item
							key={algo.id}
							name={algo.meta.name}
							id={algo.id}
							isSelected={isSelected}
							onClose={closeAlgorithm}
							onOpen={openAlgorithm}
						/>
					);
				})}
			</AlgorithmsList>
		</Algorithms>
	);
}

function Item({ name, onOpen, id, onClose, isSelected }) {
	const state = isSelected ? "selected" : "default";

	const handleClose = e => {
		e.stopPropagation();
		onClose?.(id);
	};

	return (
		<StyledItem state={state} onClick={() => onOpen?.(id)}>
			<span>{name}</span>

			<ItemCloseButton state={state} onClick={handleClose}>
				<IoIosClose />
			</ItemCloseButton>
		</StyledItem>
	);
}

export default PlaySelectAlgorithms;
