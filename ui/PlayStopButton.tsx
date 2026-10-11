import { JSX } from "react";
import { FaPlay, FaStop } from "react-icons/fa6";
import styled from "styled-components";
import ButtonIcon from "./ButtonIcon";

/* The one primary control: larger, lit, with a soft ring. */
const PrimaryControl = styled(ButtonIcon)`
    --color: var(--ink-950);
    --background: var(--swap);
    --hover-background: var(--swap-strong);
    --hover-color: var(--ink-950);
    position: relative;
    width: 5rem;
    height: 5rem;
    box-shadow: 0 0 0 4px rgba(var(--swap-rgb), 0.14);
`;

/* Both icons stay mounted and cross-fade, so the state change is seen. */
const IconSlot = styled.span`
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    transition:
        opacity 160ms var(--ease-out),
        transform 160ms var(--ease-out),
        filter 160ms var(--ease-out);

    &[data-shown="false"] {
        opacity: 0;
        transform: scale(0.6);
        filter: blur(2px);
    }

    /* Play triangle sits optically left of center; nudge it. */
    &[data-icon="play"] svg {
        translate: 1px 0;
    }

    @media (prefers-reduced-motion: reduce) {
        &[data-shown="false"] {
            transform: none;
            filter: none;
        }
    }
`;

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
    const label = isStopped ? "Play" : "Stop";
    return (
        <PrimaryControl
            onClick={isStopped ? onStart : onStop}
            aria-label={label}
            title={label}
            size="1.8rem"
            padding="0"
            $borderRadius="50%"
        >
            <IconSlot data-icon="play" data-shown={isStopped} aria-hidden>
                <FaPlay />
            </IconSlot>
            <IconSlot data-icon="stop" data-shown={!isStopped} aria-hidden>
                <FaStop />
            </IconSlot>
        </PrimaryControl>
    );
}

export default PlayStopButton;
