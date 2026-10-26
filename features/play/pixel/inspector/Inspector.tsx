import { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../../../constants/breakpoints";
import type { AppDispatch, RootState } from "../../../../store";
import { categoryOf } from "../../categories";
import {
    getActiveCategory,
    getSidebarOpen,
    setSidebarOpen,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { labelText } from "../primitives/pixel";

/*
 * The Input sidebar (a bottom sheet on phones): the active category's
 * input form. Code, About and the stats of one algorithm live in focus
 * mode instead (click a panel).
 */

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

const Title = styled.h2`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    height: 4.4rem;
    ${labelText};
    font-size: 1.2rem;
    color: var(--fg);

    small {
        font-size: 1rem;
        color: var(--fg-4);
    }
`;

/* InputLayout scrolls its own form below a fixed action. */
const Body = styled.div`
    flex: 1;
    min-height: 0;
    overflow: hidden;
`;

function Inspector(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const open = useSelector<RootState, boolean>(getSidebarOpen);
    const def = categoryOf(useSelector<RootState, string>(getActiveCategory));
    const CategoryInput = def.InputPanel;

    if (!open) return null;

    return (
        <>
            <Scrim
                type="button"
                aria-label="Close input"
                onClick={() => dispatch(setSidebarOpen(false))}
            />
            <Panel aria-label="Input" data-inspector>
                <Head>
                    <Title>
                        Input <small>· {def.label}</small>
                    </Title>
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        $size="sm"
                        $square
                        aria-label="Close input"
                        onClick={() => dispatch(setSidebarOpen(false))}
                    >
                        <PixelIcon name="close" scale={2} />
                    </PixelButton>
                </Head>
                <Body>
                    <CategoryInput />
                </Body>
            </Panel>
        </>
    );
}

export default Inspector;
