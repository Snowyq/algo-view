import { JSX } from "react";
import type { CategoryId } from "../../../../algorithms/categoryData";
import type { DpInput } from "../../../../utils/dpInput";
import type { FindInput } from "../../../../utils/findInput";
import { nodeName, type GraphInput } from "../../../../utils/graphInput";
import type { TextInput } from "../../../../utils/textInput";
import type { TreeInput } from "../../../../utils/treeInput";
import EditField from "../inspector/EditField";
import {
    edgesToText,
    parseEdges,
    parseKeys,
    parseNumbers,
    parseText,
} from "../inspector/ownData";

/* Typed inputs for the editor: each field checks itself and, when valid,
   writes into the draft. */

type Check = (text: string) => string | null;

type FormProps = {
    draft: unknown;
    setDraft: (value: unknown) => void;
    /** Wraps a field's check so the editor learns about its error. */
    field: (key: string, check: Check) => Check;
};

function SortForm({ draft, setDraft, field }: FormProps): JSX.Element {
    const values = draft as number[];
    return (
        <EditField
            label="Values"
            hint="Whole numbers 1–999, separated by spaces or commas (2 to 1000 of them)."
            initial={values.join(" ")}
            multiline
            rows={6}
            onEdit={field("values", (text) => {
                const r = parseNumbers(text, {
                    min: 1,
                    max: 999,
                    minCount: 2,
                    maxCount: 1000,
                });
                if (!r.ok) return r.error;
                setDraft(r.value);
                return null;
            })}
        />
    );
}

function FindForm({ draft, setDraft, field }: FormProps): JSX.Element {
    const v = draft as FindInput;
    return (
        <>
            <EditField
                label="Values (sorted for you)"
                hint="Whole numbers 0–9999; search algorithms need them sorted, so they will be."
                initial={v.values.join(" ")}
                multiline
                rows={5}
                onEdit={field("values", (text) => {
                    const r = parseNumbers(text, {
                        min: 0,
                        max: 9999,
                        minCount: 2,
                        maxCount: 512,
                    });
                    if (!r.ok) return r.error;
                    setDraft({
                        ...v,
                        values: [...r.value].sort((a, b) => a - b),
                    });
                    return null;
                })}
            />
            <EditField
                label="Target"
                hint="The value to look for. It does not have to be in the array."
                initial={String(v.target)}
                onEdit={field("target", (text) => {
                    const r = parseNumbers(text, {
                        min: 0,
                        max: 9999,
                        minCount: 1,
                        maxCount: 1,
                    });
                    if (!r.ok) return r.error;
                    setDraft({ ...v, target: r.value[0] });
                    return null;
                })}
            />
        </>
    );
}

function StringsForm({ draft, setDraft, field }: FormProps): JSX.Element {
    const v = draft as TextInput;
    return (
        <>
            <EditField
                label="Text"
                hint="4 to 80 characters."
                initial={v.text}
                multiline
                onEdit={field("text", (text) => {
                    const r = parseText(text, { minLength: 4, maxLength: 80 });
                    if (!r.ok) return r.error;
                    if (v.pattern.length > r.value.length)
                        return "The pattern is longer than this text.";
                    setDraft({ ...v, text: r.value });
                    return null;
                })}
            />
            <EditField
                label="Pattern"
                hint="What to look for: 1 character up to the text's length."
                initial={v.pattern}
                onEdit={field("pattern", (text) => {
                    const r = parseText(text, {
                        minLength: 1,
                        maxLength: v.text.length,
                    });
                    if (!r.ok) return r.error;
                    setDraft({ ...v, pattern: r.value });
                    return null;
                })}
            />
        </>
    );
}

function TreeForm({ draft, setDraft, field }: FormProps): JSX.Element {
    const v = draft as TreeInput;
    return (
        <EditField
            label="Keys, in insert order"
            hint="2 to 31 distinct whole numbers, 1–99. Try them sorted to see a plain BST degrade."
            initial={v.keys.join(" ")}
            onEdit={field("keys", (text) => {
                const r = parseKeys(text);
                if (!r.ok) return r.error;
                setDraft({ keys: r.value });
                return null;
            })}
        />
    );
}

function DpForm({ draft, setDraft, field }: FormProps): JSX.Element {
    const v = draft as DpInput;
    const word = (key: "a" | "b", label: string): JSX.Element => (
        <EditField
            label={label}
            hint="1 to 16 letters. Used by edit distance and LCS."
            initial={v[key]}
            onEdit={field(key, (text) => {
                const clean = text.trim();
                if (!/^[\p{L}\d]{1,16}$/u.test(clean))
                    return "Use 1 to 16 letters or digits, no spaces.";
                setDraft({ ...v, [key]: clean });
                return null;
            })}
        />
    );
    return (
        <>
            {word("a", "First word")}
            {word("b", "Second word")}
        </>
    );
}

function GraphForm({ draft, setDraft, field }: FormProps): JSX.Element {
    const v = draft as GraphInput;
    const last = nodeName(v.nodes.length - 1);
    return (
        <EditField
            label={`Edges between ${nodeName(0)}–${last}`}
            hint="One per line, like “A-B 5” (weight 1–99). Node positions stay; every node must stay reachable from A."
            initial={edgesToText(v.edges)}
            multiline
            rows={10}
            onEdit={field("edges", (text) => {
                const r = parseEdges(text, v.nodes.length);
                if (!r.ok) return r.error;
                setDraft({ ...v, edges: r.value });
                return null;
            })}
        />
    );
}

const FORMS: Partial<Record<CategoryId, (props: FormProps) => JSX.Element>> = {
    sort: SortForm,
    find: FindForm,
    strings: StringsForm,
    tree: TreeForm,
    dp: DpForm,
    graph: GraphForm,
};

function TextForms({
    category,
    ...props
}: FormProps & { category: CategoryId }): JSX.Element | null {
    const Form = FORMS[category];
    return Form ? <Form {...props} /> : null;
}

export default TextForms;
