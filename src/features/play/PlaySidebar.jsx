import styled from "styled-components";
import PlayWindow from "./PlayWindow";
import React, { useContext } from "react";
import { PlayContext } from "./PlayContext";
import CustomSelect from "../../ui/CustomSelect";
import MultiSelect from "../../ui/MultiSelect";

const Category = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 2rem;
`;
const Algorithms = styled.div``;

function PlaySidebarComponent() {
	const {
		activeCategory,
		activeAlgorithms,
		changeActiveAlgorithms,
		openAlgorithm,
		closeAlgorithm,
		changeActiveCategory,
		categories,
		algorithms,
	} = useContext(PlayContext);

	const categoriesOptions = categories.map(cat => {
		return { value: cat.id, label: cat.name };
	});

	const algorithmsOptions = algorithms.map(algo => {
		return { value: algo.id, label: algo.meta.name };
	});

	const handleCategoryChange = option => {
		changeActiveCategory(option.value);
	};

	const handleAlgorithmSelect = option => {
		openAlgorithm(option.value);
	};

	const handleAlgorithmDeselect = option => {
		closeAlgorithm(option.value);
	};

	const handleAlgorithmsChange = options => {
		const ids = options.map(option => option.value);
		changeActiveAlgorithms(ids);
	};

	return (
		<PlayWindow>
			<Category>
				<p>Select Category</p>
				<CustomSelect
					selected={activeCategory}
					options={categoriesOptions}
					onChange={handleCategoryChange}
				/>
			</Category>
			<Algorithms>
				<MultiSelect
					defaultOptions={activeAlgorithms.map(algo => algo.id)}
					options={algorithmsOptions}
					onChange={handleAlgorithmsChange}
					onSelect={handleAlgorithmSelect}
					onDeselect={handleAlgorithmDeselect}
				/>
			</Algorithms>
		</PlayWindow>
	);
}

const PlaySidebar = React.memo(PlaySidebarComponent);

export default PlaySidebar;
