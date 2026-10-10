import { JSX } from "react";
import { BsLayoutSidebarReverse } from "react-icons/bs";
import styled from "styled-components";

type SidebarState = "hidden" | "visible";

const CollapseButton = styled.button<{ $state: SidebarState }>`
    position: absolute;
    right: 0;
    display: grid;
    place-items: center;
    width: var(--sidebar-tab-width);
    height: 4rem;
    border: 1px solid var(--ink-700);
    border-right: none;
    border-radius: var(--radius-md) 0 0 var(--radius-md);
    background-color: var(--ink-900);
    color: ${({ $state }) =>
        $state === "visible" ? "var(--text)" : "var(--text-muted)"};
    transition:
        color var(--dur-fast) var(--ease-out),
        background-color var(--dur-fast) var(--ease-out);

    svg {
        width: 1.8rem;
        height: 1.8rem;
    }

    @media (hover: hover) {
        &:hover {
            color: var(--text);
            background-color: var(--ink-850);
        }
    }
`;

type SidebarToggleButtonProps = {
    onClick?: () => void;
    state: SidebarState;
};

function SidebarToggleButton({
    onClick,
    state,
}: SidebarToggleButtonProps): JSX.Element {
    const label = state === "visible" ? "Hide sidebar" : "Show sidebar";
    return (
        <CollapseButton
            type="button"
            onClick={onClick}
            $state={state}
            aria-label={label}
            aria-expanded={state === "visible"}
            title={label}
        >
            <BsLayoutSidebarReverse aria-hidden="true" />
        </CollapseButton>
    );
}

export default SidebarToggleButton;
