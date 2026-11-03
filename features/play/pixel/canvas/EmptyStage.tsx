import { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import type { AppDispatch, RootState } from "../../../../store";
import { categoryOf } from "../../categories";
import { MOTIF_COLORS } from "../../categoryPreview";
import { getActiveCategory, openAlgorithm } from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { labelText } from "../primitives/pixel";
import PixelSprite from "../sprites/PixelSprite";
import {
    LIBRARY_COLLAPSE,
    PLAY_LAYOUT_BREAKPOINT,
} from "../../../../constants/breakpoints";
import { COMPACT, NARROW, SHORT, TINY } from "../media";

/* Centres the card, and scrolls when it is taller than the stage. */
const Wrap = styled.div`
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 3.2rem;
    pointer-events: none;

    @media ${COMPACT} {
        padding: 1.6rem;
    }
`;

const Card = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.6rem;
    max-width: 44rem;
    margin: auto;
    text-align: center;
    pointer-events: auto;
    animation: px-dither-in 260ms steps(6) both;

    /* Phones: the way to start comes right after the heading. */
    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}), ${SHORT} {
        gap: 1.2rem;

        [data-start] {
            order: 1;
        }
        [data-lead] {
            order: 2;
        }
        [data-pointer] {
            order: 3;
        }
    }
`;

/* The category's motif, blocks popping in along the diagonal. */
const Motif = styled.div`
    @media (max-height: 640px), ${NARROW} and (max-height: 760px) {
        display: none !important;
    }
    display: grid;
    grid-template-columns: repeat(11, 1.2rem);
    grid-auto-rows: 1.2rem;
    gap: 2px;

    i {
        box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.24);
        animation: px-dither-in 220ms both;
    }
`;

const Title = styled.h2`
    font-family: var(--f-display);
    font-size: clamp(3.2rem, 2rem + 3vw, 7.2rem);
    line-height: 0.8;
    text-transform: uppercase;
    color: var(--fg);
`;

const Lead = styled.p`
    font-size: 1.6rem;
    color: var(--fg-3);
    text-wrap: balance;

    @media ${TINY} {
        font-size: 1.4rem;
    }
`;

/* Long starter labels wrap on narrow screens. */
const Start = styled(PixelButton)`
    max-width: 100%;
    height: auto;
    min-height: 4.4rem;
    padding-block: 0.8rem;
    white-space: normal;
    text-align: left;
`;

/* Points at the sidebar, or at the toolbar once the sidebar folds away. */
const Wide = styled.span`
    display: contents;

    @media (max-width: ${LIBRARY_COLLAPSE}) {
        display: none;
    }
`;

const Narrow = styled.span`
    display: none;

    @media (max-width: ${LIBRARY_COLLAPSE}) {
        display: contents;
    }
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
    @keyframes px-nudge-up {
        50% {
            transform: translateY(-3px);
        }
    }
    @media (max-width: ${LIBRARY_COLLAPSE}) {
        svg {
            animation-name: px-nudge-up;
        }
    }
`;

const Sleeper = styled.div`
    position: relative;

    @media (max-height: 760px), ${NARROW} {
        display: none;
    }

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

function EmptyStage(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const category = useSelector<RootState, string>(getActiveCategory);
    const { starter, motif } = categoryOf(category);
    return (
        <Wrap>
            <Card data-empty-card>
                <Sleeper aria-hidden="true">
                    <PixelSprite animal="cat" state="sleep" scale={3} />
                </Sleeper>
                <Motif aria-hidden="true" key={category}>
                    {motif.flatMap((row, y) =>
                        [...row].map((cell, x) => (
                            <i
                                key={`${x}-${y}`}
                                style={{
                                    backgroundColor: MOTIF_COLORS[cell],
                                    visibility:
                                        cell === "." ? "hidden" : undefined,
                                    animationDelay: `${(x + y) * 30}ms`,
                                }}
                            />
                        ))
                    )}
                </Motif>
                <Title>{starter.title}</Title>
                <Lead data-lead>{starter.lead}</Lead>
                <Pointer data-pointer>
                    <Wide>
                        <PixelIcon name="stepBack" scale={2} />
                        Choose from the list
                    </Wide>
                    <Narrow>
                        <PixelIcon name="chevronUp" scale={2} />
                        Or pick from Algorithms in the top bar
                    </Narrow>
                </Pointer>
                <Start
                    type="button"
                    $variant="primary"
                    data-start
                    onClick={() =>
                        starter.ids.forEach((id) => dispatch(openAlgorithm(id)))
                    }
                >
                    <PixelIcon name="plus" scale={2} />
                    {starter.label}
                </Start>
            </Card>
        </Wrap>
    );
}

export default EmptyStage;
