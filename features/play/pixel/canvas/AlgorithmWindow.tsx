import { JSX, useEffect, useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../../../algorithms/algorithmsRegistryApi";
import type { AppDispatch, RootState } from "../../../../store";
import AlgorithmInfo from "../../AlgorithmInfo";
import CodePanel from "../../CodePanel";
import {
    closeAlgorithmWindow,
    getActiveAlgorithms,
    getActiveCategory,
    getWindowAlgorithmId,
    type ActiveAlgorithm,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import { FOCUS_SHARE, FOCUS_SIDE_SHARE } from "./focusShare";
import PixelMetrics from "./PixelMetrics";
import PixelIcon from "../primitives/PixelIcon";
import { labelText, pixelFrame } from "../primitives/pixel";

/*
 * Focus mode, at every size: clicking a panel (or its "i") hides the other
 * panels and opens this window beside the clicked one (below it on narrow
 * stages). One "Algorithm" view: the live stats on top, shared by the
 * Code and About tabs underneath. The timeline stays in view, so playback
 * runs while the code lights up line by line.
 */

/* Stacked: below the focused panel. Side: to its right. */
const Window = styled.section`
    position: absolute;
    top: ${FOCUS_SHARE};
    left: 0;
    right: 0;
    bottom: 0;

    [data-window="side"] > & {
        top: 0;
        left: ${FOCUS_SIDE_SHARE};
        margin: 2.4rem 2.4rem 2.4rem 0;
    }

    z-index: 5;
    display: flex;
    flex-direction: column;
    margin: 0 1.2rem 1.2rem;
    background-color: var(--bg-2);
    cursor: auto;
    ${pixelFrame("var(--line-2)")};
    animation: px-drop-in 160ms steps(4) both;
`;

/* The algorithm's counters, shared by both tabs. */
const Stats = styled.div`
    padding: 0.8rem 1.6rem 0;
`;

const Head = styled.header`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 0.8rem 0 1.6rem;
`;

const Hint = styled.kbd`
    margin-left: auto;
    padding: 0.2rem 0.5rem;
    background-color: var(--surface-2);
    color: var(--fg-4);
    font-family: inherit;
    ${labelText};
    font-size: 0.9rem;

    @media (pointer: coarse) {
        display: none;
    }
`;

const Tabs = styled.div`
    display: flex;
    gap: 0.4rem;
    padding: 0.8rem 1.2rem 0;
    border-bottom: var(--b) solid var(--line);
`;

const Tab = styled.button`
    height: 4rem;
    padding: 0 1.2rem;
    border: 0;
    background: none;
    color: var(--fg-4);
    ${labelText};
    font-size: 1.1rem;
    box-shadow: inset 0 -3px 0 transparent;

    &[aria-selected="true"] {
        color: var(--fg);
        box-shadow: inset 0 -3px 0 var(--accent);
    }
`;

const Body = styled.div`
    flex: 1;
    min-height: 0;
    padding: 1.2rem;
    overflow-y: auto;
    overscroll-behavior: contain;

    &[data-fill="true"] {
        overflow: hidden;
    }
`;

type WindowTab = "code" | "about";

function AlgorithmWindow(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const id = useSelector<RootState, string | null>(getWindowAlgorithmId);
    const category = useSelector<RootState, string>(getActiveCategory);
    const [tab, setTab] = useState<WindowTab>("code");
    const totals = useSelector<RootState, ActiveAlgorithm["metrics"] | null>(
        (state) =>
            getActiveAlgorithms(state).find((algo) => algo.id === id)
                ?.metrics ?? null
    );
    const baseId = useId();

    useEffect(() => {
        if (!id) return;
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "Escape") dispatch(closeAlgorithmWindow());
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [id, dispatch]);

    const registry = id
        ? registryApi.getAlgorithmRegistry(category, id)
        : undefined;
    if (!registry) return null;
    const { instructions } = registry.algorithm;
    const shown: WindowTab = instructions ? tab : "about";

    return (
        <Window
            role="dialog"
            aria-label={`${registry.meta.name}: code and description`}
            aria-modal="false"
            data-no-observe
        >
            <Head>
                <PixelButton
                    type="button"
                    $variant="ghost"
                    $size="sm"
                    aria-keyshortcuts="Escape"
                    onClick={() => dispatch(closeAlgorithmWindow())}
                >
                    <PixelIcon name="stepBack" scale={2} />
                    All panels
                </PixelButton>
                <Hint>Esc</Hint>
            </Head>
            {totals && (
                <Stats>
                    <PixelMetrics id={registry.id} totals={totals} />
                </Stats>
            )}
            <Tabs role="tablist" aria-label={registry.meta.name}>
                {instructions && (
                    <Tab
                        type="button"
                        role="tab"
                        id={`${baseId}-code`}
                        aria-selected={shown === "code"}
                        onClick={() => setTab("code")}
                    >
                        Code
                    </Tab>
                )}
                <Tab
                    type="button"
                    role="tab"
                    id={`${baseId}-about`}
                    aria-selected={shown === "about"}
                    onClick={() => setTab("about")}
                >
                    About
                </Tab>
            </Tabs>
            <Body
                role="tabpanel"
                aria-labelledby={`${baseId}-${shown}`}
                data-fill={shown === "code"}
            >
                {shown === "code" && instructions ? (
                    <CodePanel
                        key={registry.id}
                        algorithmId={registry.id}
                        name={registry.meta.name}
                        instructions={instructions}
                    />
                ) : (
                    <AlgorithmInfo registry={registry} showTitle={false} />
                )}
            </Body>
        </Window>
    );
}

export default AlgorithmWindow;
