// Copies the art the site uses out of the game repo, so the site never reads the game repo at build time.
// Usage: node tools/import-assets.mjs [path-to-game-repo]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "..");
const game = path.resolve(process.argv[2] ?? path.join(site, "..", "Troop Master"));

const SHOTS = [
  "hero", "camp-day", "camp-night", "raid-wall", "raid-breach", "alpha", "aurora-night",
  "biome-forest", "biome-jungle", "biome-desert", "biome-tundra",
  "scout-card", "mirage-tree", "dust-devil", "evidence", "bus", "den-odds", "night-plan",
  "board-build", "morning-report", "popcorn-shop", "tundra-cold", "visible-perk",
];
// The twelve alphas in the regular rotation. The four secret bosses and the Den Mother stay off the site.
const ALPHAS = [
  "honeybandit", "swindler", "nut", "stalker", "weaver", "silverback",
  "burrower", "marauder", "tusker", "packleader", "tide", "abominable",
];
const ART = [
  ...ALPHAS.map((a) => `alpha-${a}`),
  "scout", "scout-portrait", "troop13-logo", "logo",
  "emblem-forest", "emblem-jungle", "emblem-desert", "emblem-tundra",
  "mood-inspired", "mood-content", "mood-glum", "mood-miserable",
];
// The Troop 13 papers come from the game's full-size lore art (about 1000 px wide; the GDD copies are 250),
// trimmed to the paper's edges.
const LORE = [["ledger_0", "lore-memo"], ["badge_0", "lore-badge"], ["sites_0", "lore-site"]];

const jobs = [
  ...SHOTS.map((n) => [path.join(game, "Docs/Screenshots", `${n}.png`), `src/assets/shots/${n}.png`]),
  ...ART.map((n) => [path.join(game, "Docs/media/gdd", `${n}.png`), `src/assets/art/${n}.png`]),
  [path.join(game, "Assets/Troop Master/Resources/UI/Brand/smores/Wordmark.png"), "src/assets/art/brands/smores/wordmark.png"],
  // Fonts: Chewy is the game's own font; Atkinson Hyperlegible is the body face. Both are OFL/Apache.
  [path.join(site, "node_modules/@fontsource/chewy/files/chewy-latin-400-normal.woff2"), "src/static/fonts/chewy.woff2"],
  ...["400-normal", "700-normal", "400-italic"].map((w) => [
    path.join(site, `node_modules/@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-${w}.woff2`),
    `src/static/fonts/atkinson-${w}.woff2`,
  ]),
  [path.join(site, "node_modules/@fontsource/chewy/LICENSE"), "src/static/fonts/LICENSE-chewy.txt"],
  [path.join(site, "node_modules/@fontsource/atkinson-hyperlegible/LICENSE"), "src/static/fonts/LICENSE-atkinson.txt"],
];

let missing = 0;
for (const [from, to] of jobs) {
  const dest = path.join(site, to);
  if (!fs.existsSync(from)) { console.error("MISSING", from); missing++; continue; }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(from, dest);
}
const { default: sharp } = await import("sharp");
for (const [from, to] of LORE) {
  const src = path.join(game, "Assets/Troop Master/Resources/UI/Lore", `${from}.png`);
  if (!fs.existsSync(src)) { console.error("MISSING", src); missing++; continue; }
  await sharp(src).trim().png().toFile(path.join(site, "src/assets/art", `${to}.png`));
}

console.log(`copied ${jobs.length + LORE.length - missing} files${missing ? `, ${missing} missing` : ""}`);
process.exit(missing ? 1 : 0);
