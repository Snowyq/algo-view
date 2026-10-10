import type { MouseEventHandler, ReactNode } from "react";
import { JSX } from "react";
import ButtonIcon from "../../ui/ButtonIcon";
type ControlIconButtonProps = {
    icon: ReactNode;
    label: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
};

function ControlIconButton({
    icon,
    label,
    onClick,
}: ControlIconButtonProps): JSX.Element {
    return (
        <ButtonIcon
            onClick={onClick}
            aria-label={label}
            title={label}
            size="1.8rem"
            padding="1.1rem"
        >
            {icon}
        </ButtonIcon>
    );
}

export default ControlIconButton;
