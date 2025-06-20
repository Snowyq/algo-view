import { createContext, useContext } from "react";
import styled from "styled-components";
import { MdDelete } from "react-icons/md";
import CircleButton from "../../ui/CircleButton";

const StyledPlayWindow = styled.div`
	position: relative;
	height: 100%;
	width: 100%;
	background-color: ${({ color }) => color || "var(--color-grey-50)"};
	box-shadow: 1px 1px 15px 0px var(--color-grey-300);
	border: 5px solid var(--color-grey-200);
	border-radius: 2.5rem;
	padding: 2.5rem;
`;

const CloseButtonHolder = styled.div`
	position: absolute;
	right: 0;
	top: 0;
	translate: 20% -20%;
`;

const PlayWindowContext = createContext();

function PlayWindow({ children, closeButton = true }) {
	return (
		<PlayWindowContext.Provider>
			<StyledPlayWindow>
				<ToolsLayer closeButton={closeButton} />
				{children}
			</StyledPlayWindow>
		</PlayWindowContext.Provider>
	);
}

function ToolsLayer({ closeButton }) {
	return <>{closeButton ? <CloseButton /> : ""}</>;
}

function Header({ children }) {
	return <span>{children}</span>;
}

const StyledBody = styled.div`
	height: 80%;
`;

function Body({ children }) {
	return <StyledBody>{children}</StyledBody>;
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

export default PlayWindow;
