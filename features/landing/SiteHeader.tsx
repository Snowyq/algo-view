import Link from "next/link";
import { JSX, useEffect, useState } from "react";
import styled from "styled-components";
import PixelButton from "../play/pixel/primitives/PixelButton";
import PixelIcon from "../play/pixel/primitives/PixelIcon";
import { labelText } from "../play/pixel/primitives/pixel";
import PixelLogo from "../play/pixel/toolbar/PixelLogo";

const Bar = styled.header`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 2.4rem;
    height: 6.4rem;
    padding: 0 clamp(1.6rem, 3vw, 3.2rem);
    transition: background-color 160ms steps(3);

    &[data-solid="true"] {
        background-color: var(--bg-2);
        box-shadow: 0 2px 0 0 var(--line);
    }
`;

const Home = styled(Link)`
    display: inline-flex;
    color: var(--fg);
`;

const Nav = styled.nav`
    display: flex;
    gap: 0.4rem;
    margin-left: auto;

    a {
        position: relative;
        display: inline-flex;
        align-items: center;
        height: 3.6rem;
        padding: 0 1.2rem;
        ${labelText};
        color: var(--fg-3);
    }
    a::before {
        content: "";
        position: absolute;
        left: 0.2rem;
        top: 50%;
        width: 0.6rem;
        height: 0.6rem;
        margin-top: -0.3rem;
        background-color: var(--accent);
        transform: scale(0);
        transition: transform 120ms steps(2);
    }
    @media (hover: hover) {
        a:hover {
            color: var(--fg);
        }
        a:hover::before {
            transform: scale(1);
        }
    }

    @media (max-width: 860px) {
        display: none;
    }
`;

const Cta = styled(PixelButton)`
    @media (max-width: 860px) {
        margin-left: auto;
    }
`;

const LINKS = [
    { href: "#how", label: "How it reads" },
    { href: "#algorithms", label: "Algorithms" },
    { href: "#pace", label: "Pace" },
    { href: "#log", label: "Build log" },
];

function SiteHeader(): JSX.Element {
    const [solid, setSolid] = useState<boolean>(false);

    useEffect(() => {
        const onScroll = (): void => setSolid(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <Bar data-solid={solid} data-site-header>
            <Home href="/" aria-label="Algo View home">
                <PixelLogo scale={3} />
            </Home>
            <Nav aria-label="Sections">
                {LINKS.map((link) => (
                    <a key={link.href} href={link.href}>
                        {link.label}
                    </a>
                ))}
            </Nav>
            <Cta as={Link} href="/play" $variant="primary" $size="sm">
                Open playground
                <PixelIcon name="stepFwd" scale={1} />
            </Cta>
        </Bar>
    );
}

export default SiteHeader;
