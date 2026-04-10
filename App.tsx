import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GlobalStyles from "./styles/GlobalStyles";
import AppLayout from "./ui/AppLayout";
import Index from "./views/Index";
import Play from "./views/Play";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} />
			<GlobalStyles />

			<BrowserRouter>
				<Routes>
					<Route element={<AppLayout />}>
						<Route index element={<Index />} />
						<Route path="play/:type?/:id?" element={<Play />} />
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
