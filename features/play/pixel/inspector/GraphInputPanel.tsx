import { JSX } from "react";
import InputLayout from "./InputLayout";
import {
    DiceButton,
    Facts,
    Field,
    FieldHead,
    FieldLabel,
    Form,
    PresetField,
    SizeField,
    type ChoiceLabels,
} from "./form";
import { useCategoryInput } from "./useCategoryInput";
import {
    GRAPH_MAX_NODES,
    GRAPH_MIN_NODES,
    GRAPH_PRESETS,
    type GraphPreset,
} from "../../../../utils/graphInput";

const PRESET_LABELS: ChoiceLabels<GraphPreset> = {
    sparse: { label: "Sparse", hint: "few cycles" },
    dense: { label: "Dense", hint: "many choices" },
    grid: { label: "Grid", hint: "lattice" },
};

function GraphInputPanel(): JSX.Element {
    const {
        config,
        value: input,
        busy,
        size,
        setSize,
        face,
        apply,
    } = useCategoryInput("graph", "nodes");

    return (
        <InputLayout
            action={
                <DiceButton face={face} disabled={busy} onClick={() => apply()}>
                    New graph · G
                </DiceButton>
            }
        >
            <Form>
                <PresetField
                    label="Graph"
                    presets={GRAPH_PRESETS}
                    labels={PRESET_LABELS}
                    current={config.preset}
                    disabled={busy}
                    onPick={(preset) => apply({ preset })}
                />
                <SizeField
                    label="Nodes"
                    sliderLabel="Node count"
                    value={size}
                    min={GRAPH_MIN_NODES}
                    max={GRAPH_MAX_NODES}
                    onChange={setSize}
                />
                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Facts>
                        <dt>Nodes</dt>
                        <dd>{input.nodes.length}</dd>
                        <dt>Edges</dt>
                        <dd>
                            {input.edges.length} · weights 1–9 · total{" "}
                            {input.edges.reduce((sum, edge) => sum + edge.w, 0)}
                        </dd>
                        <dt>Start</dt>
                        <dd>A (leftmost)</dd>
                    </Facts>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default GraphInputPanel;
