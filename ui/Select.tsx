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
    font-size: 1.4rem;
    padding: 0.8rem 1.2rem;
    border: 1px solid
        ${(props) =>
            props.$variant === "white"
                ? "var(--color-grey-100)"
                : "var(--color-grey-300)"};
    border-radius: var(--border-radius-sm);
    background-color: var(--color-grey-0);
    font-weight: 500;
    box-shadow: var(--shadow-sm);
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
