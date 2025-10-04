import { FaBackward, FaForward } from "react-icons/fa6";
import PlayControlsButton from "./PlayControlsButton";
import PlayStopButton from "../../ui/PlayStopButton";
import styled from "styled-components";
import { TbRewindBackward10, TbRewindForward10 } from "react-icons/tb";
import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	decreaseStep,
	getAnimationStatus,
	increaseStep,
	startAnimation,
	stopAnimation,
} from "./playSlice";

const Container = styled.div`
	display: flex;
	gap: 0.5rem;
`;

function PlayProgressControls() {
	const dispatch = useDispatch();

	const forward = useCallback(
		steps => dispatch(increaseStep({ value: steps })),
		[dispatch]
	);
	const backward = useCallback(
		steps => dispatch(decreaseStep({ value: steps })),
		[dispatch]
	);

	const start = () => dispatch(startAnimation());
	const stop = () => dispatch(stopAnimation());
	const animationStatus = useSelector(getAnimationStatus);

	return (
		<Container>
			<PlayControlsButton
				icon={<TbRewindBackward10 />}
				onClick={() => backward(10)}
			/>
			<PlayControlsButton
				icon={<FaBackward />}
				onClick={() => backward(1)}
			/>
			<PlayStopButton
				onStart={start}
				onStop={stop}
				isStopped={animationStatus === "stopped"}
			/>
			<PlayControlsButton
				icon={<FaForward />}
				onClick={() => forward(1)}
			/>
			<PlayControlsButton
				icon={<TbRewindForward10 />}
				onClick={() => forward(10)}
			/>
		</Container>
	);
}

export default memo(PlayProgressControls);
