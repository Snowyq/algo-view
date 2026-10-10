import { JSX, useId, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled, { css } from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
import type { AppDispatch, RootState } from "../../store";
import AlgorithmPicker from "./AlgorithmPicker";
import ConfigSection from "./ConfigSection";
import InputConfigPanel from "./InputConfigPanel";
import SidebarCodeTab from "./SidebarCodeTab";
import SidebarInfoTab from "./SidebarInfoTab";
import SidebarToggleButton from "./SidebarToggleButton";
import {
    getSidebarOpen,
    getSidebarTab,
    setSidebarOpen,
    setSidebarTab,
    toggleSidebar,
    type SidebarTab,
} from "./playSlice";

type SidebarState = "hidden" | "visible";

const sidebarStates: Record<SidebarState, ReturnType<typeof css>> = {
    hidden: css`
        border-left: 0 solid transparent;
        width: 0;
    `,
    visible: css`
        width: min(var(--sidebar-width), 100vw);
    `,
};

/* One width for every tab, so switching tabs never reflows the panels. */
const Sidebar = styled.aside<{ state: SidebarState }>`
    --sidebar-border-width: 1px;
    --sidebar-width: 40rem;
    position: absolute;
    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        position: relative;
    }
    right: 0;
    transition:
        width var(--dur-slow) var(--ease-out),
        border-left var(--dur-slow) var(--ease-out);
    height: 100%;
    background-color: var(--ink-900);
    border-left: var(--sidebar-border-width) solid var(--ink-700);
    z-index: 100000;
    ${({ state }) => sidebarStates[state]}

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
`;

const SidebarOverlay = styled.button`
    position: fixed;
    inset: 0;
    border: none;
    background-color: rgba(var(--ink-950-rgb), 0.7);
    padding: 0;
    margin: 0;
    z-index: 900;
    cursor: pointer;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: none;
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: var(--space-4) var(--space-5) var(--space-5);
`;

const SidebarOutlet = styled.div<{ state?: SidebarState }>`
    display: flex;
    flex-direction: column;
    width: var(--sidebar-width);
    max-width: 100vw;
    height: 100%;
    overflow: hidden;
    visibility: ${({ state }) => (state === "hidden" ? "hidden" : "visible")};
    transition: visibility 0s
        ${({ state }) => (state === "hidden" ? "var(--dur-slow)" : "0s")};
`;

const TabList = styled.div`
    position: relative;
    display: flex;
    flex: 0 0 auto;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-5) 0;
    border-bottom: 1px solid var(--ink-700);
`;

const Tab = styled.button`
    height: 4rem;
    padding: 0 var(--space-3);
    border: none;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    background: none;
    color: var(--text-muted);
    font-size: var(--text-sm);
    font-weight: 500;
    transition: color var(--dur-fast) var(--ease-out);

    &[aria-selected="true"] {
        color: var(--text);
    }

    @media (hover: hover) {
        &:hover {
            color: var(--text);
        }
    }
`;

/*
 * One indicator that travels between tabs, so the eye follows the switch.
 * Moved with transform only (translateX + scaleX of a 1px base).
 */
const TabIndicator = styled.span`
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 1px;
    height: 2px;
    border-radius: 2px;
    background-color: var(--finish);
    transform-origin: left center;
    pointer-events: none;

    &[data-ready="true"] {
        transition: transform 220ms var(--ease-out);
    }

    @media (prefers-reduced-motion: reduce) {
        &[data-ready="true"] {
            transition: none;
        }
    }
`;

const TabPanel = styled.div<{ $scroll: boolean }>`
    &[hidden] {
        display: none;
    }

    flex: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: ${({ $scroll }) => ($scroll ? "auto" : "hidden")};
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;

    /* Replays whenever the panel stops being display:none. */
    animation: tab-enter 200ms var(--ease-out);

    @keyframes tab-enter {
        from {
            opacity: 0;
            transform: translateY(4px);
            filter: blur(3px);
        }
        to {
            opacity: 1;
            transform: none;
            filter: none;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        animation: tab-fade 160ms linear;

        @keyframes tab-fade {
            from {
                opacity: 0;
            }
        }
    }
`;

const TABS: Array<{ id: SidebarTab; label: string }> = [
    { id: "input", label: "Input" },
    { id: "selection", label: "Selection" },
    { id: "code", label: "Code" },
    { id: "info", label: "Info" },
];

const CollapseButtonHolder = styled.div<{ state: SidebarState }>`
    --margin-right: 0rem;
    --margin-top: var(--space-3);
    --right-hidden: calc(100% + var(--margin-right));
    --right-visible: calc(
        100% + var(--margin-right) + var(--sidebar-border-width)
    );

    position: absolute;
    right: ${({ state }) =>
        `var(${state === "hidden" ? "--right-hidden" : "--right-visible"})`};
    top: var(--margin-top);

    display: none;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: block;
    }
`;

function ConfigSidebar(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const isOpen = useSelector<RootState, boolean>(getSidebarOpen);
    const tab = useSelector<RootState, SidebarTab>(getSidebarTab);
    const state: SidebarState = isOpen ? "visible" : "hidden";
    const baseId = useId();
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const indicatorRef = useRef<HTMLSpanElement | null>(null);

    // Place the indicator under the active tab; animate only after the
    // first placement so it doesn't slide in from the left on load.
    useLayoutEffect(() => {
        const indicator = indicatorRef.current;
        const index = TABS.findIndex((t) => t.id === tab);
        const button = tabRefs.current[index];
        if (!indicator || !button) return;
        const place = (): void => {
            const inset = 12;
            const x = button.offsetLeft + inset;
            const w = Math.max(1, button.offsetWidth - inset * 2);
            indicator.style.transform = `translateX(${x}px) scaleX(${w})`;
        };
        place();
        const frame = requestAnimationFrame(() => {
            indicator.dataset.ready = "true";
        });
        const observer = new ResizeObserver(place);
        observer.observe(button);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [tab]);

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
        dispatch(setSidebarTab(TABS[next].id));
        tabRefs.current[next]?.focus();
    };

    const toggleOpen = (): void => {
        dispatch(toggleSidebar());
    };

    const handleOverlayClick = (): void => {
        dispatch(setSidebarOpen(false));
    };

    return (
        <>
            {isOpen && (
                <SidebarOverlay
                    type="button"
                    aria-label="Close sidebar"
                    onClick={handleOverlayClick}
                />
            )}
            <Sidebar state={state}>
                <CollapseButtonHolder state={state}>
                    <SidebarToggleButton onClick={toggleOpen} state={state} />
                </CollapseButtonHolder>

                <SidebarOutlet state={state}>
                    <TabList role="tablist" aria-label="Sidebar">
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
                        <TabIndicator ref={indicatorRef} aria-hidden="true" />
                    </TabList>

                    {/* Input and Selection stay mounted: the input form
                        keeps unsubmitted values in local state. */}
                    <TabPanel
                        role="tabpanel"
                        id={`${baseId}-panel-input`}
                        aria-labelledby={`${baseId}-tab-input`}
                        hidden={tab !== "input"}
                        $scroll
                    >
                        <Container>
                            <ConfigSection title="Configure input">
                                <InputConfigPanel />
                            </ConfigSection>
                        </Container>
                    </TabPanel>
                    <TabPanel
                        role="tabpanel"
                        id={`${baseId}-panel-selection`}
                        aria-labelledby={`${baseId}-tab-selection`}
                        hidden={tab !== "selection"}
                        $scroll
                    >
                        <Container>
                            <ConfigSection title="Select Algorithms">
                                <AlgorithmPicker />
                            </ConfigSection>
                        </Container>
                    </TabPanel>
                    <TabPanel
                        role="tabpanel"
                        id={`${baseId}-panel-code`}
                        aria-labelledby={`${baseId}-tab-code`}
                        hidden={tab !== "code"}
                        $scroll={false}
                    >
                        {tab === "code" && <SidebarCodeTab />}
                    </TabPanel>
                    <TabPanel
                        role="tabpanel"
                        id={`${baseId}-panel-info`}
                        aria-labelledby={`${baseId}-tab-info`}
                        hidden={tab !== "info"}
                        $scroll
                    >
                        {tab === "info" && <SidebarInfoTab />}
                    </TabPanel>
                </SidebarOutlet>
            </Sidebar>
        </>
    );
}

export default ConfigSidebar;
