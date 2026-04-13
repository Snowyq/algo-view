import { Geist_Mono, Inter } from "next/font/google";
import { JSX } from "react";
import StyledComponentsRegistry from "../lib/StyledComponentsRegistry";
import AppLayout from "../ui/AppLayout";
import AppClient from "./AppClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): JSX.Element {
    return (
        <html
            lang="en"
            className={`antialiased ${fontMono.variable} font-sans ${inter.variable}`}
        >
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
