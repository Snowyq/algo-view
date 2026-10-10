import { JSX } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import type { AppDispatch } from "../../store";
import Button from "../../ui/Button";
import { setSidebarTab } from "./playSlice";

const Empty = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    font-size: var(--text-sm);
    color: var(--text-muted);
`;

/* Code and Info tabs with nothing open to follow. */
function SidebarEmpty(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    return (
        <Empty>
            <p>No algorithm is running. Pick one in Selection.</p>
            <Button
                size="small"
                variation="secondary"
                onClick={() => dispatch(setSidebarTab("selection"))}
            >
                Go to Selection
            </Button>
        </Empty>
    );
}

export default SidebarEmpty;
