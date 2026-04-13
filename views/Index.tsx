import heroImage from "@/public/hero2.png";
import Button from "@/ui/Button";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";
import styled from "styled-components";

const Layout = styled.div`
    min-height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    position: relative;
`;

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6rem;
`;

const Hero = styled.section`
    position: relative;
    gap: 4.5rem;
    padding: 5.6rem 0;
    overflow: hidden;
    background-color: white;

    /* left ball */
    &::before {
        content: "";
        position: absolute;
        top: -12rem;
        left: -10rem;
        width: 28rem;
        height: 28rem;
        background: radial-gradient(
            circle,
            rgba(34, 211, 238, 0.35),
            transparent 70%
        );
        opacity: 0.8;
        pointer-events: none;
    }

    /* rigth ball */
    &::after {
        content: "";
        position: absolute;
        bottom: -14rem;
        right: -12rem;
        width: 32rem;
        height: 32rem;
        background: radial-gradient(
            circle,
            rgba(250, 204, 21, 0.35),
            transparent 70%
        );
        opacity: 0.7;
        pointer-events: none;
    }
`;

const HeroContent = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
    margin: 0 auto;
    max-width: 104rem;
    padding: 0 2rem;
    text-align: center;
    align-items: center;
`;

const H1 = styled.h1`
    font-size: clamp(3rem, 5vw, 6.2rem);
    line-height: 1.05;
    font-family: var(--font-display), var(--font-sans), "Open Sans", sans-serif;
    letter-spacing: -0.02em;
    color: var(--color-grey-900);
`;

const HeroLead = styled.p`
    font-size: 1.8rem;
    color: var(--color-grey-600);
    max-width: 52rem;

    @media (max-width: 900px) {
        max-width: 100%;
    }
`;

const HeroActions = styled.div`
    display: flex;
    align-items: center;
    gap: 1.6rem;
    flex-wrap: wrap;

    justify-content: center;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4.4rem;
    width: 100%;
    align-self: center;
    padding: 0 2rem;
    padding-bottom: 4rem;
    max-width: 104rem;
`;

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`;

const ImageContainer = styled.div`
    position: relative;
    width: 100%;
    padding: 1rem;
    background-color: var(--color-grey-300);
    border-radius: 2.6rem;
    overflow: hidden;
`;

function Index(): JSX.Element {
    return (
        <Layout>
            <Container>
                <Hero>
                    <HeroContent>
                        <H1>Sort Algorithm Visualizer</H1>
                        <HeroLead>
                            Interactive sorting visualizer focused on
                            performance and clarity. Canvas + Web Workers handle
                            rendering while React stays on UI control.
                        </HeroLead>
                        <HeroActions>
                            <Button as={Link} href="/play" size="large">
                                Open Playground
                            </Button>
                        </HeroActions>
                        <ImageContainer>
                            <Image
                                src={heroImage}
                                alt="Algorithm Visualizer"
                                sizes="(max-width: 900px) 100vw, 70vw"
                                loading="eager"
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    marginBottom: "-0.6rem",
                                    borderRadius: "1.6rem",
                                }}
                            />
                        </ImageContainer>
                    </HeroContent>
                </Hero>
                <Content>
                    <Section>
                        <h2>TL;DR</h2>
                        <p>
                            Interactive sorting visualizer built for performance
                            and clear UI. It handles multiple concurrent views
                            with arrays of 1000 items on desktop. Rendering
                            lives in Canvas + Web Workers, while React handles
                            interface and control. The architecture is modular
                            and ready for growth with new algorithms and views.
                        </p>
                    </Section>
                    <Section>
                        <h2>Goal and scope</h2>
                        <p>
                            I built an educational app that lets you compare
                            sorting algorithms step by step. From the start I
                            cared about intuitive UI and smooth animation. I
                            treated it like a product, so tech decisions were
                            made with scale and future features in mind.
                        </p>
                    </Section>
                    <Section>
                        <h2>Performance as a starting point</h2>
                        <p>
                            The target scenario was demanding: multiple
                            simultaneous views and a shared array to sort (up to
                            1000 items). That set priorities: the main thread
                            cannot be blocked by drawing, and React should
                            handle UI, not animation.
                        </p>
                    </Section>
                    <Section>
                        <h2>Key decisions and rationale</h2>
                        <p>
                            Separation of UI and rendering keeps the interface
                            responsive. Animation sync uses a shared step index
                            and broadcasts ticks instead of heavy payloads.
                            React render count is controlled by limiting step
                            updates in UI. The layout scales to many panels,
                            while mobile limits views for clarity. Controls for
                            play/pause, speed and step are centralized for
                            instant feedback.
                        </p>
                    </Section>
                    <Section>
                        <h2>Summary</h2>
                        <p>
                            Clear UI and smooth rendering, backed by a modular
                            structure that keeps state consistent and makes new
                            features easy to plug in without rewriting core
                            pieces.
                        </p>
                    </Section>
                    <Section>
                        <h2>Tech stack</h2>
                        <p>
                            React, Next.js, TypeScript, Redux Toolkit,
                            styled-components, Web Workers, OffscreenCanvas.
                        </p>
                    </Section>
                </Content>
            </Container>
        </Layout>
    );
}

export default Index;
