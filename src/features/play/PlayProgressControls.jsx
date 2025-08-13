import { FaBackward, FaForward } from "react-icons/fa6";
import PlayControlsButton from "./PlayControlsButton";
import PlayStopButton from "../../ui/PlayStopButton";
import styled from "styled-components";
import { TbRewindBackward10, TbRewindForward10 } from "react-icons/tb";
import { memo } from "react";

const Container = styled.div`
	display: flex;
	gap: 0.5rem;
`;

function PlayProgressControls({
	onBackward,
	onStart,
	onStop,
	isPlaying,
	onForward,
}) {
	return (
		<Container>
			<PlayControlsButton
				icon={<TbRewindBackward10 />}
				onClick={() => onBackward(10)}
			/>
			<PlayControlsButton
				icon={<FaBackward />}
				onClick={() => onBackward(1)}
			/>
			<PlayStopButton
				onStart={onStart}
				onStop={onStop}
				isStopped={!isPlaying}
			/>
			<PlayControlsButton
				icon={<FaForward />}
				onClick={() => onForward(1)}
			/>
			<PlayControlsButton
				icon={<TbRewindForward10 />}
				onClick={() => onForward(10)}
			/>
		</Container>
	);
}

export default memo(PlayProgressControls);
