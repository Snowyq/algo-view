import { Children, createContext } from "react";
import styled, { css } from "styled-components";
import { MdDelete } from "react-icons/md";
import CircleButton from "../../ui/CircleButton";

const StyledPlayWindow = styled.div`
	position: relative;
	height: 100%;
	width: 100%;
	background-color: ${({ color }) => color || "var(--color-grey-200)"};
	box-shadow: 1rem 1rem 0px 3px var(--color-grey-300);

	/* border: 0.75rem solid var(--color-grey-300); */
	border-radius: 2.5rem;
	padding: 2rem;
`;

const gridTypes = {
	"Header-Body-Footer": css`
		grid-template-columns: 1fr;
		grid-template-rows: 6rem 1fr 3rem;
	`,
	"Header-Body": css`
		grid-template-columns: 1fr;
		grid-template-rows: 6rem 1fr;
	`,
	"Body-Footer": css``,
	Body: css``,
};

const Grid = styled.div`
	height: 100%;
	width: 100%;
	display: grid;
	gap: 1rem;

	${({ type }) => gridTypes[type] || ""}
`;

const CloseButtonHolder = styled.div`
	position: absolute;
	right: 0;
	top: 0;
	translate: 20% -20%;
`;

const StyledHeader = styled.div`
	font-size: 3.5rem;
	font-weight: 600;
	display: flex;
	border-radius: 15px;
	justify-content: space-between;
	align-items: center;
`;

const StyledBody = styled.div`
	/* padding: 2rem 3.5rem 2rem 3rem; */
	width: 100%;
	height: 100%;
`;

const HeaderTitle = styled.div`
	border-radius: 15px;
	/* background-color: var(--color-grey-50); */
	/* border: 5px solid var(--color-grey-300); */
	/* box-shadow: 0.5rem 0.5rem 0px 2px var(--color-grey-300); */
	display: flex;
	/* translate: -2rem -2rem; */
	/* padding: 1rem 4rem; */

	justify-content: center;
	align-items: center;
`;

const StyledBackground = styled.div`
	/* display: flex;
	align-items: center;
	justify-content: center; */
	width: 100%;
	/* height: fit-content; */
	height: 100%;
	background-color: var(--color-grey-50);
	box-shadow: 0.5rem 0.5rem 0px 2px var(--color-grey-300);
	/* padding: 0 2rem; */
	border-radius: 15px;
	/* padding: 5rem 5rem; */
	gap: 1rem;
`;

const PlayWindowContext = createContext();
function PlayWindow({ children, closeButton = true }) {
	return (
		<PlayWindowContext.Provider>
			<StyledPlayWindow>
				{/* <ToolsLayer closeButton={closeButton} /> */}
				<WindowOutput>{children}</WindowOutput>
			</StyledPlayWindow>
		</PlayWindowContext.Provider>
	);
}

function WindowOutput({ children }) {
	const elements = Children.map(children, child => child?.type?.name);
	if (!elements) return <></>;
	const key = ["Header", "Body", "Footer"]
		.filter(el => elements.includes(el))
		.join("-");
	return <Grid type={key || ""}>{children}</Grid>;
}

function Element({ type, children }) {
	return (
		<ElementContainer type={type}>
			<ElementOutlet type={type}>{children}</ElementOutlet>
		</ElementContainer>
	);
}

function Header({ children }) {
	return (
		<StyledHeader>
			<HeaderTitle> {children}</HeaderTitle>
		</StyledHeader>
	);
}

function Body({ children }) {
	return <StyledBody>{children}</StyledBody>;
}

function Footer({ children }) {
	return <></>;
}

function Background({ children }) {
	return <StyledBackground>{children}</StyledBackground>;
}

function ToolsLayer({ closeButton }) {
	return <>{closeButton ? <CloseButton /> : ""}</>;
}

function CloseButton() {
	return (
		<CloseButtonHolder>
			<CircleButton>
				<MdDelete />
			</CircleButton>
		</CloseButtonHolder>
	);
}

PlayWindow.Background = Background;
PlayWindow.Header = Header;
PlayWindow.Body = Body;
PlayWindow.Footer = Footer;

export default PlayWindow;
