import { defineConfig } from 'tsup'

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		'react-hook-form': 'src/integrations/react-hook-form/index.ts',
		middleware: 'src/integrations/middleware/index.ts',
		'middleware/hono': 'src/integrations/middleware/hono.ts',
		'middleware/express': 'src/integrations/middleware/express.ts',
		'middleware/fastify': 'src/integrations/middleware/fastify.ts',
		schemas: 'src/lib/schemas/index.ts',
	},
	format: ['esm'],
	dts: true,
	minify: true,
	treeshake: true,
	clean: true,
	sourcemap: false,
	target: 'es2023',
	splitting: true,
	external: [
		'arktype',
		'@nextnode/logger',
		'react-hook-form',
		'hono',
		'express',
		'fastify',
	],
	outDir: 'dist',
})
