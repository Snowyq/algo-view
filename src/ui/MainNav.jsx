import { css, styled } from "styled-components";
import { NavLink } from "react-router-dom";

const types = {
	default: css`
		&:hover {
			color: var(--color-grey-800);
			background-color: var(--color-grey-100);
		}

		&:active,
		&.active:link,
		&.active:visited {
			color: var(--color-grey-800);
			background-color: var(--color-grey-100);
			box-shadow: inset 0.1rem 0.1rem 0 1px var(--color-grey-700);
		}

		& svg {
			width: 2.4rem;
			height: 2.4rem;
			color: var(--color-grey-400);
			/* transition: all 0.3s; */
		}

		&:hover svg,
		&:active svg,
		&.active:link svg,
		&.active:visited svg {
			color: var(--color-brand-600);
		}
	`,
	cta: css`
		&:link,
		&:visited {
			background-color: var(--color-grey-700);
			color: var(--color-brand-50);
			box-shadow: 0.15rem 0.15rem 0 2px var(--color-grey-700);
			font-weight: bold;
		}

		&:hover {
			background-color: var(--color-grey-500);
			box-shadow: 0.15rem 0.15rem 0 2px var(--color-grey-600);
		}
		&:active,
		&.active:link,
		&.active:visited {
			background-color: var(--color-grey-500);
			box-shadow: inset 0.15rem 0.15rem 0 2px var(--color-grey-600);
		}
	`,
};

const StyledNavLink = styled(NavLink)`
	/* transition:
		background-color 0.2s,
		box-shadow 0.2s; */

	&:link,
	&:visited {
		position: relative;
		padding: 0.2rem 0.8rem;
		border: 0.3rem solid transparent;
		border-radius: 0.5rem;
	}

	&:active,
	&.active:link,
	&.active:visited {
		/* &::after {
			content: "";
			position: absolute;
			left: -0.8rem;
			top: -0.8rem;
			bottom: -0.8rem;
			right: -0.8rem;
			border: 0.2rem solid black;
			border-radius: 0.8rem;
		} */
	}

	${props => types[props.styleType] || types["default"]}
`;

const Nav = styled.nav`
	display: none;
	gap: 2.4rem;
	/* font-size: 1.6rem; */
	justify-content: center;
	align-items: center;

	@media screen and (min-width: 640px) {
		display: flex;
	}
`;

function MainNav() {
	return (
		<Nav>
			<StyledNavLink to="/">
				<span>Home</span>
			</StyledNavLink>
			<StyledNavLink to="/algorithms">
				<span>Algorithms</span>
			</StyledNavLink>
			<StyledNavLink to="/play" styleType="cta">
				<span>Playground</span>
			</StyledNavLink>
		</Nav>
	);
}

export default MainNav;
