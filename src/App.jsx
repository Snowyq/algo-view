import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlobalStyles from "./styles/GlobalStyles";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import styled from "styled-components";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
		},
	},
});
const H1 = styled.h1`
	background-color: black;
`;

function Index() {
	return <H1>Home</H1>;
}

function AppLayout() {
	return (
		<>
			<Outlet />
			<p>AppLayout</p>
		</>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} />
			<GlobalStyles />

			<BrowserRouter>
				<Routes>
					<Route element={<AppLayout />}>
						<Route index element={<Index />} />
						<Route path="play/:id" element={<p>play</p>} />
						<Route path="algorithms">
							<Route path="sort/:id" />
							<Route path="graph/:id" />
							<Route path="tree/:id" />
						</Route>
						<Route element={<AppLayout />}></Route>
					</Route>
				</Routes>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default App;
