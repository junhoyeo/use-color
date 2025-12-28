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
	minify: true,
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
		options.drop = ["debugger"];
		options.treeShaking = true;
	},
});
