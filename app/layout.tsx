import {
    Geist_Mono,
    Hanken_Grotesk,
    Jersey_10,
    Pixelify_Sans,
    Silkscreen,
} from "next/font/google";
import type { Viewport } from "next";
import { JSX } from "react";
import StyledComponentsRegistry from "../lib/StyledComponentsRegistry";
import AppClient from "./AppClient";

const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

/* Pixel faces used by PlayTheme. */
const jersey = Jersey_10({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-jersey",
});

const silk = Silkscreen({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-silk",
});

const pixelify = Pixelify_Sans({
    subsets: ["latin"],
    variable: "--font-pixelify",
});

export const viewport: Viewport = {
    themeColor: "#15120f",
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
            className={`antialiased ${fontMono.variable} ${body.variable} ${jersey.variable} ${silk.variable} ${pixelify.variable}`}
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
                    <AppClient>{children}</AppClient>
                </StyledComponentsRegistry>
            </body>
        </html>
    );
}
