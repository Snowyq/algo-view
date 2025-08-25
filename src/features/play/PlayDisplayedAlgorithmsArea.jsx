import styled, { css } from "styled-components";
import PlayAlgorithmWindow from "./PlayAlgorithmWindow";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import { DottedBackground } from "../../ui/DottedBackground";
import { useSelector } from "react-redux";
import { getActiveAlgorithms, getActiveCategory } from "./playSlice";

const StyledPlayViewArea = styled.div`
	height: 100%;
	width: 100%;
	background-color: var(--color-grey-400);
	position: relative;

	@media screen and (min-width: 640px) {
		--dot-bg: var(--color-grey-100);
		--dot-color: var(--color-grey-300);
		--dot-size: 2px;
		--dot-space: 0.5rem;

		background:
			linear-gradient(
					90deg,
					var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
					transparent 1%
				)
				center / var(--dot-space) var(--dot-space),
			linear-gradient(
					var(--dot-bg) calc(var(--dot-space) - var(--dot-size)),
					transparent 1%
				)
				center / var(--dot-space) var(--dot-space),
			var(--dot-color);
	}
`;

const categories = {
	sort: {
		1: css``,
		2: css`
			grid-template-rows: 1fr 1fr;
		`,
		3: css`
			grid-template-rows: 1fr 1fr;
			grid-template-columns: 1fr 1fr;
		`,
		4: css`
			grid-template-rows: 1fr 1fr;
			grid-template-columns: 1fr 1fr;
		`,
		5: css`
			grid-template-rows: 1fr 1fr 1fr;
			grid-template-columns: 1fr 1fr;
		`,
		6: css`
			grid-template-rows: 1fr 1fr 1fr;
			grid-template-columns: 1fr 1fr;
		`,
		9: css`
			grid-template-rows: 1fr 1fr 1fr;
			grid-template-columns: 1fr 1fr 1fr;
		`,
	},
	default: css`
		grid-template-rows: 0;
	`,
};

const Grid = styled.div`
	display: grid;
	gap: 0.5rem;

	@media screen and (min-width: 640px) {
		gap: 2rem;
		padding: 5rem;
	}
	/* grid-template-columns: 1fr 1fr; */
	height: 100%;
	width: 100%;

	${({ category, num }) =>
		categories?.[category]?.[num] || categories["default"]}
`;

function PlayDisplayedAlgorithmsArea() {
	const activeAlgorithms = useSelector(getActiveAlgorithms);
	const activeCategory = useSelector(getActiveCategory);

	return (
		<StyledPlayViewArea>
			<Grid num={activeAlgorithms.length} category={activeCategory}>
				{activeAlgorithms.map(algo => {
					const registry = registryApi.getAlgorithmRegistry(
						activeCategory,
						algo.id
					);
					if (!registry) return <></>;
					return (
						<PlayAlgorithmWindow
							key={algo.id}
							registry={registry}
							category={activeCategory}
						/>
					);
				})}
			</Grid>
		</StyledPlayViewArea>
	);
}

export default PlayDisplayedAlgorithmsArea;
