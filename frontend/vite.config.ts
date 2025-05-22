import { defineConfig } from "vite";
import svgr from 'vite-plugin-svgr'
import UnpluginTypia from '@ryoppippi/unplugin-typia/vite'

export default defineConfig(() => {
    return {
        build: {
            outDir: 'build', 
        },
        plugins: [UnpluginTypia(),
        svgr()],
        server: {
            port: 3000
        }
    }
}) 