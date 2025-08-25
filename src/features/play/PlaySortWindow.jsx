import { useEffect, useState } from "react";
import styled from "styled-components";
import SortAlgorithmVisualizer from "./SortAlgorithmVisualizer";
import PlayStepMetrics from "./PlayStepMetrics";
import ButtonIcon from "../../ui/ButtonIcon";
import { RiNumbersLine } from "react-icons/ri";
import { IoSettings } from "react-icons/io5";
import { useSelector } from "react-redux";
import { getAllMetricsVisible } from "./playSlice";

const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
`;

const Heading = styled.h2``;
const Tools = styled.div`
	display: flex;
	gap: 0.25rem;
`;
const Container = styled.div`
	width: 100%;
	height: 100%;
	display: flex;

	flex-direction: column;
`;

const Top = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	padding: 0rem 0rem 0.5rem 0.5rem;
	width: 100%;
`;

const Main = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
	height: 100%;
	width: 100%;
	padding: 1rem 0.5rem;

	@media screen and (min-width: 640px) {
		padding: 0rem;
	}
`;

const Controls = styled.div`
	display: flex;
	padding: 0 1rem;
	align-items: center;
	gap: 1rem;
`;

const ControlsButtons = styled.div`
	display: flex;
	gap: 0.2rem;
`;

function PlaySortWindow({ registry }) {
	const [showMetrics, setShowMetrics] = useState(false);

	const allMetricsVisible = useSelector(getAllMetricsVisible);

	const toggleDisplayMetrics = () => setShowMetrics(x => !x);
	console.log(registry);
	useEffect(() => {
		setShowMetrics(allMetricsVisible);
	}, [allMetricsVisible]);

	return (
		<Container>
			<Top>
				<Header>
					<Heading>{registry.meta.name}</Heading>
					<Tools>
						<ButtonIcon onClick={toggleDisplayMetrics}>
							<RiNumbersLine />
						</ButtonIcon>
						<ButtonIcon>
							<IoSettings />
						</ButtonIcon>
					</Tools>
				</Header>
				{/* {showMetrics && <PlayStepMetrics registry={registry} />} */}
			</Top>
			<Main>
				<SortAlgorithmVisualizer registry={registry} />
				{/* <Controls>
					<PlaySlider />
					<ControlsButtons>
						<IoIosArrowBack />
						<IoIosArrowForward />
					</ControlsButtons>
				</Controls> */}
			</Main>
		</Container>
	);
}

export default PlaySortWindow;
