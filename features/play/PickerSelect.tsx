import type { ReactNode } from "react";
import styled from "styled-components";
import Select from "../../ui/Select";

const StyledSelect = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 15px;
    padding: 1rem 1rem;
    border: none;

    z-index: 10;
    width: 100%;
    cursor: pointer;

    &:focus {
        outline: none;
    }

    &:hover {
        /* border: none; */
        outline: none;
    }
`;

function PickerSelect({
    selected,
    options,
}: {
    selected: { value: string | number } | string | number | null;
    options: { value: string | number; label: ReactNode }[];
}) {
    return (
        <StyledSelect>
            <Select variant="normal" selected={selected} options={options} />
        </StyledSelect>
    );
}

export default PickerSelect;
