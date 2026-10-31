// Makes the brand images the site serves as-is (committed under src/static/brand/):
// the favicon and touch icon, the social share card, and the wordmark on light and dark backgrounds.
// Run again only when the art changes: node tools/make-brand.mjs
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(fs.readFileSync(path.join(root, "src/_data/site.json"), "utf8")); // the shown name (tools/brand.mjs)
const art = (f) => path.join(root, "src/assets", f.replace(/^art\/wordmark\.png$/, `art/brands/${site.brand}/wordmark.png`));
const out = path.join(root, "src/static/brand");
fs.mkdirSync(out, { recursive: true });

const PAPER = { r: 245, g: 235, b: 209, alpha: 1 };
const WOOD = { r: 26, g: 23, b: 18, alpha: 1 };

// A light title (Lord of the S'mores' logo: cream letters in a thick dark outline) reads on dark by itself; a dark one
// (Scout's Honor's brown wordmark) disappears on dark wood and needs its parchment sign behind it.
async function isLight(file) {
  const { data, info } = await sharp(file).resize(200).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let sum = 0, n = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 200) continue;
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]; n++;
  }
  return n > 0 && sum / n > 140;
}
const light = await isLight(art("art/wordmark.png"));

// Icons from the badge (one for the whole game, whichever name shows).
await sharp(art("art/logo.png")).resize(32, 32).png().toFile(path.join(out, "favicon-32.png"));
await sharp(art("art/logo.png")).resize(180, 180).flatten({ background: PAPER }).png().toFile(path.join(out, "apple-touch-icon.png"));

// Wordmark on light, with room around it.
{
  const mark = await sharp(art("art/wordmark.png")).resize(2400).toBuffer();
  const { height } = await sharp(mark).metadata();
  await sharp({ create: { width: 2800, height: height + 400, channels: 4, background: PAPER } })
    .composite([{ input: mark, top: 200, left: 200 }]).png().toFile(path.join(out, "wordmark-on-light.png"));
}
// For dark backgrounds: a light title as it is, a dark one on its parchment sign (it disappears on dark wood).
if (light) {
  const mark = await sharp(art("art/wordmark.png")).resize(2400).toBuffer();
  const { height } = await sharp(mark).metadata();
  await sharp({ create: { width: 2800, height: height + 400, channels: 4, background: WOOD } })
    .composite([{ input: mark, top: 200, left: 200 }]).png().toFile(path.join(out, "wordmark-on-dark.png"));
} else {
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

// Social card, 1200x630: the menu's camp at dusk (the Steam library hero: no HUD) with the scouts at the fire on the left,
// the title over the clearing on the right (a light one with a soft shadow; a dark one on a parchment sign)
const W = 1200, H = 630;
const bgImg = await sharp(art("art/keyart-camp.jpg")).extract({ left: 700, top: 0, width: 2362, height: 1240 }).resize(W, H).toBuffer();
const shade = Buffer.from(`<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="rgb(26,23,18)" fill-opacity="0.15"/></svg>`);
const markW = light ? 540 : 460;
const cx = Math.round(W * 0.745); // the clearing's middle
const mark = await sharp(art("art/wordmark.png")).resize(markW).toBuffer();
const markH = (await sharp(mark).metadata()).height;
const signW = markW + 120, signH = markH + 90, signX = cx - signW / 2, signY = (H - signH) / 2;
const sign = Buffer.from(`<svg width="${W}" height="${H}">
  <rect x="${signX + 6}" y="${signY + 12}" width="${signW}" height="${signH}" rx="22" fill="rgb(0,0,0)" fill-opacity="0.35"/>
  <rect x="${signX}" y="${signY}" width="${signW}" height="${signH}" rx="22" fill="#F5EBD1" stroke="#735233" stroke-width="8"/>
</svg>`);
const shadow = await sharp(mark).ensureAlpha().linear([0, 0, 0, 0.55], [0, 0, 0, 0]).blur(6).toBuffer();
await sharp(bgImg)
  .composite(light ? [
    { input: shade },
    { input: shadow, left: Math.round(cx - markW / 2) + 6, top: Math.round((H - markH) / 2) + 10 },
    { input: mark, left: Math.round(cx - markW / 2), top: Math.round((H - markH) / 2) },
  ] : [
    { input: shade },
    { input: sign },
    { input: mark, left: Math.round(cx - markW / 2), top: Math.round((H - markH) / 2) },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(out, "social-card.jpg"));

console.log("brand images written to", path.relative(root, out));
