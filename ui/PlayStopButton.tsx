import { JSX } from "react";
import { FaPlay, FaStop } from "react-icons/fa6";
import ButtonIcon from "./ButtonIcon";
type PlayStopButtonProps = {
    onStop?: () => void;
    onStart?: () => void;
    isStopped: boolean;
};

function PlayStopButton({
    onStop,
    onStart,
    isStopped,
}: PlayStopButtonProps): JSX.Element {
    const Icon = isStopped ? <FaPlay /> : <FaStop />;
    return (
        <ButtonIcon onClick={isStopped ? onStart : onStop}>{Icon}</ButtonIcon>
    );
}

export default PlayStopButton;
