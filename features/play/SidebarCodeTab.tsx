import { JSX } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import type { RootState } from "../../store";
import CodePanel from "./CodePanel";
import ObservedPicker from "./ObservedPicker";
import type { ActiveAlgorithm } from "./playSlice";
import {
    getActiveAlgorithms,
    getActiveCategory,
    getObservedAlgorithmId,
} from "./playSlice";
import ObservePrompt from "./ObservePrompt";
import SidebarEmpty from "./SidebarEmpty";

/* Code of the observed algorithm, synced to the current step. */

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    height: 100%;
    min-height: 0;
    padding: var(--space-4) var(--space-5) var(--space-5);
`;

const CodeArea = styled.div`
    flex: 1;
    min-height: 0;
`;

function SidebarCodeTab(): JSX.Element {
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
    const instructions = registry.algorithm.instructions;

    return (
        <Wrap>
            <ObservedPicker />
            <CodeArea>
                {instructions ? (
                    <CodePanel
                        key={registry.id}
                        algorithmId={registry.id}
                        name={registry.meta.name}
                        instructions={instructions}
                        description={registry.meta.description}
                    />
                ) : (
                    <p>{registry.meta.name} has no code to show.</p>
                )}
            </CodeArea>
        </Wrap>
    );
}

export default SidebarCodeTab;
