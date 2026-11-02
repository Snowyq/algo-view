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
    FILL_MAX_COLS,
    FILL_MIN_COLS,
    FILL_PRESETS,
    fillRows,
    type FillPreset,
} from "../../../../utils/fillInput";

const PRESET_LABELS: ChoiceLabels<FillPreset> = {
    caves: { label: "Caves", hint: "diagonal pinches" },
    rooms: { label: "Rooms", hint: "doors" },
    rings: { label: "Rings", hint: "one corridor" },
};

function FillInputPanel(): JSX.Element {
    const {
        config,
        value: input,
        busy,
        size,
        setSize,
        face,
        apply,
    } = useCategoryInput("fill", "cols");

    return (
        <InputLayout
            action={
                <DiceButton face={face} disabled={busy} onClick={() => apply()}>
                    New bitmap · G
                </DiceButton>
            }
        >
            <Form>
                <PresetField
                    label="Bitmap"
                    presets={FILL_PRESETS}
                    labels={PRESET_LABELS}
                    current={config.preset}
                    disabled={busy}
                    onPick={(preset) => apply({ preset })}
                />
                <SizeField
                    label="Width"
                    sliderLabel="Bitmap width"
                    display={`${size}×${fillRows(size)}`}
                    value={size}
                    min={FILL_MIN_COLS}
                    max={FILL_MAX_COLS}
                    onChange={setSize}
                />
                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Facts>
                        <dt>Size</dt>
                        <dd>
                            {input.cols} × {input.rows}
                        </dd>
                        <dt>Open</dt>
                        <dd>
                            {input.walls.filter((w) => w === 0).length} cells
                        </dd>
                        <dt>Start</dt>
                        <dd>
                            {input.start % input.cols},{" "}
                            {Math.floor(input.start / input.cols)}
                        </dd>
                    </Facts>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default FillInputPanel;
