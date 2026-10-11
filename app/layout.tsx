import { Big_Shoulders, Geist_Mono, Hanken_Grotesk } from "next/font/google";
import type { Viewport } from "next";
import { JSX } from "react";
import StyledComponentsRegistry from "../lib/StyledComponentsRegistry";
import AppLayout from "../ui/AppLayout";
import AppClient from "./AppClient";

const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

const display = Big_Shoulders({
    subsets: ["latin"],
    axes: ["opsz"],
    variable: "--font-display",
});

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const viewport: Viewport = {
    themeColor: "#0a0c12",
    colorScheme: "dark",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): JSX.Element {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`antialiased ${fontMono.variable} ${display.variable} ${body.variable}`}
        >
            <head>
                <script
                    // Lets CSS hide intro elements only when JS will animate them in.
                    dangerouslySetInnerHTML={{
                        __html: "document.documentElement.classList.add('js')",
                    }}
                />
            </head>
            <body>
                <StyledComponentsRegistry>
                    <AppClient>
                        <AppLayout>{children}</AppLayout>
                    </AppClient>
                </StyledComponentsRegistry>
            </body>
        </html>
    );
}
