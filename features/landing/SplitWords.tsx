import { Fragment, JSX, type ElementType } from "react";
import styled from "styled-components";

const Mask = styled.span`
    display: inline-block;
    overflow: hidden;
    vertical-align: top;
    padding-bottom: 0.08em;
    margin-bottom: -0.08em;
`;

/* The real text for assistive tech; the split copy is decorative. */
const Hidden = styled.span`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
`;

const Word = styled.span`
    display: inline-block;
    will-change: transform;
`;

type SplitWordsProps = {
    text: string;
    as?: ElementType;
    className?: string;
    /** Marks the words for a GSAP reveal: [data-reveal="<name>"] [data-word]. */
    reveal?: string;
    id?: string;
};

/*
 * Server-rendered word masks. A visually hidden copy carries the text for
 * assistive tech; the split words are decorative. Without JS the words
 * simply sit in place, fully visible.
 */
function SplitWords({
    text,
    as: Tag = "span",
    className,
    reveal,
    id,
}: SplitWordsProps): JSX.Element {
    const words = text.split(/\s+/).filter(Boolean);
    return (
        <Tag className={className} data-reveal={reveal} id={id}>
            <Hidden>{text}</Hidden>
            {words.map((word, index) => (
                <Fragment key={`${word}-${index}`}>
                    <Mask aria-hidden="true">
                        <Word data-word>{word}</Word>
                    </Mask>
                    {index < words.length - 1 ? " " : null}
                </Fragment>
            ))}
        </Tag>
    );
}

export default SplitWords;
