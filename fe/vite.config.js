import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sveltekit(),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	optimizeDeps: {
        exclude: ['@babylonjs/havok'],
    },
	server:{
		open: true,
		port: 8080,
		host:'0.0.0.0',
		proxy:{
			'/api': "http://localhost:6167",
			"/msg":{
				target: "ws://localhost:6167",
				ws: true
			}
		},
	},
	esbuild: {
		drop: ['console', 'debugger'],
	},
});
