"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import store from "../store";
import GlobalStyles from "../styles/GlobalStyles";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
        },
    },
});

type AppClientProps = {
    children: ReactNode;
};

export default function AppClient({ children }: AppClientProps) {
    return (
        <StrictMode>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                    <GlobalStyles />
                    {children}
                </QueryClientProvider>
            </Provider>
        </StrictMode>
    );
}
