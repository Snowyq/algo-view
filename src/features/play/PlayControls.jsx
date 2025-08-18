import styled from "styled-components";
import PlayWindow from "./PlayWindow";
import {
	memo,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { PlayContext, StepContext } from "./PlayContext";

import PlaySpeed from "./PlaySpeed";
import PlayProgressBar from "./PlayProgressBar";
import PlayProgressControls from "./PlayProgressControls";
import ButtonIcon from "../../ui/ButtonIcon";
import { RiNumbersLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
	changeStep,
	decreaseStep,
	getActiveCategory,
	getMaxStep,
	getSpeeds,
	getStep,
	increaseStep,
	toggleMetrics,
} from "./playSlice";
import PlayAnimation from "./PlayAnimation";

const Flex = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Group = styled.div`
	position: absolute;
`;

const Center = styled(Group)`
	left: 50%;
	translate: -50% 0;
`;

const Left = styled(Group)`
	left: 0;
`;

const Right = styled(Group)`
	right: 0;
`;

const StyledPlayControls = styled(Flex)`
	flex-direction: column;
	border-top: 3px solid var(--color-grey-300);
	/* background-color: yellow; */
	background-color: var(--color-grey-200);
	padding: 1rem 4rem 2rem 4rem;
	width: 100%;
`;

const Container = styled(Flex)`
	width: 100%;
	max-width: 1200px;
	height: 100%;
	flex-direction: column;
	gap: 2rem;
`;

const Controls = styled(Flex)`
	width: 100%;
	height: 100%;
	justify-content: space-between;
	position: relative;
`;

const Bar = styled(Flex)`
	width: 100%;
	height: 5rem;
`;

function PlayControls() {
	const dispatch = useDispatch();

	return (
		<StyledPlayControls>
			<Container>
				<Bar>
					<PlayProgressBar />
				</Bar>
				<Controls>
					<Left>
						<PlaySpeed />
					</Left>
					<Center>
						<PlayProgressControls />
					</Center>
					<Right>
						<ButtonIcon onClick={() => dispatch(toggleMetrics())}>
							<RiNumbersLine />
						</ButtonIcon>
					</Right>
				</Controls>
			</Container>
			<PlayAnimation />
		</StyledPlayControls>
	);
}

export default memo(PlayControls);
