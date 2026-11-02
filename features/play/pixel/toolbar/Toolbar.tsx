import { JSX, useRef, useState, type RefObject } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import styled from "styled-components";
import type { AppDispatch, RootState } from "../../../../store";
import {
    getEditorOpen,
    getSidebarOpen,
    setEditorOpen,
    toggleSidebar,
} from "../../playSlice";
import { setFx } from "../fx/fxStore";
import { pixelBurst } from "../fx/pixelBurst";
import Link from "../fx/TransitionLink";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelTooltip from "../primitives/PixelTooltip";
import { blockPattern } from "../primitives/pixel";
import { buildShareUrl } from "../share/shareState";
import { NARROW, TINY } from "../media";
import { LibraryPicker } from "../library/Library";
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

    @media ${NARROW} {
        gap: 0.8rem;
        padding: 0 0.8rem 0 1.2rem;
    }
`;

const Home = styled(Link)`
    display: inline-flex;
    align-items: center;
    color: var(--fg);
    padding: 0.8rem 0;

    @media ${NARROW} {
        svg {
            width: 8.7rem;
            height: auto;
        }
    }
    @media ${TINY} {
        svg {
            width: 7.2rem;
        }
    }
`;

const Divider = styled.span`
    width: 2px;
    height: 2.4rem;
    ${blockPattern("var(--line-2)", 2, 2, "180deg")};

    @media ${NARROW} {
        display: none;
    }
`;

const Spacer = styled.div`
    flex: 1;
`;

/* Text beside the icon on wide screens only. */
const Label = styled.span`
    @media (max-width: 900px) {
        display: none;
    }
`;

const Group = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const Desktop = styled.span`
    display: contents;

    @media ${NARROW} {
        display: none;
    }
`;

/* Copies a link to the current setup and puts it in the URL bar. */
function useShareLink(): {
    copied: boolean;
    shareRef: RefObject<HTMLSpanElement | null>;
    share: () => Promise<void>;
} {
    const store = useStore<RootState>();
    const [copied, setCopied] = useState<boolean>(false);
    const shareRef = useRef<HTMLSpanElement | null>(null);
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const share = async (): Promise<void> => {
        const { play } = store.getState();
        const url = buildShareUrl(play);
        window.history.replaceState(null, "", url);
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // clipboard can be blocked; the URL bar has the link anyway
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

    return { copied, shareRef, share };
}

function Toolbar(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const detailsOpen = useSelector<RootState, boolean>(getSidebarOpen);
    const editorOpen = useSelector<RootState, boolean>(getEditorOpen);
    const { copied, shareRef, share } = useShareLink();

    return (
        <Bar data-toolbar>
            <Home href="/" aria-label="Algo View home">
                <PixelLogo scale={3} />
            </Home>
            <Divider aria-hidden="true" />
            <LibraryPicker />
            <Spacer />
            <Group>
                <span
                    ref={shareRef}
                    style={{ position: "relative", display: "inline-flex" }}
                >
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        aria-label={
                            copied ? "Link copied" : "Copy a link to this setup"
                        }
                        onClick={share}
                    >
                        <PixelIcon name={copied ? "check" : "link"} scale={2} />
                        <Label>{copied ? "Copied" : "Share"}</Label>
                    </PixelButton>
                </span>
                <PixelTooltip
                    label="Draw or type your own data · E"
                    side="bottom"
                >
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        aria-label="Edit data"
                        aria-keyshortcuts="E"
                        aria-pressed={editorOpen}
                        onClick={() => dispatch(setEditorOpen(!editorOpen))}
                    >
                        <PixelIcon name="edit" scale={2} />
                        <Label>Edit data</Label>
                    </PixelButton>
                </PixelTooltip>
                <Desktop>
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        aria-label="Keyboard shortcuts"
                        aria-keyshortcuts="?"
                        onClick={() => setFx({ helpOpen: true })}
                    >
                        <PixelIcon name="keyboard" scale={2} />
                        <Label>Keys</Label>
                    </PixelButton>
                </Desktop>
                <PixelTooltip
                    label={
                        detailsOpen ? "Hide input · I" : "Edit the input · I"
                    }
                    side="bottom"
                    align="end"
                >
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        aria-label="Input sidebar"
                        aria-keyshortcuts="I"
                        aria-pressed={detailsOpen}
                        onClick={() => dispatch(toggleSidebar())}
                    >
                        <PixelIcon name="panelRight" scale={2} />
                        <Label>Input</Label>
                    </PixelButton>
                </PixelTooltip>
            </Group>
        </Bar>
    );
}

export default Toolbar;
