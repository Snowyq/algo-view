import { JSX } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { RootState } from "../../../../store";
import { getCurrentSpeed } from "../../playSlice";
import { labelText } from "../primitives/pixel";
import PixelSprite from "../sprites/PixelSprite";
import { animalForSpeed } from "../sprites/speedAnimals";

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
`;

/* The speed animal runs in place over a dotted ground line. */
const Ground = styled.div`
    width: 9.6rem;
    height: 2px;
    background-image: repeating-linear-gradient(
        90deg,
        var(--line-2) 0 4px,
        transparent 4px 8px
    );
    animation: px-ground 0.4s steps(2) infinite;

    @keyframes px-ground {
        to {
            background-position: -8px 0;
        }
    }
`;

const Text = styled.p`
    ${labelText};
    color: var(--fg-3);

    span {
        animation: px-blink 0.9s steps(1) infinite;
    }
    span:nth-child(2) {
        animation-delay: 0.3s;
    }
    span:nth-child(3) {
        animation-delay: 0.6s;
    }
`;

function PixelLoader({ label = "Sorting" }: { label?: string }): JSX.Element {
    const speed = useSelector<RootState, number>(getCurrentSpeed);
    return (
        <Wrap role="status" aria-label={`${label}…`}>
            <PixelSprite animal={animalForSpeed(speed)} state="run" scale={3} />
            <Ground />
            <Text aria-hidden="true">
                {label}
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </Text>
        </Wrap>
    );
}

export default PixelLoader;
