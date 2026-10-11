import type { ReactNode, SelectHTMLAttributes } from "react";
import { JSX } from "react";
import styled from "styled-components";
type SelectOption = {
    value: string | number;
    label: ReactNode;
};

type SelectOptionLike = { value: string | number };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    options?: SelectOption[];
    selected?: SelectOption | SelectOptionLike | string | number | null;
    variant?: "white" | "normal";
};

const StyledSelect = styled.select<{ $variant?: "white" | "normal" }>`
    height: 4rem;
    padding: 0 3.2rem 0 1.2rem;
    border: 1px solid
        ${(props) =>
            props.$variant === "white" ? "var(--ink-600)" : "var(--ink-700)"};
    border-radius: var(--radius-sm);
    background-color: var(--ink-950);
    color: var(--text);
    font-size: var(--text-sm);
    font-weight: 500;
    appearance: none;
    background-image:
        linear-gradient(45deg, transparent 50%, currentColor 50%),
        linear-gradient(135deg, currentColor 50%, transparent 50%);
    background-position:
        calc(100% - 1.6rem) 50%,
        calc(100% - 1.2rem) 50%;
    background-size:
        0.4rem 0.4rem,
        0.4rem 0.4rem;
    background-repeat: no-repeat;
    transition: border-color var(--dur-fast) var(--ease-out);

    &:hover {
        border-color: var(--ink-600);
    }
`;

const Select = ({
    options = [],
    selected,
    variant = "normal",
    ...props
}: SelectProps): JSX.Element => {
    const selectedValue =
        selected && typeof selected === "object"
            ? selected.value
            : (selected ?? "");

    return (
        <StyledSelect $variant={variant} value={selectedValue} {...props}>
            {options.map((option) => {
                return (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                );
            })}
        </StyledSelect>
    );
};
export default Select;
