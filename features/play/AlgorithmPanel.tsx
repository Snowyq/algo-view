import type { ComponentType, MouseEvent } from "react";
import { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import type { AlgorithmRegistryItem } from "../../algorithms/types";
import type { AppDispatch, RootState } from "../../store";
import AlgorithmPanelShell from "./AlgorithmPanelShell";
import { getHighlightedPanelId, observeAlgorithm } from "./playSlice";
import SortAlgorithmPanel from "./SortAlgorithmPanel";

/* Clicks on the panel's own controls keep their job; anywhere else observes. */
const INTERACTIVE =
    "button, a, input, select, textarea, [role='slider'], [data-no-observe]";
const Container = styled.div`
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    padding: var(--space-3) var(--space-4) var(--space-4);

    /* Short panels: give the chart every pixel. */
    &:has([data-compact="true"]) {
        padding: 0.4rem;
    }
`;

type AlgorithmPanelProps = {
    registry: AlgorithmRegistryItem;
    category: string;
};

type AlgorithmPanelComponent = ComponentType<{
    registry: AlgorithmRegistryItem;
}>;

const WindowCategories: Record<string, AlgorithmPanelComponent> = {
    sort: SortAlgorithmPanel,
};

function AlgorithmPanel({
    registry,
    category,
}: AlgorithmPanelProps): JSX.Element {
    const Window: AlgorithmPanelComponent | undefined =
        WindowCategories[category];
    const dispatch = useDispatch<AppDispatch>();
    const highlightedId = useSelector<RootState, string | null>(
        getHighlightedPanelId
    );

    const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
        if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
        dispatch(observeAlgorithm(registry.id));
    };

    return (
        <AlgorithmPanelShell
            $observed={highlightedId === registry.id}
            onClick={handleClick}
        >
            <Container>{Window && <Window registry={registry} />}</Container>
        </AlgorithmPanelShell>
    );
}

export default AlgorithmPanel;
