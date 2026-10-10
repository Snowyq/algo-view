import { JSX } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import type { RootState } from "../../store";
import AlgorithmInfo from "./AlgorithmInfo";
import ObservedPicker from "./ObservedPicker";
import ObservePrompt from "./ObservePrompt";
import type { ActiveAlgorithm } from "./playSlice";
import {
    getActiveAlgorithms,
    getActiveCategory,
    getObservedAlgorithmId,
} from "./playSlice";
import SidebarEmpty from "./SidebarEmpty";

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: var(--space-4) var(--space-5) var(--space-5);
`;

function SidebarInfoTab(): JSX.Element {
    const category = useSelector<RootState, string>(getActiveCategory);
    const observedId = useSelector<RootState, string | null>(
        getObservedAlgorithmId
    );
    const hasActive =
        useSelector<RootState, ActiveAlgorithm[]>(getActiveAlgorithms).length >
        0;
    const registry = observedId
        ? registryApi.getAlgorithmRegistry(category, observedId)
        : undefined;

    if (!registry) return hasActive ? <ObservePrompt /> : <SidebarEmpty />;

    return (
        <Wrap>
            <ObservedPicker />
            <AlgorithmInfo registry={registry} />
        </Wrap>
    );
}

export default SidebarInfoTab;
