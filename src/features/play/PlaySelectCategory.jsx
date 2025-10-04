import styled from "styled-components";
import Select from "../../ui/Select";

const Category = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

function PlaySelectCategory({ selected, options, onChange }) {
	return (
		<Category>
			<p>Select Category</p>
			<Select selected={selected} options={options} onChange={onChange} />
		</Category>
	);
}

export default PlaySelectCategory;
