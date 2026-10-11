"use client";

import type { ReactNode } from "react";
import { JSX } from "react";
import styled from "styled-components";
import TopBar from "./TopBar";
const Main = styled.main`
    background-color: var(--ink-950);
    overflow: hidden;
`;

const App = styled.div`
    display: grid;
    height: 100svh;
    width: 100svw;
    grid-template-rows: var(--nav-height) 1fr;
    grid-template-columns: auto;
    overflow: hidden;
`;

const SkipLink = styled.a`
    position: fixed;
    top: var(--space-2);
    left: var(--space-2);
    z-index: 2000;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-sm);
    background-color: var(--swap);
    color: var(--ink-950);
    font-weight: 600;
    transform: translateY(-200%);

    &:focus-visible {
        transform: none;
    }
`;

const Container = styled.div`
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
`;

type AppLayoutProps = {
    children: ReactNode;
};

function AppLayout({ children }: AppLayoutProps): JSX.Element {
    return (
        <App>
            <SkipLink href="#main">Skip to content</SkipLink>
            <TopBar />
            <Main id="main" tabIndex={-1}>
                <Container data-scroller="main">{children}</Container>
            </Main>
        </App>
    );
}

export default AppLayout;
