import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { JSX, useRef, useState } from "react";
import styled from "styled-components";
import { labelText, pixelFrame } from "../play/pixel/primitives/pixel";
import { ditherReveal, hideForReveal } from "./ditherReveal";
import {
    Eyebrow,
    Section as BaseSection,
    Title as BaseTitle,
} from "./sectionStyles";
import SplitWords from "./SplitWords";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TECH_STACK = [
    "React",
    "Next.js",
    "TypeScript",
    "Redux Toolkit",
    "styled-components",
    "Web Workers",
    "OffscreenCanvas",
];

const ENTRIES = [
    {
        id: "tldr",
        title: "TL;DR",
        body: "Interactive sorting visualizer built for performance and clear UI. It handles multiple concurrent views with arrays of 1000 items on desktop. Rendering lives in Canvas + Web Workers, while React handles interface and control. The architecture is modular and ready for growth with new algorithms and views.",
    },
    {
        id: "goal",
        title: "Goal and scope",
        body: "I built an educational app that lets you compare sorting algorithms step by step. From the start I cared about intuitive UI and smooth animation. I treated it like a product, so tech decisions were made with scale and future features in mind.",
    },
    {
        id: "performance",
        title: "Performance as a starting point",
        body: "The target scenario was demanding: multiple simultaneous views and a shared array to sort (up to 1000 items). That set priorities: the main thread cannot be blocked by drawing, and React should handle UI, not animation.",
    },
    {
        id: "decisions",
        title: "Key decisions and rationale",
        body: "Separation of UI and rendering keeps the interface responsive. Animation sync uses a shared step index and broadcasts ticks instead of heavy payloads. React render count is controlled by limiting step updates in UI. The layout scales to many panels, while mobile limits views for clarity. Controls for play/pause, speed and step are centralized for instant feedback.",
    },
    {
        id: "summary",
        title: "Summary",
        body: "Clear UI and smooth rendering, backed by a modular structure that keeps state consistent and makes new features easy to plug in without rewriting core pieces.",
    },
    { id: "stack", title: "Tech stack", body: "" },
];

const Section = styled(BaseSection)`
    padding-top: 14.4rem;
`;

const Title = styled(BaseTitle)`
    margin-bottom: 6.4rem;
`;

const Layout = styled.div`
    display: grid;
    gap: 4.8rem;

    @media (min-width: 960px) {
        grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
        gap: 6.4rem;
    }
`;

/* Sticky index; the current entry gets a blinking cursor. */
const Index = styled.ol`
    display: none;
    list-style: none;

    @media (min-width: 960px) {
        display: grid;
        align-content: start;
        gap: 0.4rem;
        position: sticky;
        top: 12rem;
        height: max-content;
    }

    a {
        display: grid;
        grid-template-columns: 2rem 3.2rem 1fr;
        align-items: baseline;
        padding: 0.8rem 0;
        ${labelText};
        color: var(--fg-4);
        transition: color 100ms steps(2);
    }
    a::before {
        content: "▶";
        color: var(--accent);
        opacity: 0;
    }
    a[aria-current="true"] {
        color: var(--fg);
    }
    a[aria-current="true"]::before {
        opacity: 1;
        animation: px-blink 1s steps(1) infinite;
    }
    @media (hover: hover) {
        a:hover {
            color: var(--fg-2);
        }
    }
`;

const Entries = styled.div`
    display: grid;
    gap: 9.6rem;
`;

const Entry = styled.article`
    display: grid;
    gap: 2rem;
    scroll-margin-top: 9.6rem;

    h3 {
        display: flex;
        align-items: baseline;
        gap: 1.6rem;
        font-family: var(--f-display);
        font-weight: 400;
        font-size: clamp(3.2rem, 2rem + 2vw, 5.6rem);
        line-height: 0.85;
        text-transform: uppercase;
        color: var(--fg);
    }
    h3 small {
        ${labelText};
        color: var(--accent);
    }
`;

const Body = styled.p`
    font-size: clamp(1.8rem, 1.4rem + 0.6vw, 2.4rem);
    line-height: 1.45;
    color: var(--fg-2);
    max-width: 56ch;
    text-wrap: pretty;
`;

const Chips = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    list-style: none;

    li {
        padding: 0.8rem 1.2rem;
        margin: var(--b);
        background-color: var(--surface);
        ${labelText};
        color: var(--fg-2);
        ${pixelFrame("var(--line-2)")};
    }
`;

function BuildLog(): JSX.Element {
    const rootRef = useRef<HTMLElement | null>(null);
    const [active, setActive] = useState<number>(0);

    useGSAP(
        () => {
            const root = rootRef.current;
            if (!root) return;
            root.querySelectorAll<HTMLElement>("[data-entry]").forEach(
                (el, index) => {
                    ScrollTrigger.create({
                        trigger: el,
                        start: "top 60%",
                        end: "bottom 40%",
                        onToggle: (self) => self.isActive && setActive(index),
                    });
                }
            );
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                // Each paragraph's words dither in once as it arrives.
                root.querySelectorAll<HTMLElement>(
                    "[data-reveal='log']"
                ).forEach((el) => {
                    const words = el.querySelectorAll("[data-word]");
                    hideForReveal(words);
                    ScrollTrigger.create({
                        trigger: el,
                        start: "top 82%",
                        once: true,
                        onEnter: () =>
                            ditherReveal(words, {
                                stagger: 0.012,
                                duration: 200,
                            }),
                    });
                });
                const chips = root.querySelectorAll("[data-chip]");
                hideForReveal(chips);
                ScrollTrigger.create({
                    trigger: "[data-chips]",
                    start: "top 85%",
                    once: true,
                    onEnter: () => ditherReveal(chips, { stagger: 0.05 }),
                });
            });
        },
        { scope: rootRef }
    );

    return (
        <Section
            ref={rootRef}
            id="log"
            tabIndex={-1}
            aria-labelledby="log-title"
        >
            <Eyebrow>(04) Build log</Eyebrow>
            <SplitWords
                as={Title}
                id="log-title"
                reveal="section"
                text="How it is built."
            />
            <Layout>
                <Index aria-label="Build log entries">
                    {ENTRIES.map((entry, index) => (
                        <li key={entry.id}>
                            <a
                                href={`#${entry.id}`}
                                aria-current={
                                    index === active ? "true" : undefined
                                }
                            >
                                <span>
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                {entry.title}
                            </a>
                        </li>
                    ))}
                </Index>
                <Entries>
                    {ENTRIES.map((entry, index) => (
                        <Entry key={entry.id} id={entry.id} data-entry>
                            <h3>
                                <small>
                                    {String(index + 1).padStart(2, "0")}
                                </small>
                                {entry.title}
                            </h3>
                            {entry.id === "stack" ? (
                                <Chips data-chips aria-label="Tech stack">
                                    {TECH_STACK.map((item) => (
                                        <li key={item} data-chip>
                                            {item}
                                        </li>
                                    ))}
                                </Chips>
                            ) : (
                                <SplitWords
                                    as={Body}
                                    reveal="log"
                                    text={entry.body}
                                />
                            )}
                        </Entry>
                    ))}
                </Entries>
            </Layout>
        </Section>
    );
}

export default BuildLog;
