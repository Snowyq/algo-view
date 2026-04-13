"use client";
import { useServerInsertedHTML } from "next/navigation";
import type { ReactNode } from "react";
import { JSX, useState } from "react";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

type StyledComponentsRegistryProps = {
    children: ReactNode;
};

function StyledComponentsRegistry({
    children,
}: StyledComponentsRegistryProps): JSX.Element {
    const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

    useServerInsertedHTML(() => {
        const styles = styledComponentsStyleSheet.getStyleElement();
        styledComponentsStyleSheet.instance.clearTag();
        return <>{styles}</>;
    });

    if (typeof window !== "undefined") {
        return <>{children}</>;
    }

    return (
        <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
            {children}
        </StyleSheetManager>
    );
}

export default StyledComponentsRegistry;
