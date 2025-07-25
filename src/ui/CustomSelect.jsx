import { useState } from "react";
import styled, { css } from "styled-components";
import { HiOutlineSelector } from "react-icons/hi";
import { useRect } from "../hooks/useRect";
import useClickOutside from "../hooks/useClickOutside";

const StyledCustomSelect = styled.div`
	position: relative;
	z-index: 1;
`;
const optionTypes = {
	toggle: css`
		padding: 0;
	`,
	default: css`
		cursor: pointer;
		&:hover {
			background-color: var(--color-grey-50);
		}
	`,
	selected: css`
		background-color: var(--color-grey-200);
	`,
};
const StyledOption = styled.div`
	padding: 0.25rem 2rem;
	border-radius: 15px;
	text-align: start;

	${({ type }) => optionTypes[type]}
`;

const Overlay = styled.button`
	margin: 0;
	padding: 0;
	padding: 0.5rem;
	background-color: transparent;
	width: 100%;
	height: 100%;
	border-radius: 0px;
	border: none;

	&:focus {
		outline: none;
	}

	&:hover {
		border: none;
		outline: none;
	}
`;

const optionsStates = {
	opened: css`
		visibility: visible;
		box-shadow: 0.45rem 0.45rem 0px 4px var(--color-grey-400);
		/* translate: -0.3rem -0.3rem; */
	`,
	closed: css`
		box-shadow: 0.25rem 0.25rem 0px 3px var(--color-grey-300);
		height: 0;
		visibility: hidden;
	`,
};

const StyledOptions = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;
	padding-top: ${({ $paddingTop }) => $paddingTop + "px"};
	border-radius: 15px;
	/* box-shadow: 0.25rem 0.25rem 0px 3px var(--color-grey-300); */
	overflow: hidden;
	top: 0;
	transition:
		box-shadow 0.5s,
		translate 0.3s,
		height 0.3s;
	width: 100%;

	z-index: -1;
	background-color: var(--color-grey-100);
	${({ $isOpened }) => optionsStates[$isOpened ? "opened" : "closed"]}
`;

const toggleStates = {
	opened: css`
		background-color: var(--color-grey-50);

		/* translate: -0.3rem -0.3rem; */

		&:hover {
			background-color: var(--color-grey-50);
		}
	`,

	closed: css`
		background-color: var(--color-grey-100);
		box-shadow: 0.27rem 0.27rem 0px 3px var(--color-grey-300);
		&:hover {
			translate: -0.18rem -0.18rem;
			box-shadow: 0.45rem 0.45rem 0px 3px var(--color-grey-400);
			background-color: var(--color-grey-50);
		}
	`,
};

const StyledToggle = styled.button`
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-radius: 15px;
	padding: 1rem 2rem;
	border: none;
	transition:
		translate 0.3s,
		box-shadow 0.3s;

	z-index: 10;
	width: 100%;
	cursor: pointer;

	&:focus {
		outline: none;
	}

	&:hover {
		/* border: none; */
		outline: none;
	}

	${({ $isOpened }) => toggleStates[$isOpened ? "opened" : "closed"]}
`;

function CustomSelect({ options, onClick, onChange, render, selected }) {
	const [isOpened, setIsOpened] = useState(false);
	const { ref, rect } = useRect();
	const selectedOption = options.find(option => option.value === selected);

	const openSelect = () => {
		setIsOpened(true);
	};
	const closeSelect = () => {
		setIsOpened(false);
	};

	const handleClick = e => {
		if (!isOpened) openSelect();
		else closeSelect();
		onClick?.(isOpened, e);
	};

	const handleOptionClick = option => {
		onChange?.(option);
		closeSelect();
	};

	useClickOutside(closeSelect, ref);

	return (
		<StyledCustomSelect ref={ref}>
			<Toggle
				isOpened={isOpened}
				selected={selectedOption}
				toggleClick={handleClick}
			/>
			<Options
				paddingTop={rect.height}
				isOpened={isOpened}
				options={options}
				selected={selectedOption}
				optionClick={handleOptionClick}
			/>
		</StyledCustomSelect>
	);
}

function Toggle({ selected, toggleClick, isOpened }) {
	return (
		<StyledToggle onClick={toggleClick} $isOpened={isOpened}>
			{generateOption(selected, "toggle")}
			<HiOutlineSelector />
		</StyledToggle>
	);
}

function addOverlay(Item, option, optionClick) {
	return <Overlay onClick={() => optionClick?.(option)}>{Item}</Overlay>;
}

function generateOptionWithOverlay(option, optionClick, selected) {
	if (!option.value) return;
	const isSelected = option.value === selected;
	const item = generateOption(option, isSelected ? "selected" : "default");
	const ready = addOverlay(item, option, optionClick);
	return ready;
}

function generateOption(option, type) {
	if (!option) return;
	const { value, label, icon } = option;

	return <Option value={value} label={label} icon={icon} type={type} />;
}

function Options({ options, optionClick, isOpened, paddingTop, selected }) {
	return (
		<StyledOptions $isOpened={isOpened} $paddingTop={paddingTop}>
			{options.map(option =>
				generateOptionWithOverlay(option, optionClick, selected)
			)}
		</StyledOptions>
	);
}

function Option({ value, label, icon, type }) {
	return (
		<StyledOption id={value} type={type}>
			{icon && icon}
			{label && label}
		</StyledOption>
	);
}

export default CustomSelect;
