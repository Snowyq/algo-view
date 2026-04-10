import ButtonIcon from "../../ui/ButtonIcon";

function ControlIconButton({ icon, onClick }) {
	return <ButtonIcon onClick={onClick}>{icon}</ButtonIcon>;
}

export default ControlIconButton;