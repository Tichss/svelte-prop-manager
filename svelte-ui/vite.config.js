import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [svelte(), viteSingleFile({ removeViteModuleLoader: true })],
    build: {
        outDir: path.resolve(__dirname, '../media'),
        emptyOutDir: true,
    },
});
//# sourceMappingURL=vite.config.js.map