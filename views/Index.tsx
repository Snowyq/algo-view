"use client";

import styled from "styled-components";
import IndexHero from "../ui/IndexHero";

const Layout = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Container = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 120rem;
`;

function Index() {
    return (
        <Layout>
            <Container>
                <IndexHero />
            </Container>
        </Layout>
    );
}

export default Index;
