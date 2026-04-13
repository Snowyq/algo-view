import type { ComponentType } from "react";
import { JSX } from "react";
import styled from "styled-components";
import type { AlgorithmRegistryItem } from "../../algorithms/types";
import AlgorithmPanelShell from "./AlgorithmPanelShell";
import SortAlgorithmPanel from "./SortAlgorithmPanel";
const Container = styled.div`
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0 auto;

    padding: 1rem;

    /* max-width: 1200px; */
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

    return (
        <AlgorithmPanelShell>
            <Container>{Window && <Window registry={registry} />}</Container>
        </AlgorithmPanelShell>
    );
}

export default AlgorithmPanel;
