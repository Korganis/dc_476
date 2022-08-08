// @ts-nocheck

import { defineConfig, UserConfig } from "vite";
import replace from '@rollup/plugin-replace';

export default defineConfig(({ mode }) => {
    let config: UserConfig = {
        root: 'src',
        base: '',
        server: {
            port: 8000,
            open: true
        },
        build: {
            emptyOutDir: true,
            target: 'esnext',
            minify: false,
            rollupOptions: {
                input: {
                    'index': './src/index.html',
                },
                output: {
                    chunkFileNames: `assets/js/[name].js`,
                    entryFileNames: `assets/js/[name].js`,
                    assetFileNames: `assets/css/[name].css`
                },
            },
            outDir: '../dist'
        },
        publicDir: '../public',
        plugins: [
        ],
        resolve: {
            alias: {
                '@': './',
            },
        }
    };

    if (mode === 'development') {
        config.build.sourcemap = 'inline';
        config.build.minify = false;
    } else {
        config.plugins = [
            ...config.plugins,
            replace({
                // This makes sure that DEBUG (Game.ts) is always false when building for production
                values: {
                    DEBUG: () => false
                },
                preventAssignment: true
            }),
        ];
    }

    return config;

});
