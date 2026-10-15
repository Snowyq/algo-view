import gsap from "gsap";
import { JSX, useMemo, useRef } from "react";
import useReducedMotion from "../../../../hooks/useReducedMotion";

/* 5-row bitmap font, only the letters the wordmark needs. */
const GLYPHS: Record<string, string[]> = {
    A: [".###.", "#...#", "#####", "#...#", "#...#"],
    L: ["#...", "#...", "#...", "#...", "####"],
    G: [".####", "#....", "#..##", "#...#", ".###."],
    O: [".###.", "#...#", "#...#", "#...#", ".###."],
    V: ["#...#", "#...#", "#...#", ".#.#.", "..#.."],
    I: ["###", ".#.", ".#.", ".#.", "###"],
    E: ["####", "#...", "###.", "#...", "####"],
    W: ["#...#", "#...#", "#.#.#", "##.##", "#...#"],
    " ": ["..", "..", "..", "..", ".."],
};

export type LogoPixel = { x: number; y: number; accent: boolean };

/* Lays the word out as a list of pixels; the dot between words is accent. */
export function layoutWord(word: string): {
    pixels: LogoPixel[];
    width: number;
} {
    const pixels: LogoPixel[] = [];
    let cursor = 0;
    for (const char of word) {
        if (char === "·") {
            pixels.push({ x: cursor, y: 2, accent: true });
            cursor += 2;
            continue;
        }
        const glyph = GLYPHS[char] ?? GLYPHS[" "];
        glyph.forEach((row, y) => {
            for (let x = 0; x < row.length; x += 1) {
                if (row[x] === "#")
                    pixels.push({ x: cursor + x, y, accent: false });
            }
        });
        cursor += glyph[0].length + 1;
    }
    return { pixels, width: cursor - 1 };
}

type PixelLogoProps = {
    scale?: number;
    /** Scatter-and-reassemble on hover (easter egg). */
    playful?: boolean;
    className?: string;
};

function PixelLogo({
    scale = 3,
    playful = true,
    className,
}: PixelLogoProps): JSX.Element {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const busy = useRef<boolean>(false);
    const reduced = useReducedMotion();
    const { pixels, width } = useMemo(() => layoutWord("ALGO·VIEW"), []);

    const scatter = (): void => {
        const svg = svgRef.current;
        if (!svg || busy.current || reduced || !playful) return;
        busy.current = true;
        const rects = svg.querySelectorAll("rect");
        gsap.timeline({ onComplete: () => void (busy.current = false) })
            .to(rects, {
                x: () => gsap.utils.random(-3, 3, 1),
                y: () => gsap.utils.random(-3, 3, 1),
                duration: 0.16,
                ease: "steps(2)",
                stagger: { each: 0.004, from: "random" },
            })
            .to(rects, {
                x: 0,
                y: 0,
                duration: 0.24,
                ease: "steps(3)",
                stagger: { each: 0.004, from: "random" },
            });
    };

    return (
        <svg
            ref={svgRef}
            data-pixel
            className={className}
            width={width * scale}
            height={5 * scale}
            viewBox={`0 0 ${width} 5`}
            overflow="visible"
            aria-hidden="true"
            onPointerEnter={scatter}
        >
            {pixels.map((pixel, index) => (
                <rect
                    key={index}
                    x={pixel.x}
                    y={pixel.y}
                    width={1}
                    height={1}
                    fill={pixel.accent ? "var(--accent)" : "currentColor"}
                    data-logo-px
                />
            ))}
        </svg>
    );
}

export default PixelLogo;
