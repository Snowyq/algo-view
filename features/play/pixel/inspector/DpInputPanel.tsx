import { JSX } from "react";
import styled from "styled-components";
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
    DP_MAX_SIZE,
    DP_MIN_SIZE,
    DP_PRESETS,
    type DpPreset,
} from "../../../../utils/dpInput";

const PRESET_LABELS: ChoiceLabels<DpPreset> = {
    words: { label: "Words", hint: "kitten → sitting" },
    dna: { label: "DNA", hint: "ACGT strands" },
    letters: { label: "Letters", hint: "random a–h" },
};

const Bundle = styled(Facts)`
    dd {
        word-break: break-word;
    }
`;

function DpInputPanel(): JSX.Element {
    const {
        config,
        value: input,
        busy,
        size,
        setSize,
        face,
        apply,
    } = useCategoryInput("dp", "size");

    return (
        <InputLayout
            action={
                <DiceButton face={face} disabled={busy} onClick={() => apply()}>
                    New data · G
                </DiceButton>
            }
        >
            <Form>
                <PresetField
                    label="Strings"
                    presets={DP_PRESETS}
                    labels={PRESET_LABELS}
                    current={config.preset}
                    disabled={busy}
                    onPick={(preset) => apply({ preset })}
                />
                <SizeField
                    label="Size"
                    sliderLabel="Problem size"
                    value={size}
                    min={DP_MIN_SIZE}
                    max={DP_MAX_SIZE}
                    onChange={setSize}
                />
                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Bundle>
                        <dt>Words</dt>
                        <dd>
                            {input.a} · {input.b}
                        </dd>
                        <dt>Items</dt>
                        <dd>
                            {input.items
                                .map((item) => `${item.weight}kg/${item.value}`)
                                .join("  ")}{" "}
                            · max {input.capacity}kg
                        </dd>
                        <dt>Coins</dt>
                        <dd>
                            {input.coins.join(", ")} → {input.amount}
                        </dd>
                        <dt>Sequence</dt>
                        <dd>{input.sequence.join(" ")}</dd>
                    </Bundle>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default DpInputPanel;
