import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm", "cjs"],
	dts: true,
	clean: true,
	minify: true,
	treeshake: {
		preset: "smallest",
		moduleSideEffects: false,
	},
	splitting: false,
	sourcemap: true,
	outDir: "dist",
	target: "es2020",
	esbuildOptions(options) {
		options.legalComments = "none";
		options.drop = ["debugger"];
		options.treeShaking = true;
	},
});
