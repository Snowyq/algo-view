import { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled, { css } from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
import type { AppDispatch, RootState } from "../../store";
import AlgorithmPicker from "./AlgorithmPicker";
import ConfigSection from "./ConfigSection";
import InputConfigPanel from "./InputConfigPanel";
import SidebarToggleButton from "./SidebarToggleButton";
import { getSidebarOpen, setSidebarOpen, toggleSidebar } from "./playSlice";

type SidebarState = "hidden" | "visible";

const sidebarStates: Record<SidebarState, ReturnType<typeof css>> = {
    hidden: css`
        border-left: 0 solid transparent;
        width: 0;
    `,
    visible: css`
        width: 35rem;
    `,
};

const Sidebar = styled.div<{ state: SidebarState }>`
    --sidebar-border-width: 3px;
    position: absolute;
    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        position: relative;
    }
    right: 0;
    transition:
        width 0.3s,
        border-left 0.3s;
    height: 100%;
    background-color: var(--color-grey-100);
    border-left: var(--sidebar-border-width) solid var(--color-grey-300);
    z-index: 100000;
    ${({ state }) => sidebarStates[state]}
`;

const SidebarOverlay = styled.button`
    position: fixed;
    inset: 0;
    border: none;
    background-color: rgba(17, 24, 39, 0.45);
    padding: 0;
    margin: 0;
    z-index: 900;
    cursor: pointer;
    transition: opacity 0.2s ease;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: none;
    }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 2rem 2rem;
    height: 100%;

    gap: 1.5rem;

    @media screen and (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        height: auto;
        min-height: 100%;
    }
`;

const SidebarOutlet = styled.div<{ state?: SidebarState }>`
    width: 35rem;
    overflow: hidden;

    height: 100%;

    @media screen and (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
    }
`;

const LegendList = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem 1.2rem;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.3rem;
`;

const LegendSwatch = styled.span<{ $colorVar: string }>`
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 3px;
    border: 1px solid var(--color-grey-300);
    background-color: ${({ $colorVar }) => `var(${$colorVar})`};
    flex: 0 0 auto;
`;

const CollapseButtonHolder = styled.div<{ state: SidebarState }>`
    --margin-right: 0rem;
    --margin-top: 1rem;
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

const stepLegend: Array<{ label: string; colorVar: string }> = [
    { label: "Swap", colorVar: "--color-step-swap" },
    { label: "Select", colorVar: "--color-step-select" },
    { label: "Check", colorVar: "--color-step-check" },
    { label: "Check true", colorVar: "--color-step-check-true" },
    { label: "Check false", colorVar: "--color-step-check-false" },
    { label: "Insert", colorVar: "--color-step-assign" },
    { label: "Shift from", colorVar: "--color-step-copy" },
    { label: "Shift to", colorVar: "--color-step-copy-to" },
    { label: "Finish", colorVar: "--color-step-finish" },
];

function ConfigSidebar(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const isOpen = useSelector<RootState, boolean>(getSidebarOpen);
    const state: SidebarState = isOpen ? "visible" : "hidden";

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
                    <Container>
                        <ConfigSection title="Configure input">
                            <InputConfigPanel />
                        </ConfigSection>
                        <ConfigSection title="Select Algorithms">
                            <AlgorithmPicker />
                        </ConfigSection>
                        <ConfigSection title="Step colors">
                            <LegendList>
                                {stepLegend.map((item) => (
                                    <LegendItem key={item.label}>
                                        <LegendSwatch
                                            $colorVar={item.colorVar}
                                        />
                                        <span>{item.label}</span>
                                    </LegendItem>
                                ))}
                            </LegendList>
                        </ConfigSection>
                    </Container>
                </SidebarOutlet>
            </Sidebar>
        </>
    );
}

export default ConfigSidebar;
