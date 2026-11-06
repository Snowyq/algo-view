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
    LIFE_MAX_COLS,
    LIFE_MIN_COLS,
    LIFE_PRESETS,
    lifeRows,
    type LifePreset,
} from "../../../../utils/lifeInput";

const PRESET_LABELS: ChoiceLabels<LifePreset> = {
    soup: { label: "Soup", hint: "random noise" },
    symmetric: { label: "Mirror", hint: "4-way symmetric" },
    rpentomino: { label: "R-pentomino", hint: "5 busy cells" },
};

function LifeInputPanel(): JSX.Element {
    const {
        config,
        value: input,
        busy,
        size,
        setSize,
        face,
        apply,
    } = useCategoryInput("life", "cols");

    return (
        <InputLayout
            action={
                <DiceButton face={face} disabled={busy} onClick={() => apply()}>
                    New start · G
                </DiceButton>
            }
        >
            <Form>
                <PresetField
                    label="Start"
                    presets={LIFE_PRESETS}
                    labels={PRESET_LABELS}
                    current={config.preset}
                    disabled={busy}
                    onPick={(preset) => apply({ preset })}
                />
                <SizeField
                    label="Width"
                    sliderLabel="Grid width"
                    display={`${size}×${lifeRows(size)}`}
                    value={size}
                    min={LIFE_MIN_COLS}
                    max={LIFE_MAX_COLS}
                    onChange={setSize}
                />
                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Facts>
                        <dt>Grid</dt>
                        <dd>
                            {input.cols} × {input.rows}, edges wrap
                        </dd>
                        <dt>Alive</dt>
                        <dd>{input.cells.filter(Boolean).length} cells</dd>
                        <dt>Runs</dt>
                        <dd>up to 150 generations</dd>
                    </Facts>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default LifeInputPanel;
