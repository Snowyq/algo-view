import { memo } from "react";
import styled, { css } from "styled-components";

const Placeholder = styled.span`
    opacity: 0;
`;

const Text = styled.span`
    display: ${({ show }) => (show === "show" ? "block" : "none")};
    position: absolute;
    left: 0;
    top: 0;
`;

const initStates = {
    appear: css`
        opacity: 0;
    `,
};

const Letter = styled.span`
    animation-name: ${({ name }) => name};
    animation-duration: ${({ duration }) => duration}s;
    animation-delay: ${({ delay }) => delay}s;
    animation-fill-mode: ${({ $fillMode }) => $fillMode};
    ${({ name }) => initStates[name]}
`;

const Container = styled.span`
    position: relative;
    @keyframes appear {
        0% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }
    }
`;

const MemoLetters = memo(Letters);

function AnimatedText({
    children,
    show,
    animation: name = "appear",
    delay = 0.1,
    delayOnChar = 0.1,
    duration = 0.1,
    fillMode = "forwards",
}) {
    return (
        <Container>
            <Placeholder>{children}</Placeholder>
            <Text show={show ? "show" : "hide"}>
                <MemoLetters
                    initDelay={delay}
                    text={children}
                    delay={delayOnChar}
                    duration={duration}
                    name={name}
                    fillMode={fillMode}
                />
            </Text>
        </Container>
    );
}

function Letters({ text, delay, duration, name, initDelay, fillMode }) {
    return (
        <>
            {text.split("").map((char, index) => {
                return (
                    <Letter
                        key={index}
                        delay={index * delay + initDelay}
                        duration={duration}
                        name={name}
                        $fillMode={fillMode}
                    >
                        {char}
                    </Letter>
                );
            })}
        </>
    );
}

export default memo(AnimatedText);
