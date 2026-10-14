// Makes the brand images the site serves as-is (committed under src/static/brand/):
// the favicon and touch icon, the social share card, and the wordmark on light and dark backgrounds.
// Run again only when the art changes: node tools/make-brand.mjs
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const art = (f) => path.join(root, "src/assets", f);
const out = path.join(root, "src/static/brand");
fs.mkdirSync(out, { recursive: true });

const PAPER = { r: 245, g: 235, b: 209, alpha: 1 };
const WOOD = { r: 26, g: 23, b: 18, alpha: 1 };

// Icons from the TM badge.
await sharp(art("art/logo.png")).resize(32, 32).png().toFile(path.join(out, "favicon-32.png"));
await sharp(art("art/logo.png")).resize(180, 180).flatten({ background: PAPER }).png().toFile(path.join(out, "apple-touch-icon.png"));

// Wordmark on light, with room around it.
{
  const mark = await sharp(art("art/wordmark.png")).resize(2400).toBuffer();
  const { height } = await sharp(mark).metadata();
  await sharp({ create: { width: 2800, height: height + 400, channels: 4, background: PAPER } })
    .composite([{ input: mark, top: 200, left: 200 }]).png().toFile(path.join(out, "wordmark-on-light.png"));
}
// For dark backgrounds the brown wordmark needs its parchment sign behind it (it disappears on dark wood).
{
  const mark = await sharp(art("art/wordmark.png")).resize(2000).toBuffer();
  const mh = (await sharp(mark).metadata()).height;
  const w = 2800, h = mh + 800, sw = 2300, sh = mh + 360, sx = (w - sw) / 2, sy = (h - sh) / 2;
  const sign = Buffer.from(`<svg width="${w}" height="${h}">
    <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="56" fill="#F5EBD1" stroke="#735233" stroke-width="22"/>
  </svg>`);
  await sharp({ create: { width: w, height: h, channels: 4, background: WOOD } })
    .composite([{ input: sign }, { input: mark, left: Math.round((w - 2000) / 2), top: Math.round((h - mh) / 2) }])
    .png().toFile(path.join(out, "wordmark-on-dark.png"));
}

// Social card, 1200x630: the dusk camp, a parchment sign with the wordmark.
const W = 1200, H = 630;
const bgImg = await sharp(art("shots/hero.png")).resize(W, H, { fit: "cover", position: "top" }).toBuffer();
const shade = Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="rgb(26,23,18)" fill-opacity="0.35"/></svg>`);
const signW = 860, signH = 270, signX = (W - signW) / 2, signY = (H - signH) / 2;
const sign = Buffer.from(`<svg width="${W}" height="${H}">
  <rect x="${signX + 6}" y="${signY + 12}" width="${signW}" height="${signH}" rx="22" fill="rgb(0,0,0)" fill-opacity="0.35"/>
  <rect x="${signX}" y="${signY}" width="${signW}" height="${signH}" rx="22" fill="#F5EBD1" stroke="#735233" stroke-width="8"/>
</svg>`);
const markW = 760;
const mark = await sharp(art("art/wordmark.png")).resize(markW).toBuffer();
const markH = (await sharp(mark).metadata()).height;
await sharp(bgImg)
  .composite([
    { input: shade },
    { input: sign },
    { input: mark, left: Math.round((W - markW) / 2), top: Math.round((H - markH) / 2) },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(out, "social-card.jpg"));

console.log("brand images written to", path.relative(root, out));
