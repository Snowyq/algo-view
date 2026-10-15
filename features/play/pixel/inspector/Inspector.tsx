import { JSX, useId, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../../../algorithms/algorithmsRegistryApi";
import { PLAY_LAYOUT_BREAKPOINT } from "../../../../constants/breakpoints";
import type { AppDispatch, RootState } from "../../../../store";
import AlgorithmInfo from "../../AlgorithmInfo";
import CodePanel from "../../CodePanel";
import {
    getActiveAlgorithms,
    getActiveCategory,
    getObservedAlgorithmId,
    getSidebarOpen,
    getSidebarTab,
    setObservedAlgorithm,
    setSidebarOpen,
    setSidebarTab,
    type ActiveAlgorithm,
    type SidebarTab,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { labelText, pixelFrame } from "../primitives/pixel";
import InputPanel from "./InputPanel";
import PathInputPanel from "./PathInputPanel";

type InspectorTab = Exclude<SidebarTab, "selection">;

const TABS: Array<{ id: InspectorTab; label: string }> = [
    { id: "input", label: "Input" },
    { id: "code", label: "Code" },
    { id: "info", label: "Info" },
];

const Panel = styled.aside`
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    background-color: var(--bg-2);
    border-left: var(--b) solid var(--line);
    animation: px-wipe-left 160ms steps(4) both;

    @keyframes px-wipe-left {
        from {
            clip-path: inset(0 0 0 100%);
        }
        to {
            clip-path: inset(0 0 0 0);
        }
    }

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 90;
        height: min(78svh, 64rem);
        border-left: 0;
        border-top: var(--b) solid var(--line-2);
        animation: px-sheet-in 200ms steps(5) both;

        @keyframes px-sheet-in {
            from {
                transform: translateY(100%);
            }
            to {
                transform: translateY(0);
            }
        }
    }
`;

const Scrim = styled.button`
    display: none;

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: block;
        position: fixed;
        inset: 0;
        z-index: 89;
        border: 0;
        background-color: rgba(21, 18, 15, 0.7);
        background-image: radial-gradient(var(--line) 1px, transparent 1px);
        background-size: 4px 4px;
    }
`;

const Head = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    padding: 0.8rem 0.8rem 0 1.6rem;
    border-bottom: var(--b) solid var(--line);
`;

const TabList = styled.div`
    position: relative;
    display: flex;
    gap: 0.4rem;
`;

const Tab = styled.button`
    position: relative;
    height: 4.4rem;
    padding: 0 1.2rem 0 2.4rem;
    border: 0;
    background: none;
    color: var(--fg-4);
    ${labelText};
    font-size: 1.2rem;

    &[aria-selected="true"] {
        color: var(--fg);
    }
    @media (hover: hover) {
        &:hover {
            color: var(--fg-2);
        }
    }
`;

/* ▶ cursor that hops to the active tab in three frames, then blinks. */
const Cursor = styled.span`
    position: absolute;
    left: 0.6rem;
    top: 50%;
    width: 1rem;
    height: 1.2rem;
    margin-top: -0.6rem;
    color: var(--accent);
    pointer-events: none;
    transition: transform 120ms steps(3);

    svg {
        display: block;
        animation: px-blink 1s steps(1) infinite 0.4s;
    }
`;

const Body = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 2rem 1.6rem 2.4rem;

    &[data-fill="true"] {
        display: flex;
        flex-direction: column;
        gap: 1.6rem;
        overflow: hidden;
    }
`;

const CodeArea = styled.div`
    flex: 1;
    min-height: 0;
`;

const Choices = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
`;

const Choice = styled.button`
    height: 3.2rem;
    padding: 0 1rem;
    margin: var(--b);
    border: 0;
    background-color: var(--bg);
    color: var(--fg-3);
    font-size: 1.4rem;
    ${pixelFrame("var(--line)")};

    &[aria-pressed="true"] {
        color: var(--fg);
        background-color: var(--surface-2);
        ${pixelFrame("var(--accent)")};
    }
`;

const Prompt = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    color: var(--fg-3);
    font-size: 1.5rem;

    strong {
        font-family: var(--f-display);
        font-weight: 400;
        font-size: 3.2rem;
        line-height: 0.8;
        color: var(--fg);
        text-transform: uppercase;
    }
`;

/* Which open algorithm the Code and Info tabs follow. */
function ObservedChoices(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const observedId = useSelector<RootState, string | null>(
        getObservedAlgorithmId
    );
    if (active.length < 2) return null;
    return (
        <Choices role="group" aria-label="Algorithm to follow">
            {active.map((algo) => (
                <Choice
                    key={algo.id}
                    type="button"
                    aria-pressed={algo.id === observedId}
                    onClick={() => dispatch(setObservedAlgorithm(algo.id))}
                >
                    {algo.info.name}
                </Choice>
            ))}
        </Choices>
    );
}

/* Code/Info follow one algorithm; with a single one open, it's that one. */
function useFollowed(): ReturnType<typeof registryApi.getAlgorithmRegistry> {
    const category = useSelector<RootState, string>(getActiveCategory);
    const observedId = useSelector<RootState, string | null>(
        getObservedAlgorithmId
    );
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const id = observedId ?? (active.length === 1 ? active[0].id : null);
    return id ? registryApi.getAlgorithmRegistry(category, id) : undefined;
}

function FollowPrompt(): JSX.Element {
    const count = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    ).length;
    return (
        <Prompt>
            <strong>{count === 0 ? "No algorithm" : "Pick one"}</strong>
            <p>
                {count === 0
                    ? "Choose algorithms from the list on the left."
                    : "Click a panel, or pick an algorithm below, to follow it here."}
            </p>
            <ObservedChoices />
        </Prompt>
    );
}

function CodeTab(): JSX.Element {
    const registry = useFollowed();
    if (!registry) return <FollowPrompt />;
    const { instructions } = registry.algorithm;
    return (
        <>
            <ObservedChoices />
            <CodeArea>
                {instructions ? (
                    <CodePanel
                        key={registry.id}
                        algorithmId={registry.id}
                        name={registry.meta.name}
                        instructions={instructions}
                        description={registry.meta.description}
                    />
                ) : (
                    <p>{registry.meta.name} has no code to show.</p>
                )}
            </CodeArea>
        </>
    );
}

function InfoTab(): JSX.Element {
    const registry = useFollowed();
    if (!registry) return <FollowPrompt />;
    return (
        <>
            <ObservedChoices />
            <AlgorithmInfo registry={registry} />
        </>
    );
}

function Inspector(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const open = useSelector<RootState, boolean>(getSidebarOpen);
    const rawTab = useSelector<RootState, SidebarTab>(getSidebarTab);
    const tab: InspectorTab = rawTab === "selection" ? "input" : rawTab;
    const isPath =
        useSelector<RootState, string>(getActiveCategory) === "path";
    const baseId = useId();
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const cursorRef = useRef<HTMLSpanElement | null>(null);

    useLayoutEffect(() => {
        const cursor = cursorRef.current;
        const index = TABS.findIndex((t) => t.id === tab);
        const button = tabRefs.current[index];
        if (!cursor || !button) return;
        cursor.style.transform = `translateX(${button.offsetLeft}px)`;
    }, [tab, open]);

    // ARIA tabs: arrows move between tabs, only the selected one is tabbable.
    const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>): void => {
        const index = TABS.findIndex((t) => t.id === tab);
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
        else if (event.key === "ArrowLeft")
            next = (index - 1 + TABS.length) % TABS.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = TABS.length - 1;
        else return;
        event.preventDefault();
        event.stopPropagation();
        dispatch(setSidebarTab(TABS[next].id));
        tabRefs.current[next]?.focus();
    };

    if (!open) return null;

    return (
        <>
            <Scrim
                type="button"
                aria-label="Close Inspector"
                onClick={() => dispatch(setSidebarOpen(false))}
            />
            <Panel aria-label="Inspector" data-inspector>
                <Head>
                    <TabList role="tablist" aria-label="Inspector">
                        <Cursor ref={cursorRef} aria-hidden="true">
                            <PixelIcon name="play" scale={2} />
                        </Cursor>
                        {TABS.map((t, index) => (
                            <Tab
                                key={t.id}
                                ref={(el) => {
                                    tabRefs.current[index] = el;
                                }}
                                type="button"
                                role="tab"
                                id={`${baseId}-tab-${t.id}`}
                                aria-selected={tab === t.id}
                                aria-controls={`${baseId}-panel-${t.id}`}
                                tabIndex={tab === t.id ? 0 : -1}
                                onClick={() => dispatch(setSidebarTab(t.id))}
                                onKeyDown={handleTabKey}
                            >
                                {t.label}
                            </Tab>
                        ))}
                    </TabList>
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        $size="sm"
                        $square
                        aria-label="Close Inspector"
                        onClick={() => dispatch(setSidebarOpen(false))}
                    >
                        <PixelIcon name="close" scale={2} />
                    </PixelButton>
                </Head>
                {/* Input stays mounted: it keeps unsubmitted values. */}
                <Body
                    role="tabpanel"
                    id={`${baseId}-panel-input`}
                    aria-labelledby={`${baseId}-tab-input`}
                    hidden={tab !== "input"}
                >
                    {isPath ? <PathInputPanel /> : <InputPanel />}
                </Body>
                {tab === "code" && (
                    <Body
                        role="tabpanel"
                        id={`${baseId}-panel-code`}
                        aria-labelledby={`${baseId}-tab-code`}
                        data-fill="true"
                    >
                        <CodeTab />
                    </Body>
                )}
                {tab === "info" && (
                    <Body
                        role="tabpanel"
                        id={`${baseId}-panel-info`}
                        aria-labelledby={`${baseId}-tab-info`}
                    >
                        <InfoTab />
                    </Body>
                )}
            </Panel>
        </>
    );
}

export default Inspector;
