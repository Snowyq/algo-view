import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import styled, { css } from "styled-components";
import { HiOutlineSelector } from "react-icons/hi";

const StyledSelectedField = styled.div``;

const SelectContext = createContext();

function Select({ onClick, onChange, selected, children }) {
	const [isOpen, setIsOpen] = useState(false);
	const [mouseOver, setMouseOver] = useState(false);
	const [options, setOptions] = useState([]);
	const [selectedOption, setSelectedOption] = useState(null);

	const close = () => setIsOpen(false);
	const open = () => setIsOpen(true);
	const toggle = () => setIsOpen(x => !x);

	const passOption = useCallback((value, label) => {
		setOptions(prevOptions => {
			const newOption = { value, label };
			const filtered = prevOptions.filter(
				option => option.value !== value
			);
			return [newOption, ...filtered];
		});
	}, []);

	useEffect(() => {
		setSelectedOption(options.find(option => option.value === selected));
	}, [options, selected]);
	const value = useMemo(
		() => ({
			passOption,
			isOpen,
			setIsOpen,
			mouseOver,
			setMouseOver,
			close,
			open,
			toggle,
			onChange,
			selected: selectedOption,
		}),
		[
			isOpen,
			setIsOpen,
			onChange,
			mouseOver,
			setMouseOver,
			selectedOption,
			passOption,
		]
	);

	return (
		<SelectContext.Provider value={value}>
			{children}
		</SelectContext.Provider>
	);
}

function Selected() {
	const { selected } = useContext(SelectContext);
	return <>{selected?.label}</>;
}

function Input({ onClick }) {
	const { toggle } = useContext(SelectContext);

	const handleClick = () => {
		console.log("input");
		toggle();
		onClick?.();
	};
	return React.cloneElement(<Selected />, { onClick: handleClick });
}
function Option({ children, value }) {
	const { close, isOpen, onChange, passOption } = useContext(SelectContext);
	const passedOnClick = children.props?.onClick;
	const label = children;

	useEffect(() => {
		passOption(value, label);
	}, [passOption, value, label]);

	const handleClick = () => {
		passedOnClick?.();
	};
	if (!isOpen) return <></>;
	else return React.cloneElement(children, { onClick: handleClick });
}

Select.Selected = Selected;
Select.Input = Input;
Select.Option = Option;
export default Select;
