import styled from "styled-components";
import PlaySlider from "./PlaySlider";

const Flex = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Progress = styled.span`
	font-size: 1.4rem;
	align-self: flex-start;
	visibility: ${({ state }) => state};
`;

const ProgressBar = styled(Flex)`
	width: 100%;
	gap: 0.2rem;
	flex-direction: column;
`;

function PlayProgressBar({ value, max, onChange, freeze, unfreeze }) {
	const handleChange = value => {
		freeze();
		onChange?.(value);
	};

	const handleMouseUp = () => {
		unfreeze();
	};

	return (
		<ProgressBar>
			<Progress
				state={max > 0 ? "visible" : "hidden"}
			>{`${value}/${max}`}</Progress>
			<PlaySlider
				onChange={handleChange}
				onMouseUp={handleMouseUp}
				value={value}
				min={0}
				max={max}
			/>
		</ProgressBar>
	);
}

export default PlayProgressBar;
