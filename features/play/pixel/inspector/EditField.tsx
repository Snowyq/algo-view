import { JSX, useState, type KeyboardEvent } from "react";
import styled from "styled-components";
import { labelText, pixelFrame } from "../primitives/pixel";

/*
 * "Your own data": a text field checked as you type. Valid text goes
 * straight into the editor's draft; an error shows under the field and
 * holds the editor's Done until it is fixed. Nothing reaches the panels
 * until Done.
 */

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;

    label {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
    textarea,
    input {
        width: 100%;
        padding: 0.8rem 1rem;
        margin: var(--b);
        border: 0;
        background-color: var(--bg);
        color: var(--fg);
        font-family: var(--f-mono);
        font-size: 1.3rem;
        line-height: 1.5;
        resize: vertical;
        ${pixelFrame("var(--line-2)")};
    }
    textarea:focus-visible,
    input:focus-visible {
        outline: none;
        ${pixelFrame("var(--accent)")};
    }
    [aria-invalid="true"] {
        ${pixelFrame("var(--danger)")};
    }
    small {
        font-size: 1.2rem;
        color: var(--fg-4);
    }
    [role="alert"] {
        font-size: 1.2rem;
        color: var(--danger);
    }
`;

type EditFieldProps = {
    label: string;
    hint: string;
    /** Starting text (the draft's current value). */
    initial: string;
    multiline?: boolean;
    rows?: number;
    /** Checks the text; when valid, the caller updates its draft.
        Returns an error message, or null. */
    onEdit: (text: string) => string | null;
};

function EditField({
    label,
    hint,
    initial,
    multiline,
    rows = 3,
    onEdit,
}: EditFieldProps): JSX.Element {
    const [text, setText] = useState<string>(initial);
    const [error, setError] = useState<string | null>(null);
    const id = `edit-${label.replace(/\W+/g, "-").toLowerCase()}`;
    const change = (next: string): void => {
        setText(next);
        setError(onEdit(next));
    };
    // Keep playback shortcuts (space, arrows, G…) out of the field.
    const onKey = (event: KeyboardEvent): void => {
        if (event.key !== "Escape") event.stopPropagation();
    };
    const props = {
        id,
        value: text,
        spellCheck: false,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": `${id}-note`,
        onKeyDown: onKey,
    };
    return (
        <Wrap>
            <label htmlFor={id}>{label}</label>
            {multiline ? (
                <textarea
                    {...props}
                    rows={rows}
                    onChange={(e) => change(e.target.value)}
                />
            ) : (
                <input {...props} onChange={(e) => change(e.target.value)} />
            )}
            {error ? (
                <p role="alert" id={`${id}-note`}>
                    {error}
                </p>
            ) : (
                <small id={`${id}-note`}>{hint}</small>
            )}
        </Wrap>
    );
}

export default EditField;
