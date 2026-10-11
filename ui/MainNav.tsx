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
        &:link,
        &:visited {
            color: var(--text-muted);
        }

        &::after {
            content: "";
            position: absolute;
            left: 1.2rem;
            right: 1.2rem;
            bottom: 0.2rem;
            height: 2px;
            border-radius: 2px;
            background-color: var(--finish);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform var(--dur-base) var(--ease-out);
        }

        &:hover {
            color: var(--text);
        }

        &[data-active="true"],
        &[data-active="true"]:link,
        &[data-active="true"]:visited {
            color: var(--text);
        }

        &[data-active="true"]::after {
            transform: scaleX(1);
        }

        @media (prefers-reduced-motion: reduce) {
            &::after {
                transition: none;
            }
        }
    `,
    cta: css`
        &:link,
        &:visited {
            color: var(--ink-950);
            background-color: var(--swap);
            font-weight: 600;
        }

        &:hover {
            background-color: var(--swap-strong);
        }

        &[data-active="true"],
        &[data-active="true"]:link,
        &[data-active="true"]:visited {
            color: var(--ink-950);
            background-color: var(--finish);
        }
    `,
};

const StyledNavLink = styled(Link)<{ $styleType?: NavLinkStyle }>`
    &:link,
    &:visited {
        position: relative;
        display: inline-flex;
        align-items: center;
        height: 3.6rem;
        padding: 0 1.2rem;
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
        font-weight: 500;
        letter-spacing: 0.01em;
        transition:
            color var(--dur-fast) var(--ease-out),
            background-color var(--dur-fast) var(--ease-out);
    }

    ${({ $styleType }) => types[$styleType || "default"]};
`;

const MobileLink = styled(StyledNavLink)`
    &:link,
    &:visited {
        padding: 0 1rem;
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
    gap: var(--space-2);
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
