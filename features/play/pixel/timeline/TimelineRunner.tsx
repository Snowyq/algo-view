import gsap from "gsap";
import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled, { css, keyframes } from "styled-components";
import useReducedMotion from "../../../../hooks/useReducedMotion";
import type { RootState } from "../../../../store";
import {
    getActiveAlgorithms,
    getAnimationStatus,
    getCurrentSpeed,
    getMaxStep,
    getStep,
    type ActiveAlgorithm,
} from "../../playSlice";
import { useFx } from "../fx/fxStore";
import { pixelBurst } from "../fx/pixelBurst";
import { ANIMALS, type AnimalId } from "../sprites/animals";
import { CANVAS_H, CANVAS_W, type SpriteState } from "../sprites/frames";
import PixelSprite from "../sprites/PixelSprite";
import { animalForSpeed } from "../sprites/speedAnimals";
import { COMPACT } from "../media";
import Parade from "./Parade";
import { useWidth } from "../../../../hooks/useWidth";

const SCALE = 3;
const SPRITE_W = CANVAS_W * SCALE;
const SPRITE_H = CANVAS_H * SCALE;
const SIT_AFTER = 6000;
const SLEEP_AFTER = 20000;
const DONE_FOR = 1400;

const Lane = styled.div`
    position: relative;
    height: ${SPRITE_H}px;
    margin-bottom: -2px;
    pointer-events: none;

    @media ${COMPACT} {
        height: ${Math.round((SPRITE_H * 2) / 3)}px;
    }
`;

const Mover = styled.div`
    position: absolute;
    left: 0;
    bottom: 0;
    width: ${SPRITE_W}px;
    height: ${SPRITE_H}px;
    will-change: transform;

    /* "scale", not transform, so GSAP's translate is left alone. */
    @media ${COMPACT} {
        scale: 0.67;
        transform-origin: 50% 100%;
    }
`;

const somersault = keyframes`
    0% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-12px) rotate(90deg); }
    50% { transform: translateY(-18px) rotate(180deg); }
    75% { transform: translateY(-12px) rotate(270deg); }
    100% { transform: translateY(0) rotate(360deg); }
`;

const Body = styled.div<{ $flip: boolean }>`
    width: 100%;
    height: 100%;
    pointer-events: auto;
    cursor: pointer;
    transform-origin: 50% 70%;

    ${({ $flip }) =>
        $flip &&
        css`
            animation: ${somersault} 640ms steps(8) both;
        `}
`;

const Trail = styled.div`
    position: absolute;
    left: 0;
    bottom: -1px;
    height: 3px;
    width: 1px;
    transform-origin: left;
    background-image: repeating-linear-gradient(
        90deg,
        rgba(244, 194, 166, 0.55) 0 4px,
        transparent 4px 6px
    );
`;

const rise = keyframes`
    0% { transform: translate(0, 0); opacity: 1; }
    100% { transform: translate(8px, -20px); opacity: 0; }
`;

const puff = keyframes`
    0% { transform: translate(0, 0) scale(1); opacity: 1; }
    60% { opacity: 1; }
    100% { transform: translate(-18px, -6px) scale(0.5); opacity: 0; }
`;

/* Dust behind fast runners. */
const Dust = styled.span`
    position: absolute;
    left: 8px;
    bottom: 0;
    pointer-events: none;

    i {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 4px;
        height: 4px;
        background-color: var(--fg-3);
        animation: ${puff} 0.42s steps(4) infinite;
    }
    i:nth-child(2) {
        left: 6px;
        width: 2px;
        height: 2px;
        animation-delay: 0.14s;
    }
    i:nth-child(3) {
        left: 2px;
        animation-delay: 0.28s;
        background-color: var(--line-2);
    }
`;

/* Speed lines trailing the cheetah. */
const lines = keyframes`
    0% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(-10px); opacity: 0; }
`;

const SpeedLines = styled.span`
    position: absolute;
    left: -14px;
    top: 45%;
    pointer-events: none;

    i {
        display: block;
        height: 2px;
        margin-bottom: 4px;
        background-color: var(--fg-3);
        animation: ${lines} 0.24s steps(3) infinite;
    }
    i:nth-child(1) {
        width: 10px;
    }
    i:nth-child(2) {
        width: 14px;
        margin-left: -4px;
        animation-delay: 0.08s;
    }
    i:nth-child(3) {
        width: 8px;
        animation-delay: 0.16s;
    }
`;

const Zzz = styled.span`
    position: absolute;
    right: 0.2rem;
    top: -0.4rem;
    display: flex;
    gap: 2px;
    font-family: var(--f-label);
    font-size: 1.1rem;
    color: var(--fg-3);

    span {
        animation: ${rise} 2.4s steps(6) infinite;
    }
    span:nth-child(2) {
        animation-delay: 0.8s;
        font-size: 0.9rem;
    }
    span:nth-child(3) {
        animation-delay: 1.6s;
        font-size: 0.8rem;
    }
`;

type RestPhase = "idle" | "sit" | "sleep" | "done";

function TimelineRunner(): JSX.Element {
    const speed = useSelector<RootState, number>(getCurrentSpeed);
    const status = useSelector<RootState, string>(getAnimationStatus);
    const { value: step } = useSelector<RootState, { value: number }>(getStep);
    const maxStep = useSelector<RootState, number>(getMaxStep);
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const scrubbing = useFx((fx) => fx.scrubbing);
    const introDone = useFx((fx) => fx.introDone);
    const paradeAt = useFx((fx) => fx.paradeAt);
    const reduced = useReducedMotion();

    const laneRef = useRef<HTMLDivElement | null>(null);
    const moverRef = useRef<HTMLDivElement | null>(null);
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const trailRef = useRef<HTMLDivElement | null>(null);
    const proxy = useRef<{ x: number }>({ x: -SPRITE_W });
    const entered = useRef<boolean>(false);
    const width = useWidth(laneRef);
    const [facingLeft, setFacingLeft] = useState<boolean>(false);

    const targetAnimal = animalForSpeed(speed);
    const [animal, setAnimal] = useState<AnimalId>(targetAnimal);
    const [rest, setRest] = useState<RestPhase>("idle");
    const [trick, setTrick] = useState<"flip" | "hide" | null>(null);
    const clicks = useRef<number[]>([]);

    const playing = status === "playing";
    const atEnd = maxStep > 0 && step >= maxStep;
    const sleepSortOpen = active.some((algo) => algo.id === "sleepSort");

    const apply = useCallback((): void => {
        const x = Math.round(proxy.current.x / 2) * 2;
        if (moverRef.current) {
            moverRef.current.style.transform = `translateX(${x}px)`;
        }
        if (trailRef.current) {
            trailRef.current.style.transform = `scaleX(${Math.max(0, x + SPRITE_W / 2)})`;
        }
    }, []);

    const targetX = (): number => {
        const ratio = maxStep > 0 ? Math.min(1, step / maxStep) : 0;
        return Math.min(
            Math.max(0, ratio * width - SPRITE_W / 2),
            Math.max(0, width - SPRITE_W)
        );
    };

    useEffect(() => {
        if (width === 0) return;
        const to = targetX();
        // First appearance: run in from the left once the intro is gone.
        if (!entered.current) {
            if (!introDone) {
                proxy.current.x = reduced ? to : -SPRITE_W;
                apply();
                return;
            }
            entered.current = true;
            if (reduced) {
                proxy.current.x = to;
                apply();
                return;
            }
            gsap.to(proxy.current, {
                x: to,
                duration: 0.9,
                ease: "steps(14)",
                onUpdate: apply,
            });
            return;
        }
        const from = proxy.current.x;
        if (Math.abs(to - from) >= 2) setFacingLeft(to < from);
        gsap.to(proxy.current, {
            x: to,
            duration: reduced ? 0 : 0.12,
            ease: "none",
            overwrite: true,
            onUpdate: apply,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step, maxStep, width, introDone, reduced, apply]);

    // Face forward again whenever playback runs.
    useEffect(() => {
        if (playing) setFacingLeft(false);
    }, [playing]);

    // Rest phases: idle, then sit, then sleep; a finish hop first at the end.

    const prevPlaying = useRef<boolean>(playing);
    useEffect(() => {
        const wasPlaying = prevPlaying.current;
        prevPlaying.current = playing;
        if (playing || scrubbing) return;

        const timers: ReturnType<typeof setTimeout>[] = [];
        const after = (ms: number, phase: RestPhase): void => {
            timers.push(setTimeout(() => setRest(phase), ms));
        };

        if (wasPlaying && atEnd) {
            setRest("done");
            const lane = laneRef.current;
            if (lane) {
                pixelBurst(lane, {
                    x: proxy.current.x + SPRITE_W / 2,
                    y: SPRITE_H * 0.4,
                });
            }
            after(DONE_FOR, "idle");
            after(DONE_FOR + SIT_AFTER, "sit");
            after(DONE_FOR + SLEEP_AFTER, "sleep");
        } else if (sleepSortOpen) {
            setRest("sleep");
        } else {
            setRest("idle");
            after(SIT_AFTER, "sit");
            after(SLEEP_AFTER, "sleep");
        }
        return () => timers.forEach(clearTimeout);
    }, [playing, scrubbing, atEnd, sleepSortOpen, step]);

    // Speed change: the old animal squashes out, the new one pops in.

    useEffect(() => {
        if (targetAnimal === animal) return;
        const body = bodyRef.current;
        if (reduced || !body) {
            setAnimal(targetAnimal);
            return;
        }
        const lane = laneRef.current;
        const tl = gsap.timeline();
        tl.to(body, {
            scaleY: 0,
            scaleX: 1.3,
            duration: 0.12,
            ease: "steps(3)",
        })
            .add(() => {
                setAnimal(targetAnimal);
                if (lane) {
                    pixelBurst(lane, {
                        x: proxy.current.x + SPRITE_W / 2,
                        y: SPRITE_H - 6,
                        count: 8,
                        colors: ["#f4ede0", "#a99d8a"],
                        duration: 360,
                    });
                }
            })
            .to(body, {
                scaleY: 1,
                scaleX: 1,
                duration: 0.15,
                ease: "steps(3)",
            });
        return () => {
            tl.kill();
            gsap.set(body, { scaleX: 1, scaleY: 1 });
        };
    }, [targetAnimal, animal, reduced]);

    // Five quick clicks: the animal's trick.

    const handleClick = (): void => {
        const now = performance.now();
        clicks.current = [...clicks.current.filter((t) => now - t < 1500), now];
        if (clicks.current.length < 5 || trick) return;
        clicks.current = [];
        const kind = ANIMALS[animal].trick;
        setTrick(kind);
        setTimeout(() => setTrick(null), kind === "hide" ? 1800 : 700);
    };

    let state: SpriteState;
    if (trick === "hide") state = "hide";
    else if (scrubbing) state = "dragged";
    else if (playing) state = "run";
    else state = rest;

    // A runner that has not entered yet runs in.
    if (!entered.current && introDone && !reduced) state = "run";

    const isSnail = animal === "snail";

    return (
        <Lane ref={laneRef} aria-hidden="true">
            {isSnail && <Trail ref={trailRef} />}
            <Mover ref={moverRef}>
                <Body
                    ref={bodyRef}
                    $flip={trick === "flip"}
                    onClick={handleClick}
                >
                    <PixelSprite
                        animal={animal}
                        state={state}
                        scale={SCALE}
                        flip={facingLeft && !playing}
                    />
                </Body>
                {state === "run" && playing && ANIMALS[animal].dusty && (
                    <Dust aria-hidden="true">
                        <i />
                        <i />
                        <i />
                    </Dust>
                )}
                {state === "run" && playing && animal === "cheetah" && (
                    <SpeedLines aria-hidden="true">
                        <i />
                        <i />
                        <i />
                    </SpeedLines>
                )}
                {state === "sleep" && (
                    <Zzz>
                        <span>z</span>
                        <span>z</span>
                        <span>z</span>
                    </Zzz>
                )}
            </Mover>
            {paradeAt > 0 && <Parade key={paradeAt} width={width} />}
        </Lane>
    );
}

export default TimelineRunner;
