import ButtonIcon from "../../ui/ButtonIcon";

function PlayControlsButton({ icon, onClick }) {
	return <ButtonIcon onClick={onClick}>{icon}</ButtonIcon>;
}

export default PlayControlsButton;
