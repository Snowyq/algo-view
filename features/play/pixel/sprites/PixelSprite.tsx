import { JSX, memo, useEffect, useRef, useState } from "react";
import useReducedMotion from "../../../../hooks/useReducedMotion";
import { PALETTE, type AnimalId } from "./animals";
import {
    CANVAS_H,
    CANVAS_W,
    getClip,
    SPRITE_TOP,
    type SpriteFrame,
    type SpriteState,
} from "./frames";
import { subscribeTick } from "./spriteTicker";

type PixelSpriteProps = {
    animal: AnimalId;
    state?: SpriteState;
    /** Screen pixels per sprite pixel. */
    scale?: number;
    /** Multiplies the clip's frame rate. */
    tempo?: number;
    /** Mirror horizontally (face left). */
    flip?: boolean;
    className?: string;
    label?: string;
};

function drawFrame(
    ctx: CanvasRenderingContext2D,
    frame: SpriteFrame,
    flip: boolean
): void {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    frame.grid.forEach((row, y) => {
        for (let x = 0; x < row.length; x += 1) {
            const cell = row[x];
            if (cell === ".") continue;
            ctx.fillStyle = PALETTE[cell] ?? PALETTE.o;
            const drawX = flip ? CANVAS_W - 2 - x : x + 1;
            ctx.fillRect(drawX, y + SPRITE_TOP + frame.dy, 1, 1);
        }
    });
}

/* Native-size canvas scaled by CSS; animates only on screen, never when reduced. */
function PixelSprite({
    animal,
    state = "idle",
    scale = 3,
    tempo = 1,
    flip = false,
    className,
    label,
}: PixelSpriteProps): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const reduced = useReducedMotion();
    const [visible, setVisible] = useState<boolean>(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const observer = new IntersectionObserver(([entry]) =>
            setVisible(entry.isIntersecting)
        );
        observer.observe(canvas);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;
        const clip = getClip(animal, state);
        drawFrame(ctx, clip.frames[0], flip);
        if (reduced || !visible || clip.frames.length < 2) {
            if (!clip.loop && reduced) {
                drawFrame(ctx, clip.frames[clip.frames.length - 1], flip);
            }
            return;
        }

        const start = performance.now();
        const fps = clip.fps * tempo;
        let last = 0;
        return subscribeTick((now) => {
            // rAF timestamps can predate `start` by up to a frame.
            let index = Math.max(0, Math.floor(((now - start) / 1000) * fps));
            if (clip.loop) index %= clip.frames.length;
            else index = Math.min(index, clip.frames.length - 1);
            if (index === last) return;
            last = index;
            drawFrame(ctx, clip.frames[index], flip);
        });
    }, [animal, state, tempo, flip, reduced, visible]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            width={CANVAS_W}
            height={CANVAS_H}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            style={{
                width: CANVAS_W * scale,
                height: CANVAS_H * scale,
                imageRendering: "pixelated",
                display: "block",
            }}
        />
    );
}

export default memo(PixelSprite);
