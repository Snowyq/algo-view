import { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled, { keyframes } from "styled-components";
import type { AppDispatch, RootState } from "../../../../store";
import { getActiveCategory, openAlgorithm } from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { labelText } from "../primitives/pixel";
import PixelSprite from "../sprites/PixelSprite";

const Wrap = styled.div`
    position: absolute;
    inset: 0;
    z-index: 2;
    display: grid;
    place-items: center;
    padding: 3.2rem;
    pointer-events: none;
`;

const Card = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.6rem;
    max-width: 44rem;
    text-align: center;
    pointer-events: auto;
    animation: px-drop-in 260ms steps(6) both;
`;

const grow = keyframes`
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
`;

/* Unsorted bars that rise in steps: what the canvas will draw. */
const Bars = styled.div`
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 6.4rem;

    i {
        width: 1.2rem;
        background-color: var(--color-step-default);
        box-shadow: inset 0 4px 0 rgba(255, 255, 255, 0.28);
        transform-origin: bottom;
        animation: ${grow} 320ms steps(5) both;
    }
    i:nth-child(3) {
        background-color: var(--color-step-swap);
    }
    i:nth-child(5) {
        background-color: var(--color-step-swap);
    }
`;

const HEIGHTS = [40, 85, 25, 60, 100, 50, 75];

const Title = styled.h2`
    font-family: var(--f-display);
    font-size: clamp(4rem, 3rem + 3vw, 7.2rem);
    line-height: 0.8;
    text-transform: uppercase;
    color: var(--fg);
`;

const Lead = styled.p`
    font-size: 1.6rem;
    color: var(--fg-3);
    text-wrap: balance;
`;

const Pointer = styled.p`
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    ${labelText};
    color: var(--accent);

    svg {
        animation: px-nudge 0.8s steps(2) infinite;
    }

    @keyframes px-nudge {
        50% {
            transform: translateX(-4px);
        }
    }
`;

const Sleeper = styled.div`
    position: relative;

    &::after {
        content: "z";
        position: absolute;
        right: -0.4rem;
        top: 0;
        font-family: var(--f-label);
        font-size: 1.2rem;
        color: var(--fg-3);
        animation: px-blink 1.6s steps(1) infinite;
    }
`;

const STARTERS: Record<string, { ids: string[]; label: string; title: string; lead: string }> = {
    sort: {
        ids: ["bubbleSort", "quickSort", "mergeSort"],
        label: "Try bubble vs quick vs merge",
        title: "Nothing to sort yet",
        lead: "Pick algorithms from the list to compare them step by step on the same input.",
    },
    path: {
        ids: ["bfs", "dijkstra", "astar"],
        label: "Try BFS vs Dijkstra vs A*",
        title: "No route yet",
        lead: "Pick path finders from the list to race them across the same map. Drag on a panel to draw walls.",
    },
};

function EmptyStage(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const category = useSelector<RootState, string>(getActiveCategory);
    const starter = STARTERS[category] ?? STARTERS.sort;
    return (
        <Wrap>
            <Card data-empty-card>
                <Sleeper aria-hidden="true">
                    <PixelSprite animal="cat" state="sleep" scale={3} />
                </Sleeper>
                <Bars aria-hidden="true">
                    {HEIGHTS.map((height, index) => (
                        <i
                            key={index}
                            style={{
                                height: `${height}%`,
                                animationDelay: `${index * 50}ms`,
                            }}
                        />
                    ))}
                </Bars>
                <Title>{starter.title}</Title>
                <Lead>{starter.lead}</Lead>
                <Pointer>
                    <PixelIcon name="stepBack" scale={2} />
                    Choose from the list
                </Pointer>
                <PixelButton
                    type="button"
                    $variant="primary"
                    onClick={() =>
                        starter.ids.forEach((id) => dispatch(openAlgorithm(id)))
                    }
                >
                    <PixelIcon name="plus" scale={2} />
                    {starter.label}
                </PixelButton>
            </Card>
        </Wrap>
    );
}

export default EmptyStage;
