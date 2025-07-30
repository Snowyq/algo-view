import styled, { css } from "styled-components";
import Select from "../../ui/Select";
const selectStates = {
	opened: css`
		background-color: var(--color-grey-50);
		translate: -0.18rem -0.18rem;
		/* translate: -0.3rem -0.3rem; */

		&:hover {
			background-color: var(--color-grey-50);
		}
	`,

	closed: css`
		background-color: var(--color-grey-100);
		box-shadow: 0.27rem 0.27rem 0px 3px var(--color-grey-300);

		&:hover {
			translate: -0.18rem -0.18rem;
			box-shadow: 0.45rem 0.45rem 0px 3px var(--color-grey-400);
			background-color: var(--color-grey-50);
			transition:
				translate 0.3s,
				box-shadow 0.3s;
		}
	`,
};
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

const SelectList = styled.div`
	position: absolute;
`;
const SelectItem = styled.div``;

function PlaySelect({ selected, options }) {
	return (
		<StyledSelect>
			<Select type="normal" selected={selected}>
				<Select.Input />
				<SelectList>
					{options.map(option => {
						return (
							<Select.Option value={option.value}>
								<SelectItem>{option.label}</SelectItem>
							</Select.Option>
						);
					})}
				</SelectList>
			</Select>
		</StyledSelect>
	);
}

export default PlaySelect;
