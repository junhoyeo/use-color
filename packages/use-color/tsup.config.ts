import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		core: "src/core.ts",
		a11y: "src/a11y.ts",
		names: "src/names.ts",
		p3: "src/p3.ts",
	},
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	minify: "terser",
	terserOptions: {
		ecma: 2020,
		module: true,
		toplevel: true,
		compress: {
			passes: 3,
			pure_getters: true,
			unsafe_math: true,
			drop_debugger: true,
		},
		mangle: {
			toplevel: true,
		},
		format: {
			comments: false,
			ecma: 2020,
		},
	},
	treeshake: {
		preset: "smallest",
		moduleSideEffects: false,
	},
	splitting: true,
	sourcemap: true,
	outDir: "dist",
	target: "es2020",
	esbuildOptions(options) {
		options.legalComments = "none";
		options.treeShaking = true;
	},
});
