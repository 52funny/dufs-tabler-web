import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";
import { minify as minifyHtml } from "html-minifier-terser";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputDir = path.join(rootDir, "assets");
const outputDir = path.join(rootDir, "dist", "assets");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const files = await readdir(inputDir);

for (const file of files) {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);
  const entry = await stat(inputPath);

  if (!entry.isFile()) continue;

  const extension = path.extname(file);
  let output;

  if (extension === ".html") {
    const source = await readFile(inputPath, "utf8");
    output = await minifyHtml(source, {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      decodeEntities: false,
      keepClosingSlash: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    });
  } else if (extension === ".css" || extension === ".js") {
    const source = await readFile(inputPath, "utf8");
    const result = await esbuild.transform(source, {
      charset: "utf8",
      legalComments: "none",
      loader: extension === ".css" ? "css" : "js",
      minify: true,
      target: extension === ".css" ? "chrome100" : "es2018",
    });
    output = result.code;
  } else {
    await cp(inputPath, outputPath);
    continue;
  }

  await writeFile(outputPath, output);
}
