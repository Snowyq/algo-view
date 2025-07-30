import styled from "styled-components";

const StyledMultiSelect = styled.div`
	width: 100%;
`;

const Options = styled.div``;

function MultiSelect({ selected }) {
	return (
		<StyledMultiSelect>
			<Options></Options>
		</StyledMultiSelect>
	);
}

export default MultiSelect;
