import styled, { css } from "styled-components";
import PlayWindow from "./PlayWindow";
import React, { useContext, useState } from "react";
import { PlayContext } from "./PlayContext";
import CustomSelect from "../../ui/Select";
import MultiSelect from "../../ui/MultiSelect";
import ButtonIcon from "../../ui/ButtonIcon";
import { GoSidebarCollapse } from "react-icons/go";
import Select from "../../ui/Select";

const Category = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

const StyledPlaySidebar = styled.div`
	max-width: 24rem;
	min-width: 15rem;
	width: ${({ $isOpened }) => ($isOpened ? "30%" : "5rem")};
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	padding: 0 2rem;
	gap: 1rem;
`;

const Close = styled.div`
	display: flex;
	justify-content: end;
	align-items: center;
`;

const Algorithms = styled.div``;
const Tools = styled.div`
	padding: 0.5rem 1rem;
`;
const Body = styled.div`
	padding: 0.5rem 0;
`;

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

	const [isOpened, setIsOpened] = useState(true);

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
	console.log(isOpened);

	return (
		<StyledPlaySidebar $isOpened={isOpened}>
			<PlayWindow $isOpened={isOpened}>
				<Body>
					<Tools>
						<Close>
							<ButtonIcon onClick={handleToggleSidebar}>
								<GoSidebarCollapse />
							</ButtonIcon>
						</Close>
					</Tools>
					<Container $isOpened={isOpened}>
						<Category>
							<p>Select Category</p>
							<Select
								selected={activeCategory}
								options={categoriesOptions}
								onChange={handleCategoryChange}
							/>
						</Category>
						<Algorithms>
							<MultiSelect
								selected={activeAlgorithms.map(algo => algo.id)}
								options={algorithmsOptions}
								onChange={handleAlgorithmsChange}
								onSelect={handleAlgorithmSelect}
								onDeselect={handleAlgorithmDeselect}
							/>
						</Algorithms>
					</Container>
				</Body>
			</PlayWindow>
		</StyledPlaySidebar>
	);
}

const PlaySidebar = React.memo(PlaySidebarComponent);

export default PlaySidebar;
