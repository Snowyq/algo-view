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
	padding: 4rem 4rem 1rem 4rem;
`;

const CloseButtonHolder = styled.div`
	position: absolute;
	right: 0;
	top: 0;
	translate: 20% -20%;
`;

const elementTypes = {
	Header: css`
		font-size: 3.5rem;
		font-weight: 700;
	`,
	Body: css`
		/* padding: 5rem;
		background-color: var(--color-grey-50);
		box-shadow: 0.5rem 0.5rem 0px 2px var(--color-grey-300);
		padding: 0 2rem; */
	`,
	Footer: css``,
};

const Element = styled.div`
	padding: 0 1rem;
	border-radius: 15px;
	${({ type }) => elementTypes[type] || ""};
`;

const gridTypes = {
	"Header-Body-Footer": css`
		grid-template-columns: 1fr;
		grid-template-rows: 6rem 1fr 4rem;
	`,
	"Header-Body": css``,
	"Body-Footer": css``,
	Body: css``,
};

const Grid = styled.div`
	height: 100%;
	display: grid;
	gap: 1rem;

	${({ type }) => gridTypes[type] || ""}
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
	const key = ["Header", "Body", "Footer"]
		.filter(el => elements.includes(el))
		.join("-");

	return <Grid type={key || ""}>{children}</Grid>;
}

function Header({ children }) {
	return <Element type="Header">{children}</Element>;
}

function Body({ children }) {
	return <Element type="Body">{children}</Element>;
}

function Footer({ children }) {
	return <Element type="Footer">{children}</Element>;
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

PlayWindow.Header = Header;
PlayWindow.Body = Body;
PlayWindow.Footer = Footer;

export default PlayWindow;
