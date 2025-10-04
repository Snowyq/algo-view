import styled from "styled-components";
import PlaySlider from "./PlaySlider";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { getActiveAlgorithms, getStep } from "./playSlice";
import { clamp } from "../../utils/values";
import PlayProgressBar from "./PlayProgressBar";

const Controls = styled.div`
	display: flex;
	padding: 0 1rem;
	align-items: center;
	gap: 1rem;
`;

const ControlsButtons = styled.div`
	display: flex;
	gap: 0.2rem;
`;

function PlayWindowControls({ registry }) {
	const activeAlgorithms = useSelector(getActiveAlgorithms);
	const algorithm = activeAlgorithms.find(algo => algo.id === registry.id);

	if (!algorithm || !algorithm.steps) return <></>;
	const maxStep = algorithm.steps?.length - 1;

	return (
		<Controls>
			<PlayProgressBar max={maxStep} showStep={false} />
			<ControlsButtons>
				<IoIosArrowBack />
				<IoIosArrowForward />
			</ControlsButtons>
		</Controls>
	);
}

export default PlayWindowControls;
