import gsap from "gsap";
import { JSX, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { CANVAS_W } from "../sprites/frames";
import PixelSprite from "../sprites/PixelSprite";
import { ANIMAL_ORDER } from "../sprites/speedAnimals";

const SCALE = 2;
const W = CANVAS_W * SCALE;

const Walker = styled.div`
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateX(-${W}px);
`;

/* Konami reward: every speed animal crosses the lane, fastest first. */
function Parade({ width }: { width: number }): JSX.Element {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const walkers = Array.from(root.children) as HTMLElement[];
        const ctx = gsap.context(() => {
            walkers.forEach((el, index) => {
                gsap.fromTo(
                    el,
                    { x: -W },
                    {
                        x: width + W,
                        duration: 1.6 + index * 0.45,
                        delay: index * 0.18,
                        ease: `steps(${Math.round(24 + index * 6)})`,
                    }
                );
            });
        }, root);
        return () => ctx.revert();
    }, [width]);

    return (
        <div ref={rootRef}>
            {ANIMAL_ORDER.map((id) => (
                <Walker key={id}>
                    <PixelSprite animal={id} state="run" scale={SCALE} />
                </Walker>
            ))}
        </div>
    );
}

export default Parade;
