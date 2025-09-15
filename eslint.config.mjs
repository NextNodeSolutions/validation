import nextnodeEslint from '@nextnode/eslint-plugin/base'

export default [
	...nextnodeEslint,
	{
		ignores: ['dist/**/*', 'coverage/**/*'],
	},
	{
		files: ['vitest.config.ts', '*.config.*'],
		rules: {
			// Allow config files to have flexible rules
		},
	},
]
