import { JSX, useCallback, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled from "styled-components";
import type { CategoryId } from "../../../../algorithms/categoryData";
import type { AppDispatch, RootState } from "../../../../store";
import { useEscapeKey } from "../../../../hooks/useEscapeKey";
import type { PointsInput } from "../../../../utils/pointsInput";
import { categoryOf } from "../../categories";
import {
    getActiveCategory,
    getBrush,
    setBrush,
    setEditorOpen,
    setInputValue,
    type GridBrush,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { labelText, pixelFrame, scrollY } from "../primitives/pixel";
import PixelSprite from "../sprites/PixelSprite";
import GridSurface, { type GridDraft, type GridKind } from "./GridSurface";
import PointsSurface from "./PointsSurface";
import TextForms from "./TextForms";

/*
 * Full-stage editor for the active category's input. Edits a draft that
 * Done applies in one go; Cancel or Esc drops it.
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
        ${scrollY};
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

const HINTS: Partial<Record<CategoryId, string>> = {
    path: "Drag to paint with the brush; start on a painted cell to erase. Drag the start or end to move it.",
    fill: "Drag to draw walls; start on a wall to erase. Drag the ringed start cell to move it.",
    life: "Drag to bring cells to life; start on a live cell to clear.",
    geometry: "Click empty space to add a point, click a point to remove it.",
};

const isGridKind = (category: CategoryId): category is GridKind =>
    category === "path" || category === "fill" || category === "life";

type BodyProps = {
    category: CategoryId;
    draft: unknown;
    setDraft: (value: unknown) => void;
    setError: (field: string, error: string | null) => void;
};

/* Drawn, clicked or typed, depending on the category. */
function EditorBody({
    category,
    draft,
    setDraft,
    setError,
}: BodyProps): JSX.Element | null {
    if (category === "maze") return null;
    if (isGridKind(category)) {
        return (
            <Body>
                <GridSurface
                    kind={category}
                    value={draft as GridDraft}
                    onChange={setDraft}
                />
            </Body>
        );
    }
    if (category === "geometry") {
        return (
            <Body>
                <PointsSurface
                    value={draft as PointsInput}
                    onChange={setDraft}
                />
            </Body>
        );
    }
    const field =
        (key: string, check: (text: string) => string | null) =>
        (text: string): string | null => {
            const error = check(text);
            setError(key, error);
            return error;
        };
    return (
        <Body data-form>
            <TextForms
                category={category}
                draft={draft}
                setDraft={setDraft}
                field={field}
            />
        </Body>
    );
}

function DataEditor(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const category = useSelector<RootState, CategoryId>(getActiveCategory);
    const brush = useSelector<RootState, GridBrush>(getBrush);
    const def = categoryOf(category);
    // the panels only see the draft once Done applies it
    const [original] = useState<unknown>(
        () => store.getState().play.inputs[category].value
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

    useEscapeKey(true, close);

    const setError = useCallback(
        (field: string, error: string | null) =>
            setErrors((prev) =>
                prev[field] === error ? prev : { ...prev, [field]: error }
            ),
        []
    );

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
            <EditorBody
                category={category}
                draft={draft}
                setDraft={setDraft}
                setError={setError}
            />
        </Overlay>
    );
}

export default DataEditor;
