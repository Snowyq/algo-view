import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { JSX, useRef, useState } from "react";
import styled from "styled-components";
import PixelButton from "../play/pixel/primitives/PixelButton";
import PixelIcon from "../play/pixel/primitives/PixelIcon";
import { labelText } from "../play/pixel/primitives/pixel";
import { CANVAS_W } from "../play/pixel/sprites/frames";
import PixelSprite from "../play/pixel/sprites/PixelSprite";
import PixelLogo from "../play/pixel/toolbar/PixelLogo";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Section = styled.section`
    position: relative;
    overflow: hidden;
    padding: 12.8rem 0 0;
    border-top: var(--b) solid var(--line);
`;

const Rows = styled.div`
    display: grid;
    gap: 0.8rem;
    pointer-events: none;
    user-select: none;
`;

/* Huge outline-free type; rows drift against each other on scroll. */
const Row = styled.p`
    font-family: var(--f-display);
    font-size: clamp(8rem, 4rem + 10vw, 22rem);
    line-height: 0.8;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--surface-3);

    [data-lit] {
        color: var(--fg);
    }
    i {
        font-style: normal;
        color: var(--accent);
    }
`;

const Center = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.4rem;
    margin: 6.4rem auto 0;
    padding: 0 1.6rem;
    text-align: center;

    p {
        font-size: 1.8rem;
        color: var(--fg-2);
        max-width: 40ch;
    }
`;

const VisuallyHidden = styled.h2`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
`;

const CtaWrap = styled.div`
    position: relative;
`;

const Dash = styled.div`
    position: absolute;
    left: 0;
    bottom: 100%;
    pointer-events: none;
`;

const Footer = styled.footer`
    display: grid;
    gap: 2.4rem;
    margin-top: 12.8rem;
    padding: 3.2rem clamp(1.6rem, 3vw, 3.2rem) 4rem;
    border-top: var(--b) solid var(--line);
    color: var(--fg-3);

    @media (min-width: 760px) {
        grid-template-columns: auto 1fr auto;
        align-items: center;
    }

    nav {
        display: flex;
        gap: 2rem;
        ${labelText};
    }
    nav a {
        color: var(--fg-3);
    }
    @media (hover: hover) {
        nav a:hover {
            color: var(--fg);
        }
    }
    small {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
`;

const PHRASE = ["Open", "the", "playground"];

function FinalCta(): JSX.Element {
    const rootRef = useRef<HTMLElement | null>(null);
    const dashRef = useRef<HTMLDivElement | null>(null);
    const [dashing, setDashing] = useState<boolean>(false);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                const snap = gsap.utils.snap(4);
                gsap.utils
                    .toArray<HTMLElement>("[data-drift]")
                    .forEach((row, index) => {
                        const dir = index % 2 === 0 ? -1 : 1;
                        gsap.fromTo(
                            row,
                            { x: dir * -120 },
                            {
                                x: dir * 240,
                                ease: "none",
                                modifiers: {
                                    x: (x) => `${snap(parseFloat(x))}px`,
                                },
                                scrollTrigger: {
                                    trigger: rootRef.current,
                                    start: "top bottom",
                                    end: "bottom top",
                                    scrub: 0.6,
                                },
                            }
                        );
                    });
            });
        },
        { scope: rootRef }
    );

    // Hovering the CTA sends the cheetah sprinting across it.
    const dash = (): void => {
        const el = dashRef.current;
        if (!el || dashing) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
        const width = el.parentElement?.offsetWidth ?? 300;
        setDashing(true);
        gsap.fromTo(
            el,
            { x: -CANVAS_W * 2 },
            {
                x: width + 20,
                duration: 0.7,
                ease: "steps(14)",
                onComplete: () => setDashing(false),
            }
        );
    };

    return (
        <Section ref={rootRef} aria-labelledby="cta-title">
            <Rows aria-hidden="true">
                {[0, 1, 2].map((row) => (
                    <Row key={row} data-drift>
                        {Array.from({ length: 3 }, (_, i) => (
                            <span key={i}>
                                {PHRASE.map((word, w) => (
                                    <span
                                        key={w}
                                        data-lit={
                                            (row + w + i) % 3 === 1 || undefined
                                        }
                                    >
                                        {word}{" "}
                                    </span>
                                ))}
                                <i>· </i>
                            </span>
                        ))}
                    </Row>
                ))}
            </Rows>
            <Center>
                <VisuallyHidden id="cta-title">
                    Open the playground
                </VisuallyHidden>
                <p>
                    Pick a few algorithms, shape an input, choose an animal and
                    press space.
                </p>
                <CtaWrap onPointerEnter={dash} onFocus={dash}>
                    <Dash ref={dashRef} aria-hidden="true">
                        {dashing && (
                            <PixelSprite
                                animal="cheetah"
                                state="run"
                                scale={2}
                            />
                        )}
                    </Dash>
                    <PixelButton
                        as={Link}
                        href="/play"
                        $variant="primary"
                        $size="lg"
                    >
                        Open the playground
                        <PixelIcon name="stepFwd" scale={2} />
                    </PixelButton>
                </CtaWrap>
            </Center>
            <Footer>
                <PixelLogo scale={2} />
                <nav aria-label="Footer">
                    <Link href="/play">Playground</Link>
                    <a href="#how">How it reads</a>
                    <a href="#log">Build log</a>
                </nav>
                <small>
                    Canvas · Web Workers · React · {new Date().getFullYear()}
                </small>
            </Footer>
        </Section>
    );
}

export default FinalCta;
