"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsLayoutSidebarReverse } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { css, styled } from "styled-components";
import { NAV_BREAKPOINT } from "../constants/breakpoints";
import { getSidebarOpen, toggleSidebar } from "../features/play/playSlice";
import ButtonIcon from "./ButtonIcon";

const types = {
    default: css`
        &:hover {
            color: var(--color-grey-800);
            background-color: var(--color-grey-100);
        }

        &:active,
        &[data-active="true"],
        &[data-active="true"]:link,
        &[data-active="true"]:visited {
            color: var(--color-grey-800);
            text-decoration: underline;
        }

        & svg {
            width: 2.4rem;
            height: 2.4rem;
            color: var(--color-grey-400);
            /* transition: all 0.3s; */
        }

        &:hover svg,
        &:active svg,
        &[data-active="true"] svg,
        &[data-active="true"]:link svg,
        &[data-active="true"]:visited svg {
            color: var(--color-brand-600);
        }
    `,
    cta: css`
        &:link,
        &:visited {
            background-color: var(--color-grey-700);
            color: var(--color-brand-50);
            font-weight: bold;
        }

        &:hover {
            background-color: var(--color-grey-500);
        }
        &:active,
        &[data-active="true"],
        &[data-active="true"]:link,
        &[data-active="true"]:visited {
            background-color: var(--color-grey-700);
            text-decoration: underline;
        }
    `,
};

const StyledNavLink = styled(Link)`
    /* transition:
		background-color 0.2s,
		box-shadow 0.2s; */

    &:link,
    &:visited {
        position: relative;
        padding: 0.2rem 1.2rem;
        border: 0.3rem solid transparent;
        border-radius: 3rem;
    }

    &:active,
    &[data-active="true"],
    &[data-active="true"]:link,
    &[data-active="true"]:visited {
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

    ${({ $styleType }) => types[$styleType] || types["default"]};
`;

const MobileLink = styled(StyledNavLink)`
    &:link,
    &:visited {
        padding: 0.2rem 0.6rem;
    }
`;

const NavContainer = styled.header`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const MobileNav = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;

    @media screen and (min-width: ${NAV_BREAKPOINT}) {
        display: none;
    }
`;

const Nav = styled.nav`
    display: none;
    gap: 2.4rem;
    /* font-size: 1.6rem; */
    justify-content: center;
    align-items: center;

    @media screen and (min-width: ${NAV_BREAKPOINT}) {
        display: flex;
    }
`;

function MainNav() {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const isSidebarOpen = useSelector(getSidebarOpen);
    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };
    const isPlayRoute = pathname?.startsWith("/play");

    const handleToggleSidebar = () => {
        dispatch(toggleSidebar());
    };

    return (
        <NavContainer>
            <MobileNav>
                {isPlayRoute ? (
                    <>
                        <MobileLink
                            href="/"
                            data-active={isActive("/") ? "true" : "false"}
                        >
                            About
                        </MobileLink>
                        <ButtonIcon
                            aria-label={
                                isSidebarOpen ? "Hide sidebar" : "Show sidebar"
                            }
                            onClick={handleToggleSidebar}
                        >
                            <BsLayoutSidebarReverse />
                        </ButtonIcon>
                    </>
                ) : (
                    <MobileLink
                        href="/play"
                        $styleType="cta"
                        data-active={isActive("/play") ? "true" : "false"}
                    >
                        Playground
                    </MobileLink>
                )}
            </MobileNav>
            <Nav>
                <StyledNavLink
                    href="/"
                    data-active={isActive("/") ? "true" : "false"}
                >
                    About
                </StyledNavLink>
                <StyledNavLink
                    href="/play"
                    $styleType="cta"
                    data-active={isActive("/play") ? "true" : "false"}
                >
                    Playground
                </StyledNavLink>
            </Nav>
        </NavContainer>
    );
}

export default MainNav;
