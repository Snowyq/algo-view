import type { MouseEventHandler, ReactNode } from "react";
import { JSX } from "react";
import ButtonIcon from "../../ui/ButtonIcon";
type ControlIconButtonProps = {
    icon: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
};

function ControlIconButton({
    icon,
    onClick,
}: ControlIconButtonProps): JSX.Element {
    return <ButtonIcon onClick={onClick}>{icon}</ButtonIcon>;
}

export default ControlIconButton;
