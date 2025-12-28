import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { minify } from "@swc/core";
import { defineConfig } from "tsup";

async function swcMinify() {
	const distDir = "dist";
	const files = await readdir(distDir);
	const jsFiles = files.filter((f) => f.endsWith(".js") || f.endsWith(".cjs"));

	await Promise.all(
		jsFiles.map(async (file) => {
			const filePath = join(distDir, file);
			const code = await readFile(filePath, "utf-8");

			const result = await minify(code, {
				compress: {
					passes: 3,
					pure_getters: true,
					unsafe_math: true,
					drop_debugger: true,
					toplevel: true,
				},
				mangle: {
					toplevel: true,
				},
				module: true,
				sourceMap: true,
			});

			await writeFile(filePath, result.code);
			if (result.map) {
				await writeFile(`${filePath}.map`, result.map);
			}
		}),
	);

	console.log(`SWC ✨ Minified ${jsFiles.length} files`);
}

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
	minify: false,
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
	async onSuccess() {
		await swcMinify();
	},
});
