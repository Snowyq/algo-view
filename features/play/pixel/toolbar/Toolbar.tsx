import Link from "next/link";
import { JSX, memo, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled, { keyframes } from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../../../constants/breakpoints";
import type { AppDispatch, RootState } from "../../../../store";
import type { GridConfig, GridInput } from "../../../../utils/grid";
import type { InputConfig } from "../../../../utils/randoms";
import {
    getAllCodeVisible,
    getAllMetricsVisible,
    getActiveCategory,
    getGrid,
    getGridConfig,
    getGridEdited,
    getInputConfig,
    getMaxStep,
    getSidebarOpen,
    getSidebarTab,
    getStep,
    setSidebarOpen,
    setSidebarTab,
    toggleCode,
    toggleMetrics,
    toggleSidebar,
} from "../../playSlice";
import { setFx } from "../fx/fxStore";
import { pixelBurst } from "../fx/pixelBurst";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelTooltip from "../primitives/PixelTooltip";
import { labelText } from "../primitives/pixel";
import { buildShareUrl } from "../share/shareState";
import PixelLogo from "./PixelLogo";

const Bar = styled.header`
    position: relative;
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 1.6rem;
    height: var(--toolbar-h);
    padding: 0 1.2rem 0 2rem;
    background-color: var(--bg-2);
    border-bottom: var(--b) solid var(--line);

    @media (max-width: 640px) {
        gap: 0.8rem;
        padding: 0 0.8rem 0 1.2rem;
    }
`;

const Home = styled(Link)`
    display: inline-flex;
    align-items: center;
    color: var(--fg);
    padding: 0.8rem 0;

    @media (max-width: 640px) {
        svg {
            width: 8.7rem;
            height: auto;
        }
    }
`;

const Divider = styled.span`
    width: 2px;
    height: 2.4rem;
    background-image: repeating-linear-gradient(
        180deg,
        var(--line-2) 0 2px,
        transparent 2px 4px
    );

    @media (max-width: 640px) {
        display: none;
    }
`;

const flip = keyframes`
    from { clip-path: inset(0 0 100% 0); transform: translateY(-4px); }
    to { clip-path: inset(0 0 0 0); transform: translateY(0); }
`;

/* Step counter: each digit that changes drops in over two frames. */
const Counter = styled.p`
    display: flex;
    align-items: baseline;
    gap: 0.8rem;
    min-width: 0;

    small {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
`;

const Digits = styled.span`
    display: inline-flex;
    font-family: var(--f-display);
    font-size: 3.2rem;
    line-height: 0.8;
    color: var(--fg);
    font-variant-numeric: tabular-nums;

    span {
        display: inline-block;
        /* Shorter than the 50ms tick, so fast playback never clips. */
        animation: ${flip} 40ms steps(2) both;
    }
    &[data-dim] {
        color: var(--fg-4);
    }
`;

const Spacer = styled.div`
    flex: 1;
`;

const InputChip = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    height: 3.2rem;
    padding: 0 1rem;
    border: 0;
    background: none;
    color: var(--fg-3);
    ${labelText};

    b {
        font-weight: 400;
        color: var(--fg);
    }
    @media (hover: hover) {
        &:hover {
            color: var(--fg);
            background-color: var(--surface);
        }
    }

    @media (max-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        display: none;
    }
`;

const Group = styled.div`
    display: flex;
    align-items: center;
    gap: 0.2rem;
`;

const Desktop = styled.span`
    display: contents;

    @media (max-width: 640px) {
        display: none;
    }
`;

const PRESET_SHORT: Record<InputConfig["preset"], string> = {
    random: "random",
    nearlySorted: "nearly sorted",
    reversed: "reversed",
    fewUnique: "few unique",
    sawtooth: "sawtooth",
    organPipe: "organ pipe",
};

const format = new Intl.NumberFormat("en-US");

function StepDigits({
    value,
    dim,
}: {
    value: number;
    dim?: boolean;
}): JSX.Element {
    const text = format.format(Math.max(0, value));
    // Keyed by position from the right, so only changed digits re-animate.
    return (
        <Digits data-dim={dim || undefined}>
            {[...text].map((char, index) => (
                <span key={`${text.length - index}:${char}`}>{char}</span>
            ))}
        </Digits>
    );
}

const StepCounter = memo(function StepCounter(): JSX.Element {
    const { value } = useSelector<RootState, { value: number }>(getStep);
    const maxStep = useSelector<RootState, number>(getMaxStep);
    const has = maxStep > 0;
    return (
        <Counter
            aria-live="off"
            aria-label={`Step ${value} of ${Math.max(0, maxStep)}`}
        >
            <small>Step</small>
            <StepDigits value={has ? value : 0} />
            <small>/</small>
            <StepDigits value={Math.max(0, maxStep)} dim />
        </Counter>
    );
});

function Toolbar(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();
    const config = useSelector<RootState, InputConfig>(getInputConfig);
    const category = useSelector<RootState, string>(getActiveCategory);
    const grid = useSelector<RootState, GridInput>(getGrid);
    const gridConfig = useSelector<RootState, GridConfig>(getGridConfig);
    const gridEdited = useSelector<RootState, boolean>(getGridEdited);
    const metrics = useSelector<RootState, boolean>(getAllMetricsVisible);
    const code = useSelector<RootState, boolean>(getAllCodeVisible);
    const inspectorOpen = useSelector<RootState, boolean>(getSidebarOpen);
    const tab = useSelector<RootState, string>(getSidebarTab);
    const [copied, setCopied] = useState<boolean>(false);
    const shareRef = useRef<HTMLSpanElement | null>(null);
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const share = async (): Promise<void> => {
        const { play } = store.getState();
        const url = buildShareUrl({
            category: play.active.category,
            algorithms: play.active.algorithms.map((algo) => algo.id),
            input: play.inputConfig,
            grid: {
                config: play.gridConfig,
                edited: play.gridEdited ? play.grid : null,
            },
            speed: play.animation.speed,
        });
        window.history.replaceState(null, "", url);
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // Clipboard can be blocked; the URL bar already has the link.
        }
        setCopied(true);
        const host = shareRef.current;
        if (host) {
            pixelBurst(host, {
                x: host.offsetWidth / 2,
                y: 8,
                count: 8,
                duration: 420,
            });
        }
        if (copiedTimer.current) clearTimeout(copiedTimer.current);
        copiedTimer.current = setTimeout(() => setCopied(false), 1600);
    };

    const openInput = (): void => {
        dispatch(setSidebarTab("input"));
        dispatch(setSidebarOpen(true));
    };

    return (
        <Bar data-toolbar>
            <Home href="/" aria-label="Algo View home">
                <PixelLogo scale={3} />
            </Home>
            <Divider aria-hidden="true" />
            <StepCounter />
            <Spacer />
            {category === "path" ? (
                <InputChip
                    type="button"
                    onClick={openInput}
                    aria-label={`Map: ${gridEdited ? "edited" : gridConfig.preset}, ${grid.cols} by ${grid.rows}. Edit`}
                    aria-pressed={inspectorOpen && tab === "input"}
                >
                    <b>{gridEdited ? "edited map" : gridConfig.preset}</b>
                    {grid.cols}×{grid.rows}
                </InputChip>
            ) : (
                <InputChip
                    type="button"
                    onClick={openInput}
                    aria-label={`Input: ${PRESET_SHORT[config.preset]}, ${config.length} values from ${config.min} to ${config.max}. Edit`}
                    aria-pressed={inspectorOpen && tab === "input"}
                >
                    <b>{PRESET_SHORT[config.preset]}</b>
                    n={config.length}
                    <span>
                        {config.min}–{config.max}
                    </span>
                </InputChip>
            )}
            <Group>
                <Desktop>
                    <PixelTooltip label="Counters" side="bottom">
                        <PixelButton
                            type="button"
                            $variant="ghost"
                            $square
                            aria-label="Show counters in panels"
                            aria-pressed={metrics}
                            onClick={() => dispatch(toggleMetrics())}
                        >
                            <PixelIcon name="metrics" scale={2} />
                        </PixelButton>
                    </PixelTooltip>
                    <PixelTooltip label="Code in panels" side="bottom">
                        <PixelButton
                            type="button"
                            $variant="ghost"
                            $square
                            aria-label="Show code in panels"
                            aria-pressed={code}
                            onClick={() => dispatch(toggleCode())}
                        >
                            <PixelIcon name="code" scale={2} />
                        </PixelButton>
                    </PixelTooltip>
                </Desktop>
                <PixelTooltip
                    label={copied ? "Link copied" : "Copy link"}
                    side="bottom"
                >
                    <span
                        ref={shareRef}
                        style={{ position: "relative", display: "inline-flex" }}
                    >
                        <PixelButton
                            type="button"
                            $variant="ghost"
                            $square
                            aria-label={
                                copied
                                    ? "Link copied"
                                    : "Copy link to this setup"
                            }
                            onClick={share}
                        >
                            <PixelIcon
                                name={copied ? "check" : "link"}
                                scale={2}
                            />
                        </PixelButton>
                    </span>
                </PixelTooltip>
                <Desktop>
                    <PixelTooltip label="Keys · ?" side="bottom">
                        <PixelButton
                            type="button"
                            $variant="ghost"
                            $square
                            aria-label="Keyboard shortcuts"
                            onClick={() => setFx({ helpOpen: true })}
                        >
                            <PixelIcon name="keyboard" scale={2} />
                        </PixelButton>
                    </PixelTooltip>
                </Desktop>
                <PixelTooltip label="Inspector · I" side="bottom" align="end">
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        $square
                        aria-label="Inspector"
                        aria-pressed={inspectorOpen}
                        onClick={() => dispatch(toggleSidebar())}
                    >
                        <PixelIcon name="panelRight" scale={2} />
                    </PixelButton>
                </PixelTooltip>
            </Group>
        </Bar>
    );
}

export default Toolbar;
