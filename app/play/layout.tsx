import type { Metadata } from "next";
import type { JSX, ReactNode } from "react";

export const metadata: Metadata = {
    title: "Playground · Algo View",
    description: "Compare sorting algorithms step by step.",
};

export default function PlayLayout({
    children,
}: Readonly<{ children: ReactNode }>): JSX.Element {
    return <>{children}</>;
}
