import { css, styled } from "styled-components";
import { NavLink } from "react-router-dom";

const types = {
	base: css`
		&:hover {
			color: var(--color-grey-800);
		}

		&:active,
		&.active:link,
		&.active:visited {
			color: var(--color-grey-800);
			background-color: var(--color-grey-100);
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
			background-color: var(--color-grey-600);
			color: var(--color-brand-50);
			font-weight: bold;
		}

		&:hover {
			background-color: var(--color-grey-700);
		}
		&:active,
		&.active:link,
		&.active:visited {
			/* background-color: var(--color-brand-300);
			border-color: var(--color-brand-500); */
		}
	`,
};

const StyledNavLink = styled(NavLink)`
	&:link,
	&:visited {
		position: relative;
		padding: 0.4rem 1.2rem;
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

	${props => types[props.styleType] || types["base"]}
`;

const Nav = styled.nav`
	display: flex;
	gap: 2.4rem;
	font-size: 1.8rem;
	justify-content: center;
	align-items: center;
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
