import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { transform } from "@swc/core";
import { defineConfig } from "tsup";

async function swcMinify() {
	const distDir = "dist";
	const files = await readdir(distDir);
	const jsFiles = files.filter((f) => f.endsWith(".js") || f.endsWith(".cjs"));

	await Promise.all(
		jsFiles.map(async (file) => {
			const filePath = join(distDir, file);
			const mapPath = `${filePath}.map`;
			const isEsm = file.endsWith(".js");
			const [code, inputSourceMap] = await Promise.all([
				readFile(filePath, "utf-8"),
				readFile(mapPath, "utf-8"),
			]);

			// `swc.minify()` has no way to accept an input source map, so it can
			// only ever emit a map from minified output back to the pre-minified
			// bundle, not through to the original TypeScript. `swc.transform()`
			// with `minify: true` accepts `inputSourceMap`, letting it chain
			// through tsup's esbuild-generated map back to the real sources.
			const result = await transform(code, {
				filename: file,
				sourceMaps: true,
				inputSourceMap,
				isModule: isEsm,
				minify: true,
				jsc: {
					parser: { syntax: "ecmascript" },
					target: "es2020",
					minify: {
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
						module: isEsm,
					},
				},
			});

			await writeFile(filePath, result.code);
			if (result.map) {
				await writeFile(mapPath, result.map);
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
