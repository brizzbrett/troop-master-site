// After the Eleventy build: puts the press kit's full-size downloads into _site/press/files/
// (the 1920x1080 screenshots, the logos, the twelve alpha cut-outs) and zips them all into one file.
// Runs as part of `npm run build` / `npm run build:pages`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const press = JSON.parse(fs.readFileSync(path.join(root, "src/_data/press.json"), "utf8"));
const alphas = JSON.parse(fs.readFileSync(path.join(root, "src/_data/alphas.json"), "utf8"));
const outDir = path.join(root, "_site/press/files");
fs.mkdirSync(outDir, { recursive: true });

const files = {}; // zip path -> bytes
const add = (from, zipPath) => {
  const bytes = fs.readFileSync(path.join(root, from));
  const dest = path.join(outDir, zipPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, bytes);
  files[`troop-master-press-kit/${zipPath}`] = [bytes, { level: 0 }]; // PNGs are already compressed
};

for (const s of press.screenshots) add(`src/assets/shots/${s.file}.png`, `screenshots/troop-master-${s.file}.png`);
add("src/assets/art/wordmark.png", "logos/troop-master-wordmark.png");
add("src/static/brand/wordmark-on-light.png", "logos/troop-master-wordmark-on-light.png");
add("src/static/brand/wordmark-on-dark.png", "logos/troop-master-wordmark-on-dark.png");
add("src/assets/art/logo.png", "logos/troop-master-badge.png");
for (const group of alphas) for (const a of group.list) add(`src/assets/art/alpha-${a.file}.png`, `art/alpha-${a.file}.png`);

const zip = zipSync(files);
fs.writeFileSync(path.join(outDir, "troop-master-press-kit.zip"), zip);
console.log(`press kit: ${Object.keys(files).length} files, zip ${(zip.length / 1e6).toFixed(1)} MB`);
