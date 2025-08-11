import styled, { css } from "styled-components";
import PlayWindow from "./PlayWindow";
import React, { useContext, useState } from "react";
import { PlayContext } from "./PlayContext";
import CustomSelect from "../../ui/Select";
import MultiSelect from "../../ui/MultiSelect";
import ButtonIcon from "../../ui/ButtonIcon";
import { GoSidebarCollapse } from "react-icons/go";
import Select from "../../ui/Select";
import PlaySelectCategory from "./PlaySelectCategory";
import PlaySelectAlgorithms from "./PlaySelectAlgorithms";

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

	const handleCategoryChange = e => {
		console.log(e.target.value);
		changeActiveCategory(e.target.value);
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

	const handleToggleSidebar = () => {
		setIsOpened(is => !is);
	};

	return (
		<>
			<PlaySelectCategory
				options={categoriesOptions}
				selected={activeAlgorithms}
				onChange={handleCategoryChange}
			/>
			<PlaySelectAlgorithms />
		</>
	);
}

const PlaySidebar = React.memo(PlaySidebarComponent);

export default PlaySidebar;
