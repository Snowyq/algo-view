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
    TREE_MAX_COUNT,
    TREE_MIN_COUNT,
    TREE_PRESETS,
    type TreePreset,
} from "../../../../utils/treeInput";

const PRESET_LABELS: ChoiceLabels<TreePreset> = {
    random: { label: "Random", hint: "bushy BST" },
    ascending: { label: "Ascending", hint: "BST → list" },
    zigzag: { label: "Zigzag", hint: "outside in" },
};

function TreeInputPanel(): JSX.Element {
    const {
        config,
        value: input,
        busy,
        size,
        setSize,
        face,
        apply,
    } = useCategoryInput("tree", "count");

    return (
        <InputLayout
            action={
                <DiceButton face={face} disabled={busy} onClick={() => apply()}>
                    New keys · G
                </DiceButton>
            }
        >
            <Form>
                <PresetField
                    label="Insert order"
                    presets={TREE_PRESETS}
                    labels={PRESET_LABELS}
                    current={config.preset}
                    disabled={busy}
                    onPick={(preset) => apply({ preset })}
                />
                <SizeField
                    label="Keys"
                    sliderLabel="Key count"
                    value={size}
                    min={TREE_MIN_COUNT}
                    max={TREE_MAX_COUNT}
                    onChange={setSize}
                />
                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Facts>
                        <dt>Keys</dt>
                        <dd>{input.keys.join(" ")}</dd>
                    </Facts>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default TreeInputPanel;
