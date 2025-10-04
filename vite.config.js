import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
	plugins: [react(), mkcert()],
	server: {
		host: true, // binds to 0.0.0.0, allows LAN access
		port: 5173,
		strictPort: true,

		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	},
});
