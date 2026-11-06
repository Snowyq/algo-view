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
    POINTS_MAX,
    POINTS_MIN,
    POINTS_PRESETS,
    type PointsPreset,
} from "../../../../utils/pointsInput";

const PRESET_LABELS: ChoiceLabels<PointsPreset> = {
    scatter: { label: "Scatter", hint: "uniform" },
    cluster: { label: "Cluster", hint: "tiny hull" },
    ring: { label: "Ring", hint: "huge hull" },
};

function GeometryInputPanel(): JSX.Element {
    const {
        config,
        value: input,
        busy,
        size,
        setSize,
        face,
        apply,
    } = useCategoryInput("geometry", "count");

    return (
        <InputLayout
            action={
                <DiceButton face={face} disabled={busy} onClick={() => apply()}>
                    New points · G
                </DiceButton>
            }
        >
            <Form>
                <PresetField
                    label="Points"
                    presets={POINTS_PRESETS}
                    labels={PRESET_LABELS}
                    current={config.preset}
                    disabled={busy}
                    onPick={(preset) => apply({ preset })}
                />
                <SizeField
                    label="Count"
                    sliderLabel="Point count"
                    value={size}
                    min={POINTS_MIN}
                    max={POINTS_MAX}
                    onChange={setSize}
                />
                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Facts>
                        <dt>Points</dt>
                        <dd>{input.points.length}</dd>
                        <dt>Rule</dt>
                        <dd>no duplicates, no three on a line</dd>
                    </Facts>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default GeometryInputPanel;
