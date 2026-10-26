// The shown name's switch, the website's twin of the game's Troop Master > Game Name (Brett, 2026-10-26: Lord of the
// S'mores or Scout's Honor until he decides). Rewrites site.json's brand / name / slug / badge and rebuilds the brand
// images (favicon, share card, wordmark on light and dark) from src/assets/art/brands/<id>/.
//   npm run brand -- honor      preview Scout's Honor (then npm start)
//   npm run brand -- smores     back to Lord of the S'mores (what is live)
// Only push while it says the name that should be live.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const BRANDS = {
  smores: { name: "Lord of the S'mores", slug: "lord-of-the-smores", badge: "s'mores badge" },
  honor: { name: "Scout's Honor", slug: "scouts-honor", badge: "neckerchief badge" },
};

const id = process.argv[2];
if (!BRANDS[id]) {
  console.error(`which name? npm run brand -- ${Object.keys(BRANDS).join(" | ")}`);
  process.exit(2);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src/_data/site.json");
const site = JSON.parse(fs.readFileSync(file, "utf8"));
const next = { brand: id, ...BRANDS[id] };
const out = {};
for (const [k, v] of Object.entries(site)) if (!(k in next)) out[k] = v; // keep every other field, brand fields first
fs.writeFileSync(file, JSON.stringify({ ...next, ...out }, null, 2) + "\n");
execFileSync(process.execPath, [path.join(root, "tools/make-brand.mjs")], { stdio: "inherit" });
console.log(`the site now shows ${BRANDS[id].name}`);
