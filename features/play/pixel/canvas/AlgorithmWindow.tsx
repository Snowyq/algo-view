import { JSX, useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../../../algorithms/algorithmsRegistryApi";
import { GROWTH_LADDERS } from "../../../../algorithms/growth";
import type { AppDispatch, RootState } from "../../../../store";
import AlgorithmInfo from "../../AlgorithmInfo";
import CodePanel from "../../CodePanel";
import {
    closeAlgorithmWindow,
    getActiveAlgorithms,
    getActiveCategory,
    getVisibleAlgorithms,
    getWindowAlgorithmId,
    openAlgorithmWindow,
    type ActiveAlgorithm,
} from "../../playSlice";
import { useEscapeKey } from "../../../../hooks/useEscapeKey";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import {
    labelText,
    pixelCorners,
    pixelFrame,
    scrollY,
} from "../primitives/pixel";
import GrowthChart from "./GrowthChart";
import { FOCUS_SHARE, FOCUS_SIDE_SHARE } from "./panelLayout";
import PixelMetrics from "./PixelMetrics";

/*
 * Focus mode: the clicked panel stays, the others hide, and this window
 * shows its live stats over Code / About / Growth tabs.
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
    min-width: 0;
    margin: 0 1.2rem 1.2rem;
    background-color: var(--bg-2);
    cursor: auto;
    ${pixelFrame("var(--line-2)")};
    animation: px-dither-in 160ms steps(4) both;
`;

/* The algorithm's counters, above every tab. */
const Stats = styled.div`
    padding: 0.8rem 1.6rem 0;
`;

const Head = styled.header`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 0.8rem 0 1.6rem;
`;

/* The other open algorithms; wraps so every one stays visible. */
const Switcher = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.8rem 1.2rem 0;
`;

const Chip = styled.button`
    position: relative;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    height: 3.2rem;
    padding: 0 1rem;

    span {
        display: block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    margin: var(--b);
    border: 0;
    background-color: var(--bg);
    color: var(--fg-3);
    font-size: 1.4rem;
    ${pixelFrame("var(--line)")};

    &[aria-pressed="true"] {
        color: var(--accent-ink);
        background-color: var(--accent);
        ${pixelFrame("var(--accent-2)")};
    }
    @media (hover: hover) {
        &:hover:not([aria-pressed="true"]) {
            color: var(--fg);
        }
    }
    ${pixelCorners("var(--fg-3)", "&:hover, &:focus-visible", "0.8rem")};
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

/* Switching tabs dithers the new content in. */
const Body = styled.div`
    flex: 1;
    min-height: 0;
    animation: px-dither-in 160ms both;
    padding: 1.2rem;
    ${scrollY};

    &[data-fill="true"] {
        overflow: hidden;
    }
`;

type WindowTab = "code" | "about" | "growth";

const TAB_LABELS: Record<WindowTab, string> = {
    code: "Code",
    about: "About",
    growth: "Growth",
};

function AlgorithmWindow(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const id = useSelector<RootState, string | null>(getWindowAlgorithmId);
    const category = useSelector<RootState, string>(getActiveCategory);
    const [tab, setTab] = useState<WindowTab>("code");
    const open = useSelector<RootState, ActiveAlgorithm[]>(
        getVisibleAlgorithms
    );
    const totals = useSelector<RootState, ActiveAlgorithm["metrics"] | null>(
        (state) =>
            getActiveAlgorithms(state).find((algo) => algo.id === id)
                ?.metrics ?? null
    );
    const baseId = useId();

    useEscapeKey(Boolean(id), () => dispatch(closeAlgorithmWindow()));

    const registry = id
        ? registryApi.getAlgorithmRegistry(category, id)
        : undefined;
    if (!registry) return null;
    const { instructions } = registry.algorithm;
    const hasGrowth = Boolean(
        GROWTH_LADDERS[category as keyof typeof GROWTH_LADDERS]
    );
    const tabs: WindowTab[] = [
        ...(instructions ? ["code" as const] : []),
        "about",
        ...(hasGrowth ? ["growth" as const] : []),
    ];
    const shown: WindowTab = tabs.includes(tab) ? tab : "about";

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
            {open.length > 1 && (
                <Switcher role="group" aria-label="Show another open algorithm">
                    {open.map((algo) => (
                        <Chip
                            key={algo.id}
                            type="button"
                            aria-pressed={algo.id === registry.id}
                            onClick={() =>
                                dispatch(openAlgorithmWindow(algo.id))
                            }
                            title={algo.info.name}
                        >
                            <span>{algo.info.name}</span>
                        </Chip>
                    ))}
                </Switcher>
            )}
            {totals && (
                <Stats>
                    <PixelMetrics id={registry.id} totals={totals} />
                </Stats>
            )}
            <Tabs role="tablist" aria-label={registry.meta.name}>
                {tabs.map((name) => (
                    <Tab
                        key={name}
                        type="button"
                        role="tab"
                        id={`${baseId}-${name}`}
                        aria-selected={shown === name}
                        onClick={() => setTab(name)}
                    >
                        {TAB_LABELS[name]}
                    </Tab>
                ))}
            </Tabs>
            <Body
                key={`${registry.id}-${shown}`}
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
                ) : shown === "growth" ? (
                    <GrowthChart algorithmId={registry.id} />
                ) : (
                    <AlgorithmInfo registry={registry} showTitle={false} />
                )}
            </Body>
        </Window>
    );
}

export default AlgorithmWindow;
