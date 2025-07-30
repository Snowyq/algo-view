import React, { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { HiOutlineSelector } from "react-icons/hi";
import { useRect } from "../hooks/useRect";
import useClickOutside from "../hooks/useClickOutside";

const StyledSelect = styled.div`
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
			background-color: var(--color-grey-200);
		}
	`,
	selected: css`
		background-color: var(--color-grey-200);
	`,
};
const StyledOption = styled.button`
	padding: 0.5rem 1.5rem;
	border-radius: 15px;
	text-align: start;
	background-color: transparent;
	width: 100%;
	height: 100%;
	border: none;

	&:focus {
		outline: none;
	}

	&:hover {
		border: none;
		outline: none;
	}

	${({ type }) => optionTypes[type]}
`;

const optionsStates = {
	opened: css`
		visibility: visible;
		box-shadow: 0.45rem 0.45rem 0px 3px var(--color-grey-400);
		/* translate: -0.3rem -0.3rem; */
		translate: -0.18rem -0.18rem;
	`,
	closed: css`
		box-shadow: 0.25rem 0.25rem 0px 3px var(--color-grey-300);
		height: 0;
		visibility: hidden;
	`,
};

const StyledOptions = styled.div`
	padding: 0.2rem;
	position: absolute;
	display: flex;
	flex-direction: column;
	padding-top: ${({ $paddingTop }) => $paddingTop + 2 + "px"};
	border-radius: 15px;
	gap: 0.2rem;
	/* box-shadow: 0.25rem 0.25rem 0px 3px var(--color-grey-300); */
	overflow: hidden;
	top: 0;
	/* transition: height 0 */
	width: 100%;
	z-index: -1;
	background-color: var(--color-grey-100);
	${({ $isOpened }) => optionsStates[$isOpened ? "opened" : "closed"]}
`;

const toggleStates = {
	opened: css`
		background-color: var(--color-grey-50);
		/* translate: -0.3rem -0.3rem; */

		/* box-shadow: 0.45rem 0.45rem 0px 3px var(--color-grey-400); */

		&:hover {
			background-color: var(--color-grey-50);

			/* box-shadow: 0.45rem 0.45rem 0px 3px var(--color-grey-400); */
		}
	`,

	closed: css`
		background-color: var(--color-grey-100);
		box-shadow: 0.28rem 0.28rem 0px 3px var(--color-grey-300);

		&:hover {
			background-color: var(--color-grey-50);

			box-shadow: 0.45rem 0.45rem 0px 3px var(--color-grey-400);
		}
	`,
};

const StyledToggle = styled.button`
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-radius: 15px;
	padding: 1rem 1rem;
	border: none;

	z-index: 10;
	width: 100%;
	cursor: pointer;
	transition: translate 0.3s;
	&:focus {
		outline: none;
	}

	&:hover {
		/* border: none; */
		outline: none;
	}

	&::after {
		border-radius: 15px;
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;

		transition:
			translate 0.3s,
			box-shadow 0.3s;
	}

	${({ $isOpened }) => toggleStates[$isOpened ? "opened" : "closed"]}
`;

function Select({ options, onClick, onChange, render, selected }) {
	const [isOpened, setIsOpened] = useState(false);
	const toggleRef = useRef(null);
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
		<StyledSelect ref={ref}>
			<Toggle
				ref={toggleRef}
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
		</StyledSelect>
	);
}

function Toggle({ selected, toggleClick, isOpened, ref }) {
	return (
		<StyledToggle ref={ref} onClick={toggleClick} $isOpened={isOpened}>
			{selected.label}
			<HiOutlineSelector />
		</StyledToggle>
	);
}

function generateOption(option, optionClick, selected) {
	if (!option.value) return;
	const type = option.value === selected ? "selected" : "default";
	const { value, label, icon } = option;

	return (
		<Option
			value={value}
			label={label}
			icon={icon}
			type={type}
			onClick={() => optionClick(option)}
		/>
	);
}

function Options({ options, optionClick, isOpened, paddingTop, selected }) {
	return (
		<StyledOptions $isOpened={isOpened} $paddingTop={paddingTop}>
			{options.map(option =>
				generateOption(option, optionClick, selected)
			)}
		</StyledOptions>
	);
}

function Option({ value, label, icon, type, onClick }) {
	return (
		<StyledOption id={value} type={type} onClick={onClick}>
			{icon && icon}
			{label && label}
		</StyledOption>
	);
}

export default Select;
