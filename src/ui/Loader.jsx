import { LuLoaderCircle } from "react-icons/lu";
import styled from "styled-components";

const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	font-size: ${({ size }) => size || "2rem"};
	animation: spin 2s linear infinite;

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
`;

function Loader({ size }) {
	return (
		<Container size={size}>
			<LuLoaderCircle />
		</Container>
	);
}

export default Loader;
