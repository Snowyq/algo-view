"use client";

import type { ReactNode } from "react";
import { JSX } from "react";
import styled from "styled-components";
import TopBar from "./TopBar";
const Main = styled.main`
    background-color: var(--color-grey-100);
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
            <TopBar />
            <Main>
                <Container>{children}</Container>
            </Main>
        </App>
    );
}

export default AppLayout;
