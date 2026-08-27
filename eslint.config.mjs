import nx from '@nx/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';

export default [
	...nx.configs['flat/base'],
	...nx.configs['flat/typescript'],
	...nx.configs['flat/javascript'],
	prettierConfig,
	{
		ignores: ['**/dist', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*']
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {
			'@nx/enforce-module-boundaries': [
				'error',
				{
					enforceBuildableLibDependency: true,
					allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
					depConstraints: [
						{
							sourceTag: 'scope:app',
							onlyDependOnLibsWithTags: ['scope:features', 'scope:core', 'scope:shared', 'scope:ui']
						},
						{
							sourceTag: 'scope:features',
							onlyDependOnLibsWithTags: ['scope:data', 'scope:ui', 'scope:shared', 'scope:core']
						},
						{
							sourceTag: 'scope:data',
							onlyDependOnLibsWithTags: ['scope:shared']
						},
						{
							sourceTag: 'scope:ui',
							onlyDependOnLibsWithTags: ['scope:shared']
						},
						{
							sourceTag: 'scope:core',
							onlyDependOnLibsWithTags: ['scope:shared', 'scope:data']
						},
						{
							sourceTag: 'scope:shared',
							onlyDependOnLibsWithTags: ['scope:shared']
						}
					]
				}
			]
		}
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
		// Override or add rules here
		rules: {}
	}
];
