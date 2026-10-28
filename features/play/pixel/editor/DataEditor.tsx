import { JSX, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled from "styled-components";
import type { AppDispatch, RootState } from "../../../../store";
import type { DpInput } from "../../../../utils/dpInput";
import type { FindInput } from "../../../../utils/findInput";
import { nodeName, type GraphInput } from "../../../../utils/graphInput";
import type { PointsInput } from "../../../../utils/pointsInput";
import type { TextInput } from "../../../../utils/textInput";
import type { TreeInput } from "../../../../utils/treeInput";
import { categoryOf } from "../../categories";
import {
    getActiveCategory,
    getBrush,
    setBrush,
    setEditorOpen,
    setInputValue,
    type GridBrush,
} from "../../playSlice";
import EditField from "../inspector/EditField";
import {
    edgesToText,
    parseEdges,
    parseKeys,
    parseNumbers,
    parseText,
} from "../inspector/ownData";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { labelText, pixelFrame } from "../primitives/pixel";
import PixelSprite from "../sprites/PixelSprite";
import GridSurface, { type GridDraft, type GridKind } from "./GridSurface";
import PointsSurface from "./PointsSurface";

/*
 * "Edit data": the current category's input, big, over the whole stage.
 * Grids are drawn on, hull points are clicked, everything else is typed.
 * All of it edits a draft: the panels behind recompute once, when Done
 * applies it. Cancel (or Esc) throws the draft away.
 */

const Overlay = styled.section`
    position: absolute;
    inset: 0;
    z-index: 7;
    display: flex;
    flex-direction: column;
    margin: 1.2rem;
    background-color: var(--bg-2);
    ${pixelFrame("var(--line-2)")};
    animation: px-dither-in 160ms steps(4) both;
`;

const Head = styled.header`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.8rem 1.2rem;
    padding: 1.2rem 1.2rem 1.2rem 1.6rem;
    border-bottom: var(--b) solid var(--line);

    h2 {
        flex: 1;
        min-width: 0;
        font-family: var(--f-display);
        font-weight: 400;
        font-size: 2.8rem;
        line-height: 0.9;
        text-transform: uppercase;
        color: var(--fg);
    }
    h2 small {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
        margin-left: 0.8rem;
    }
`;

const Doze = styled.span`
    display: inline-flex;
    margin-bottom: -0.4rem;

    @media (max-width: 640px) {
        display: none;
    }
`;

const Hint = styled.p`
    padding: 0.8rem 1.6rem;
    font-size: 1.3rem;
    color: var(--fg-3);
`;

const Body = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0 1.6rem 1.6rem;

    &[data-form] {
        overflow-y: auto;
        /* Room for the scrollbar is always kept, so its appearing never
           shifts the content sideways. */
        scrollbar-gutter: stable;
        overscroll-behavior: contain;
        gap: 2.4rem;
        padding-top: 1.2rem;
        max-width: 72rem;
    }
`;

const Brushes = styled.div`
    display: flex;
    gap: 0.4rem;

    button[aria-pressed="true"] {
        ${pixelFrame("var(--accent)")};
    }
`;

const BRUSHES: Array<{ id: GridBrush; label: string }> = [
    { id: "wall", label: "Wall" },
    { id: "mud", label: "Mud ×5" },
    { id: "erase", label: "Erase" },
];

const HINTS: Record<string, string> = {
    path: "Drag to paint with the brush; start on a painted cell to erase. Drag the start or end to move it.",
    fill: "Drag to draw walls; start on a wall to erase. Drag the ringed start cell to move it.",
    life: "Drag to bring cells to life; start on a live cell to clear.",
    geometry: "Click empty space to add a point, click a point to remove it.",
};

type FormProps = {
    category: string;
    draft: unknown;
    setDraft: (value: unknown) => void;
    /** Field key → error (null when fine). */
    setError: (field: string, error: string | null) => void;
};

/* Typed inputs: each field checks itself as you type and, when valid,
   writes into the draft. */
function TextForms({
    category,
    draft,
    setDraft,
    setError,
}: FormProps): JSX.Element {
    const field =
        (key: string, check: (text: string) => string | null) =>
        (text: string) => {
            const error = check(text);
            setError(key, error);
            return error;
        };
    switch (category) {
        case "sort": {
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
        case "find": {
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
        case "strings": {
            const v = draft as TextInput;
            return (
                <>
                    <EditField
                        label="Text"
                        hint="4 to 80 characters."
                        initial={v.text}
                        multiline
                        onEdit={field("text", (text) => {
                            const r = parseText(text, {
                                minLength: 4,
                                maxLength: 80,
                            });
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
        case "tree": {
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
        case "dp": {
            const v = draft as DpInput;
            const word = (key: "a" | "b", label: string) => (
                <EditField
                    label={label}
                    hint="1 to 16 letters. Used by edit distance and LCS."
                    initial={v[key]}
                    onEdit={field(key, (text) => {
                        const clean = text.trim();
                        if (!/^[\p{L}\d]{1,16}$/u.test(clean))
                            return "Use 1 to 16 letters or digits, no spaces.";
                        setDraft({ ...(draft as DpInput), [key]: clean });
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
        case "graph": {
            const v = draft as GraphInput;
            const names = v.nodes.map((_, i) => nodeName(i));
            return (
                <EditField
                    label={`Edges between ${names[0]}–${names[names.length - 1]}`}
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
        default:
            return <></>;
    }
}

function DataEditor(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const category = useSelector<RootState, string>(getActiveCategory);
    const brush = useSelector<RootState, GridBrush>(getBrush);
    const def = categoryOf(category);
    // Work on a copy; the panels see it only when Done applies it.
    const [original] = useState<unknown>(
        () =>
            (
                store.getState().play.inputs as Record<
                    string,
                    { value: unknown }
                >
            )[category]?.value
    );
    const [draft, setDraft] = useState<unknown>(original);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const invalid = Object.values(errors).some(Boolean);
    const changed = JSON.stringify(draft) !== JSON.stringify(original);

    const close = useCallback(() => dispatch(setEditorOpen(false)), [dispatch]);
    const done = (): void => {
        if (invalid) return;
        if (changed) {
            dispatch(
                setInputValue({ category, value: draft } as Parameters<
                    typeof setInputValue
                >[0])
            );
        }
        close();
    };

    // Escape discards, like Cancel.
    useEffect(() => {
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "Escape") close();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [close]);

    const setError = useCallback(
        (fieldKey: string, error: string | null) =>
            setErrors((prev) =>
                prev[fieldKey] === error ? prev : { ...prev, [fieldKey]: error }
            ),
        []
    );

    const grid =
        category === "path" || category === "fill" || category === "life";

    return (
        <Overlay
            aria-label={`Edit the ${def.label} data`}
            role="dialog"
            data-no-observe
        >
            <Head>
                <Doze aria-hidden="true">
                    <PixelSprite animal="sloth" state="sleep" scale={2} />
                </Doze>
                <h2>
                    Edit data <small>{def.label}</small>
                </h2>
                {category === "path" && (
                    <Brushes role="group" aria-label="Brush">
                        {BRUSHES.map((b) => (
                            <PixelButton
                                key={b.id}
                                type="button"
                                $variant="ghost"
                                $size="sm"
                                aria-pressed={brush === b.id}
                                onClick={() => dispatch(setBrush(b.id))}
                            >
                                {b.label}
                            </PixelButton>
                        ))}
                    </Brushes>
                )}
                <PixelButton
                    type="button"
                    $variant="ghost"
                    $size="sm"
                    onClick={close}
                >
                    {changed ? "Cancel" : "Close"}
                </PixelButton>
                {category !== "maze" && (
                    <PixelButton
                        type="button"
                        $variant="primary"
                        $size="sm"
                        disabled={invalid || !changed}
                        onClick={done}
                    >
                        <PixelIcon name="check" scale={2} />
                        Done
                    </PixelButton>
                )}
            </Head>
            {category === "maze" ? (
                <Hint>
                    The maze is what these algorithms produce, so there is
                    nothing to draw here. Change its size or press New seed in
                    Input instead.
                </Hint>
            ) : (
                <Hint>
                    {HINTS[category] ??
                        "Type your own data; it is checked as you go."}{" "}
                    {changed
                        ? "Done applies it; the panels recompute once."
                        : "Nothing changes until you press Done."}
                </Hint>
            )}
            {category === "maze" ? null : grid ? (
                <Body>
                    <GridSurface
                        kind={category as GridKind}
                        value={draft as GridDraft}
                        onChange={setDraft}
                    />
                </Body>
            ) : category === "geometry" ? (
                <Body>
                    <PointsSurface
                        value={draft as PointsInput}
                        onChange={setDraft}
                    />
                </Body>
            ) : (
                <Body data-form>
                    <TextForms
                        category={category}
                        draft={draft}
                        setDraft={setDraft}
                        setError={setError}
                    />
                </Body>
            )}
        </Overlay>
    );
}

export default DataEditor;
