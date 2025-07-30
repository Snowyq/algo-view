import { FaPlay, FaStop } from "react-icons/fa6";
import ButtonIcon from "./ButtonIcon";

function PlayStopButton({ onStop, onStart, isStopped }) {
	const Icon = isStopped ? <FaPlay /> : <FaStop />;
	return (
		<ButtonIcon onClick={isStopped ? onStart : onStop}>{Icon}</ButtonIcon>
	);
}

export default PlayStopButton;
