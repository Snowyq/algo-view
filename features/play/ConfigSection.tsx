import type { ReactNode } from "react";
import { JSX } from "react";
import styled from "styled-components";
const Item = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Container = styled.div`
    gap: 1.5rem;
    padding: 1rem 1rem;
    border-radius: 15px;
    background-color: var(--color-grey-200);
`;

type ConfigSectionProps = {
    title: string;
    children?: ReactNode;
};

function ConfigSection({ title, children }: ConfigSectionProps): JSX.Element {
    return (
        <Item>
            <p>{title}</p>
            <Container>{children}</Container>
        </Item>
    );
}

export default ConfigSection;
