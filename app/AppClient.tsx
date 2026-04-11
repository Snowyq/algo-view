"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import store from "../store";
import GlobalStyles from "../styles/GlobalStyles";

type AppClientProps = {
    children: ReactNode;
};

export default function AppClient({ children }: AppClientProps) {
    return (
        <Provider store={store}>
            <GlobalStyles />
            {children}
        </Provider>
    );
}
