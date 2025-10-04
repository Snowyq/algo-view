import styled, { css } from "styled-components";
import { memo, useRef } from "react";

import PlaySpeed from "./PlaySpeed";
import PlayProgressBar from "./PlayProgressBar";
import PlayProgressControls from "./PlayProgressControls";
import ButtonIcon from "../../ui/ButtonIcon";
import { RiNumbersLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { getActiveAlgorithms, toggleMetrics } from "./playSlice";
import PlayAnimation from "./PlayAnimation";
import useHovered from "../../hooks/useHovered";
import { FaCode } from "react-icons/fa6";
import { FaInfo } from "react-icons/fa";
const Flex = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

const Group = styled.div`
	position: absolute;
`;

const Center = styled.div`
	width: 100%;
	height: 100%;

	display: flex;
	justify-content: center;
	align-items: center;
`;

const Left = styled(Group)`
	left: 0;
`;

const Right = styled(Group)`
	right: 0;
`;

const StyledPlayControls = styled(Flex)`
	position: relative;
	flex-direction: column;
	border-top: 5px solid var(--color-grey-400);
	/* background-color: yellow; */
	background-color: var(--color-grey-200);
	padding: 0.5rem 3rem 0.5rem 3rem;
	height: fit-content;
	width: 100%;

	touch-action: none;

	-webkit-user-select: none; /* iOS Safari */
	-ms-user-select: none; /* IE 10+ */
	user-select: none; /* Modern browsers */

	-webkit-touch-callout: none; /* iOS Safari long press menu */
	-webkit-tap-highlight-color: transparent; /* remove highlight on tap */

	-webkit-touch-callout: none;
	-webkit-user-callout: none;
	-webkit-user-select: none;
	-webkit-user-drag: none;
	-webkit-user-modify: none;
	-webkit-highlight: none;

	@media screen and (min-width: 640px) {
		border-top: 5px solid var(--color-grey-300);
		background-color: var(--color-grey-200);
		padding: 1rem 4rem 1rem 4rem;
	}
`;

const Container = styled(Flex)`
	width: 100%;
	max-width: 1200px;
	height: fit-content;
	gap: 0rem;
	flex-direction: column;
`;

const Controls = styled(Flex)`
	width: 100%;
	padding: 0.5rem 0;
	height: fit-content;
	justify-content: space-between;
	position: relative;
`;

const Bar = styled(Flex)`
	width: 100%;
	height: 100%;
`;

const disabledOverlayStates = {
	hide: css`
		display: none;
		background-color: none;
	`,
	show: css`
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10000;
		background-color: rgba(var(--color-grey-300-rgb), 0.85);
	`,
};

const StatusOverlay = styled.div`
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	top: 0;

	span {
		color: var(--color-grey-600);
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
	}
`;

const DisabledOverlay = styled(StatusOverlay)`
	${({ status }) => disabledOverlayStates[status]};
`;

function PlayControls() {
	const dispatch = useDispatch();
	const ref = useRef(null);
	const { isHovered } = useHovered(ref);
	const activeAlgorithms = useSelector(getActiveAlgorithms);
	const isActive = activeAlgorithms.length > 0;
	const status = isActive ? "active" : "disabled";

	return (
		<StyledPlayControls ref={ref}>
			<DisabledOverlay status={status === "disabled" ? "show" : "hide"}>
				<span>select algorithm</span>
			</DisabledOverlay>
			<Container>
				<Bar>
					<PlayProgressBar showHint={isHovered} />
				</Bar>
				<Controls>
					<Left>
						<PlaySpeed />
					</Left>
					<Center>
						<PlayProgressControls />
					</Center>
					<Right>
						<ButtonIcon>
							<FaInfo />
						</ButtonIcon>
						<ButtonIcon>
							<FaCode />
						</ButtonIcon>
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
