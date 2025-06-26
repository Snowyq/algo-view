import {
	FaBackward,
	FaForward,
	FaMarsStrokeUp,
	FaPlay,
	FaStop,
} from "react-icons/fa6";
import styled from "styled-components";
import ButtonIcon from "../../ui/ButtonIcon";
import { MdOutlineReplay5 } from "react-icons/md";
import {
	RiForward15Fill,
	RiForward30Fill,
	RiForward5Fill,
	RiReplay15Fill,
	RiReplay30Fill,
	RiReplay5Fill,
} from "react-icons/ri";
import ControlBar from "../../ui/ControlBar";

const Container = styled.div`
	/* background-color: yellow; */
	display: flex;
`;

const StyledAlgorithmControls = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
`;

const Group = styled.div`
	/* background-color: green; */
	display: flex;
`;

const ButtonOptions = styled.div`
	position: absolute;
	display: none;
	top: -50%;
	left: 50%;
	translate: -50% -50%;
`;
const StyledControlButton = styled.div`
	position: relative;
	display: flex;
	background-color: var(--color-grey-50);

	&:hover ${ButtonOptions} {
		display: flex;
	}
`;

function AlgorithmControls({
	isPlaying = false,
	onStartStopClick,
	updateProgress,
	progress,
}) {
	return (
		<StyledAlgorithmControls>
			<ControlBar progress={progress} updateProgress={updateProgress} />
			<Container>
				<Group type="main">
					<ControlButton Icon={<FaBackward />}>
						<ControlButton Icon={<RiReplay30Fill />} />
						<ControlButton Icon={<RiReplay15Fill />} />
						<ControlButton Icon={<RiReplay5Fill />} />
					</ControlButton>
					<ControlButton
						Icon={isPlaying ? <FaStop /> : <FaPlay />}
						handleClick={onStartStopClick}
					/>
					<ControlButton Icon={<FaForward />}>
						<ControlButton Icon={<RiForward30Fill />} />
						<ControlButton Icon={<RiForward15Fill />} />
						<ControlButton Icon={<RiForward5Fill />} />
					</ControlButton>
				</Group>
			</Container>
		</StyledAlgorithmControls>
	);
}

function ControlButton({ Icon, handleClick, children }) {
	return (
		<StyledControlButton>
			<ButtonIcon variation={"alert"} onClick={handleClick}>
				{Icon}
			</ButtonIcon>
			<ButtonOptions>{children}</ButtonOptions>
		</StyledControlButton>
	);
}

export default AlgorithmControls;
