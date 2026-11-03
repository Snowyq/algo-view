import styled, { css } from "styled-components";
import { labelText } from "../play/pixel/primitives/pixel";
import { CANVAS_H } from "../play/pixel/sprites/frames";

/** Side padding shared by every landing section and the header. */
export const GUTTER = "clamp(1.6rem, 3vw, 3.2rem)";

export const visuallyHidden = css`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
`;

export const Section = styled.section`
    position: relative;
    padding: 12.8rem ${GUTTER} 9.6rem;
    border-top: var(--b) solid var(--line);
`;

export const Eyebrow = styled.p`
    ${labelText};
    color: var(--accent);
    margin-bottom: 1.6rem;
`;

export const Title = styled.h2`
    font-family: var(--f-display);
    font-weight: 400;
    font-size: clamp(4rem, 2rem + 4vw, 8.8rem);
    line-height: 0.82;
    text-transform: uppercase;
    color: var(--fg);
`;

/* Strip a sprite runs along, sized to the sprite at the given scale. */
export const SpriteLane = styled.div<{ $scale: number }>`
    position: relative;
    height: ${({ $scale }) => CANVAS_H * $scale}px;
`;

export const SpriteRunner = styled.div`
    position: absolute;
    left: 0;
    bottom: -2px;
    will-change: transform;
`;
