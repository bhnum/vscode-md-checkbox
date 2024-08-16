import { context } from 'esbuild';
import esbuildPluginCopyWatch from 'esbuild-plugin-copy-watch';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
    name: 'esbuild-problem-matcher',

    setup(build) {
        build.onStart(() => {
            console.log('[watch] build started');
        });
        build.onEnd((result) => {
            result.errors.forEach(({ text, location }) => {
                console.error(`✘ [ERROR] ${text}`);
                console.error(
                    `    ${location.file}:${location.line}:${location.column}:`
                );
            });
            console.log('[watch] build finished');
        });
    },
};

const ctx = await context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: [
        esbuildPluginTsc({
            force: true,
        }),
        esbuildPluginCopyWatch({
            paths: [{ from: 'src/preview/preview.js', to: '' }],
        }),
        /* add to the end of plugins array */
        esbuildProblemMatcherPlugin,
    ],
});

if (watch) {
    await ctx.watch();
} else {
    await ctx.rebuild();
    await ctx.dispose();
}
