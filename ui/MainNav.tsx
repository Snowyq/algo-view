"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JSX } from "react";
import { BsLayoutSidebarReverse, BsX } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { css, styled } from "styled-components";
import { NAV_BREAKPOINT } from "../constants/breakpoints";
import { getSidebarOpen, toggleSidebar } from "../features/play/playSlice";
import type { AppDispatch, RootState } from "../store";
import ButtonIcon from "./ButtonIcon";

type NavLinkStyle = "default" | "cta";

const types: Record<NavLinkStyle, ReturnType<typeof css>> = {
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

const StyledNavLink = styled(Link)<{ $styleType?: NavLinkStyle }>`
    &:link,
    &:visited {
        position: relative;
        padding: 0.2rem 1.2rem;
        border: 0.3rem solid transparent;
        border-radius: 3rem;
    }

    ${({ $styleType }) => types[$styleType || "default"]};
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
    justify-content: center;
    align-items: center;

    @media screen and (min-width: ${NAV_BREAKPOINT}) {
        display: flex;
    }
`;

function MainNav(): JSX.Element {
    const pathname: string = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const isSidebarOpen = useSelector<RootState, boolean>(getSidebarOpen);
    const isActive = (href: string): boolean => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };
    const isPlayRoute: boolean = pathname.startsWith("/play");

    const handleToggleSidebar = (): void => {
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
                            {isSidebarOpen ? (
                                <BsX />
                            ) : (
                                <BsLayoutSidebarReverse />
                            )}
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
