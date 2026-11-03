import { JSX, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { RootState } from "../../../../store";
import { getActiveCategory, getSpeeds } from "../../playSlice";
import { categoryOf } from "../../categories";
import { STEP_LEGEND } from "../../stepLegend";
import { setFx, useFx } from "../fx/fxStore";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { frameShadows, labelText, pixelFrame } from "../primitives/pixel";
import { ANIMALS } from "../sprites/animals";
import PixelSprite from "../sprites/PixelSprite";
import { animalForSpeed, formatSpeed } from "../sprites/speedAnimals";

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 150;
    display: grid;
    place-items: center;
    padding: 1.6rem;
    background-color: rgba(21, 18, 15, 0.78);
    background-image: radial-gradient(var(--line) 1px, transparent 1px);
    background-size: 4px 4px;
`;

const Dialog = styled.div`
    position: relative;
    width: min(76rem, 100%);
    max-height: calc(100svh - 3.2rem);
    overflow-y: auto;
    padding: 2.4rem 2.8rem 2.8rem;
    background-color: var(--surface);
    ${pixelFrame("var(--line-2)")};
    animation: px-dither-in 180ms steps(5) both;
`;

const Close = styled.div`
    position: absolute;
    top: 1.2rem;
    right: 1.2rem;
`;

const Title = styled.h2`
    font-family: var(--f-display);
    font-size: 4.8rem;
    line-height: 0.8;
    text-transform: uppercase;
    margin-bottom: 2.4rem;
`;

const Columns = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(26rem, 1fr));
    gap: 2.4rem 3.2rem;
`;

const Heading = styled.h3`
    ${labelText};
    color: var(--fg-4);
    margin-bottom: 1.2rem;
`;

const Keys = styled.dl`
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 1rem 1.6rem;
    align-items: center;

    dt {
        display: flex;
        gap: 0.4rem;
    }
    dd {
        font-size: 1.5rem;
        color: var(--fg-2);
    }
`;

const Key = styled.kbd`
    display: inline-grid;
    place-items: center;
    min-width: 2.8rem;
    height: 2.8rem;
    padding: 0 0.6rem;
    margin: var(--b);
    background-color: var(--surface-3);
    color: var(--fg);
    ${labelText};
    box-shadow:
        ${frameShadows("var(--line-2)")},
        inset 0 -3px 0 0 rgba(0, 0, 0, 0.35);
`;

const Roster = styled.ul`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.2rem 0.8rem;

    li {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.4rem;
        ${labelText};
        font-size: 1rem;
        color: var(--fg-3);
    }
    b {
        font-weight: 400;
        color: var(--fg);
    }
`;

const Legend = styled.ul`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem 1.6rem;

    li {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        font-size: 1.4rem;
    }
`;

const Swatch = styled.span<{ $colorVar: string }>`
    width: 1.2rem;
    height: 1.6rem;
    background-color: ${({ $colorVar }) => `var(${$colorVar})`};
    box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.28);
`;

const Secret = styled.p`
    margin-top: 2.4rem;
    ${labelText};
    font-size: 1rem;
    color: var(--fg-4);
`;

const SHORTCUTS: Array<{ keys: string[]; what: string }> = [
    { keys: ["Space"], what: "Play / pause" },
    { keys: ["←", "→"], what: "Step back / forward" },
    { keys: ["⇧", "← →"], what: "Jump 10 steps" },
    { keys: ["Home", "End"], what: "First / last step" },
    { keys: ["1", "…", "9"], what: "Speed, cheetah to sloth" },
    { keys: ["G"], what: "New input, same shape" },
    { keys: ["I"], what: "Open / close the input" },
    { keys: ["E"], what: "Edit the data: draw or type your own" },
    { keys: ["?"], what: "This screen" },
];

function KeyList(): JSX.Element {
    return (
        <Keys>
            {SHORTCUTS.map((item) => (
                <div key={item.what} style={{ display: "contents" }}>
                    <dt>
                        {item.keys.map((key) => (
                            <Key key={key}>{key}</Key>
                        ))}
                    </dt>
                    <dd>{item.what}</dd>
                </div>
            ))}
        </Keys>
    );
}

function SpeedRoster(): JSX.Element {
    const speeds = useSelector<RootState, number[]>(getSpeeds);
    return (
        <Roster>
            {speeds.map((ms, index) => {
                const animal = ANIMALS[animalForSpeed(ms)];
                return (
                    <li key={ms}>
                        <PixelSprite
                            animal={animal.id}
                            state="idle"
                            scale={2}
                        />
                        <b>
                            {index + 1} · {formatSpeed(ms)}
                        </b>
                        {animal.name}
                    </li>
                );
            })}
        </Roster>
    );
}

function StepColors(): JSX.Element {
    const category = useSelector<RootState, string>(getActiveCategory);
    return (
        <Legend>
            {categoryOf(category).legend.map((type) => (
                <li key={type}>
                    <Swatch $colorVar={STEP_LEGEND[type].colorVar} />
                    {STEP_LEGEND[type].label}
                </li>
            ))}
        </Legend>
    );
}

function ShortcutsOverlay(): JSX.Element | null {
    const open = useFx((fx) => fx.helpOpen);
    const closeRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const previous = document.activeElement as HTMLElement | null;
        closeRef.current?.focus();
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "Escape") setFx({ helpOpen: false });
        };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            previous?.focus?.();
        };
    }, [open]);

    if (!open) return null;

    return (
        <Backdrop
            onClick={(event) => {
                if (event.target === event.currentTarget)
                    setFx({ helpOpen: false });
            }}
        >
            <Dialog
                role="dialog"
                aria-modal="true"
                aria-label="Keyboard shortcuts"
            >
                <Close>
                    <PixelButton
                        ref={closeRef}
                        type="button"
                        $variant="ghost"
                        $square
                        aria-label="Close"
                        onClick={() => setFx({ helpOpen: false })}
                    >
                        <PixelIcon name="close" scale={2} />
                    </PixelButton>
                </Close>
                <Title>Keys</Title>
                <Columns>
                    <section>
                        <Heading>Keyboard</Heading>
                        <KeyList />
                    </section>
                    <section>
                        <Heading>Speeds</Heading>
                        <SpeedRoster />
                    </section>
                    <section>
                        <Heading>Step colors</Heading>
                        <StepColors />
                    </section>
                </Columns>
                <Secret>Some animals have tricks. Try clicking.</Secret>
            </Dialog>
        </Backdrop>
    );
}

export default ShortcutsOverlay;
