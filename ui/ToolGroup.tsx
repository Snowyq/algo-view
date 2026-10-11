import styled from "styled-components";
import ButtonIcon from "./ButtonIcon";

/*
 * Segmented container for related icon controls: one surface, one border,
 * buttons inside share height. Toggles show state via aria-pressed.
 */
export const ToolGroup = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--ink-700);
    border-radius: var(--radius-md);
    background-color: var(--ink-950);
`;

export const ToolButton = styled(ButtonIcon).attrs({
    size: "1.6rem",
    padding: "0.9rem",
    $borderRadius: "var(--radius-sm)",
})`
    position: relative;

    &[aria-pressed="true"],
    &[aria-expanded="true"] {
        --background: var(--ink-800);
        --color: var(--text);
    }

    /* Small lit marker under an active toggle. */
    &[aria-pressed="true"]::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: 3px;
        width: 4px;
        height: 4px;
        margin-left: -2px;
        border-radius: 50%;
        background-color: var(--finish);
    }
`;
