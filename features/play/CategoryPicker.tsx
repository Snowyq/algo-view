import type { ChangeEventHandler, ReactNode } from "react";
import { JSX } from "react";
import styled from "styled-components";
import Select from "../../ui/Select";
const Category = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

type CategoryOption = { value: string | number; label: ReactNode };

type CategoryPickerProps = {
    selected?: CategoryOption | string | number | null;
    options: CategoryOption[];
    onChange?: ChangeEventHandler<HTMLSelectElement>;
};

function CategoryPicker({
    selected,
    options,
    onChange,
}: CategoryPickerProps): JSX.Element {
    return (
        <Category>
            <p>Select Category</p>
            <Select selected={selected} options={options} onChange={onChange} />
        </Category>
    );
}

export default CategoryPicker;
