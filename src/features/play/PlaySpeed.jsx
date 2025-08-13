import styled from "styled-components";
import { BsSpeedometer, BsSpeedometer2 } from "react-icons/bs";
import { memo, useCallback, useMemo, useState } from "react";
import Selector from "../../ui/Selector";

const Option = styled.div`
	padding: 0.25rem 0.5rem;
	cursor: pointer;

	&:hover {
		background-color: var(--color-grey-100);
	}
`;

const Wrapper = styled.div`
	background-color: var(--color-grey-50);
	overflow: hidden;
	border-radius: 10px;
	box-shadow: 0 0 15px 0px var(--color-grey-400);
`;

const StyledPlaySpeed = styled.div`
	position: relative;
`;

const SpeedButton = styled.button`
	display: flex;
	flex-direction: column;
	padding: 0.2rem;
	align-items: center;
	justify-content: center;
	height: auto;
	background-color: var(--color-grey-100);
	border-radius: 5px;
	border: none;
`;

const SpeedButtonValue = styled.span`
	display: block;
	width: auto;
	line-height: 1.4rem;
	font-size: 1.4rem;
	border-radius: 2.5px;

	width: 4rem;
	height: fit-content;
`;

const Icon = styled.span`
	font-size: 2.2rem;
`;

const SelectorContainer = styled.div`
	display: ${({ state }) => (state === "hidden" ? "none" : "block")};
	position: absolute;

	bottom: 0;
	right: -0.5rem;
	translate: 100% 0%;
`;

function PlaySpeed({ speed, onChange, speeds, freeze, unfreeze }) {
	const [isHidden, setIsHidden] = useState(true);

	const handleOnChange = option => {
		onChange?.(option);
		unfreeze?.();
		setIsHidden(true);
	};

	const handleClick = () => {
		setIsHidden(isHid => {
			if (isHid) freeze?.();
			else unfreeze?.();
			return !isHid;
		});
	};

	const displaySeconds = ms => {
		const sec = ms / 1000;
		const value = ms % 1000 === 0 ? sec : sec.toFixed(1);
		return value + "s";
	};

	const display = useCallback(timeMs => {
		return timeMs >= 100 ? displaySeconds(timeMs) : timeMs + "ms";
	}, []);

	const renderOptions = option => {
		return <Option>{display(option)}</Option>;
	};

	return (
		<StyledPlaySpeed>
			<SpeedButton onClick={handleClick}>
				<Icon>
					<BsSpeedometer2 />
				</Icon>
				<SpeedButtonValue>{display(speed)}</SpeedButtonValue>
			</SpeedButton>
			<SelectorContainer state={isHidden ? "hidden" : "visible"}>
				{!isHidden && (
					<Selector
						Wrapper={props => (
							<Wrapper
								{...props}
								state={isHidden ? "hidden" : "visible"}
							/>
						)}
						onChange={handleOnChange}
						options={speeds}
						render={renderOptions}
					/>
				)}
			</SelectorContainer>
		</StyledPlaySpeed>
	);
}

export default memo(PlaySpeed);
