/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
	root: __dirname,
	cacheDir: '../../node_modules/.vite/apps/mnv-autos-clientes-ng',
	plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],

	test: {
		name: 'mnv-autos-clientes-ng',
		watch: false,
		globals: true,
		environment: 'jsdom',
		include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		setupFiles: ['src/test-setup.ts'],
		server: {
			deps: {
				inline: ['@baloise/ds-angular', '@baloise/ds-core', '@stencil/core']
			}
		},
		reporters: ['default'],

		coverage: {
			provider: 'v8',
			reportsDirectory: '../../coverage/apps/mnv-autos-clientes-ng',
			reporter: ['text', 'lcov', 'json'], // text: muestra tabla en terminal, lcov: para Sonar
			lines: 1,
			functions: 1,
			branches: 1
		}
	}
}));
