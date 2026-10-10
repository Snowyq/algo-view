import { JSX } from "react";
import styled from "styled-components";
import ObservedPicker from "./ObservedPicker";

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5) var(--space-5);
`;

const Hint = styled.p`
    font-size: var(--text-sm);
    color: var(--text-muted);
`;

/* Algorithms are open but none is followed (never chosen, or deselected). */
function ObservePrompt(): JSX.Element {
    return (
        <Wrap>
            <ObservedPicker />
            <Hint>
                Click a panel, or pick an algorithm above, to follow it.
            </Hint>
        </Wrap>
    );
}

export default ObservePrompt;
