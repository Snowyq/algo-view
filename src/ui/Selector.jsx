import React, { createContext, useContext, useRef } from "react";
import styled from "styled-components";

const Container = styled.div`
	position: relative;
	display: flex;
	width: fit-content;
`;
const StyledItem = styled.div`
	pointer-events: ${({ $pointerEvents = "auto" }) => $pointerEvents};
	z-index: 1;
`;

const StyledSelectedHighlight = styled.div`
	position: absolute;
	z-index: 0;
	transition:
		left ${({ duration }) => duration}s,
		top ${({ duration }) => duration}s;
`;

const SelectorContext = createContext();

function Selector({
	onChange,
	Highlight: PassedHighlight,
	Wrapper,
	highlightDuration = 0.3,
	render,
	options,
	selected,
	omitItemPointerEvents = false,
}) {
	const itemRefs = useRef(new Map());

	const handleChange = id => {
		onChange?.(id);
	};

	const renderedOptions = renderOptions(options, render, selected);

	const makeWrapper = (Wrap, children) => {
		Wrap.props.children = children;
		return Wrap;
	};

	return (
		<SelectorContext.Provider
			value={{
				itemRefs,
				selected,
				handleChange,
				PassedHighlight,
				highlightDuration,
				omitPointerEvents: omitItemPointerEvents,
			}}
		>
			<Container>
				{Wrapper ? (
					<Wrapper>{renderedOptions}</Wrapper>
				) : (
					renderedOptions
				)}
			</Container>
		</SelectorContext.Provider>
	);
}

function Item({ children, id }) {
	const itemRef = useRef();
	const { handleChange, omitPointerEvents } = useContext(SelectorContext);

	const handleClick = () => {
		handleChange(id);
	};

	return (
		<StyledItem
			onClick={handleClick}
			ref={itemRef}
			$pointerEvents={omitPointerEvents ? "none" : "auto"}
		>
			{children}
		</StyledItem>
	);
}

function renderOptions(options, render, selected) {
	return options.map(option => {
		return (
			<Item key={option} id={option}>
				{render(option, option === selected)}
			</Item>
		);
	});
}

Selector.Item = Item;
export default Selector;
