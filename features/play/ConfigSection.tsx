import type { ReactNode } from "react";
import { JSX } from "react";
import styled from "styled-components";
const Item = styled.section`
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-5) 0;
    border-top: 1px solid var(--ink-700);

    &:first-child {
        border-top: none;
        padding-top: 0;
    }
`;

const Title = styled.h2`
    font-family: var(--font-mono-stack);
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
`;

type ConfigSectionProps = {
    title: string;
    children?: ReactNode;
};

function ConfigSection({ title, children }: ConfigSectionProps): JSX.Element {
    return (
        <Item>
            <Title>{title}</Title>
            {children}
        </Item>
    );
}

export default ConfigSection;
