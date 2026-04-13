import Button from "@/ui/Button";
import Link from "next/link";
import type { JSX } from "react";
import styled from "styled-components";

const Layout = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 12rem 1.5rem;
`;

const Container = styled.div`
    width: 100%;
    max-width: 96rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
`;

const Hero = styled.div`
    width: 100%;
    max-width: 96rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 8rem;
    text-align: center;
    align-items: center;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4.4rem;
    width: 100%;
    max-width: 76rem;
    align-self: center;
    padding-bottom: 4rem;
`;

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`;

const H1 = styled.h1`
    font-size: 3.2rem;
    text-align: center;
`;

function Index(): JSX.Element {
    return (
        <Layout>
            <Container>
                <Content>
                    <Hero>
                        <H1>Sort Algorithm Visualizer</H1>
                        <p>
                            Interactive sorting visualizer focused on
                            performance and clarity. Canvas + Web Workers
                            render, React handles UI and control.
                        </p>
                        <Button as={Link} href="/play">
                            Get Started
                        </Button>
                    </Hero>
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
