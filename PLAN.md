# Troop Master website: plan

## Status (2026-10-14)
**P0–P6 done and live** at https://lordofthesmores.com (Brett's domain, 2026-10-31: DNS at Squarespace points at GitHub Pages; the old https://brizzbrett.github.io/troop-master-site/ redirects there). Kit form 10043486 is wired and tested end to end. The Kit sender is troopmastergame@gmail.com; never use an @yahoo.com sender, because Yahoo's DMARC rule `p=reject` makes Gmail silently refuse it.

Working on the site:
- `npm start`: live preview.
- `npm run check`: build, link check, HTML validation.
- `node tools/shoot.mjs <page/>`: desktop + phone screenshots in `shots/`, flags overflow and console errors.
- `node tools/serve.mjs` then `node tools/lighthouse.mjs http://127.0.0.1:8089 index.html game/`: Lighthouse scores.
- `node tools/import-assets.mjs`: re-copy art from the game repo.
- `node tools/make-brand.mjs`: favicon, share card, wordmark variants.
- `node tools/test-signup.mjs you@x.com`: one real signup on the live site.
- Pass page paths without the leading slash; Git Bash rewrites `/game/`.

Later:
- Steam store URL in `site.json` to turn on the Wishlist button.
- A custom domain (a CNAME file and `url` in `site.json`).
- A trailer for the press kit.
- A larger TM badge.
- A 0.2.0 news post when it ships.

## Context
Brett wants an official site for the game, like publishers run, to give information and advertise. The game is at 0.2.0, with friend playtests and no Steam store page yet (the Steamworks test App ID is still 480). So the site's job right now is to **collect emails**, and later to **send people to a Wishlist button**.

His choices:
- a full multi-page site
- the mailing list as the main call to action
- **Kit** (ConvertKit) for the mailing list
- GitHub Pages in its **own repo**, on github.io for now
- a look that **matches the game**
- the identity **"Bretts Games"** plus a new contact address (a placeholder until he has one)
- the name kept in **one config file**, because "Troopmaster" is an existing scouting-software trademark (troopmaster.com). He'll look into that separately.

Comparables checked:
- RimWorld's site: feature prose alternating with full-width screenshots, plus a dev blog, FAQ and wiki.
- Press-kit guides (presskit.gg, impress.games): a fact sheet first, a quotable one-line pitch, 6–12 shots at 1920×1080, logos in light and dark, a contact.
- Landing-page studies: the CTA above the fold, no autoplaying video, mobile from the start.

## Tech
- **Eleventy (11ty) v3 + Nunjucks**, plain CSS and a little vanilla JS. Node 22 is installed; Ruby isn't, which rules out Jekyll.
- `@11ty/eleventy-img` makes the WebP and JPEG sizes, the `srcset` and lazy loading.
- A **GitHub Actions** workflow builds the site and deploys to Pages on every push to `main`.
- New public repo **`brizzbrett/troop-master-site`**, cloned beside the game: `D:/Desktop/Software Dev/Game Dev/Unity Project/troop-master-site`. Creating it is the one outward-facing step, and plan approval covers it.
- `src/_data/site.json` is the single source for the name, tagline, studio, contact email, Kit form ID, Steam URL (null for now), base path and social links. Renaming the game or turning on the Wishlist button is one edit there.
- **Signup form:**
  - It posts straight to `https://app.kit.com/forms/<id>/subscriptions` (field `email_address`), with a success/error message handled in JS.
  - While `kitFormId` is null the form shows "Signups open soon", so it is never a dead form.
  - A **Privacy** page explains what Kit stores.
- **Font:** Chewy, self-hosted from `Assets/Troop Master/Fonts/Resources/Chewy.ttf` (Apache 2.0, licence copied in). Body text uses Patrick Hand (OFL) or a system stack. None of the restrictively licensed fonts.
- **Palette:** taken from `Scripts/UI/UITheme.cs`:
  - green `#5C8C4D`, blue `#4D6B8C`, brown `#735233`, red `#804238`
  - cream `#FAF2E0`, gold `#FAD961`, parchment `#F5E6B3`, dark wood `#1A1712` / `#33291A`
- **Day-to-night theme:** the home page sky goes from day to dusk to night as you scroll, using CSS scroll-driven animation with a static fallback. Reduced motion turns it off. The rest of the site has one fixed look, light parchment over dark wood.

## Pages
1. **Home `/`**
   - Hero: `troopmaster header.png` (4080×861 wordmark) over `hero.png`, the pitch line, and the email form.
   - The day/night loop: `camp-day.png` / `camp-night.png` with a drag slider.
   - Scouts are people: `scout-card.png`, the mood faces, and "nobody dies: the noon bus".
   - The four maps: Forest, Jungle, Desert, Tundra, as cards with each map's emblem and screenshot.
   - The alphas: a strip of the `alpha-*` cut-outs.
   - A gallery with a lightbox, then the form again.
2. **The Game `/game/`:** the longer feature page in RimWorld style: day, night, dawn, the camp, the wilderness, the storyteller and weather, between runs (Popcorn Shop, Evidence Board, achievements, the Pact).
3. **Troop 13 `/troop-13/`:** a lore teaser with no spoilers.
   - The rival troop, the badge serum, cookie money, the painted evidence papers (memo, badge spec, invitation) and the Troop 13 logo.
   - **Daisy-as-trader, Timmy and the Den Mother's arc are not revealed.**
4. **News `/news/`:** Markdown posts with an RSS feed.
   - Seed posts: "The site is up", plus 0.1.3 / 0.1.4 / 0.1.5, rewritten from `Docs/CHANGELOG.md` as short posts.
   - 0.2.0 is posted when it ships.
5. **Press kit `/press/`** (presskit() layout):
   - A fact sheet: Bretts Games, self-published, PC (Windows), release TBA, price TBA, Unity, single player.
   - A short and a long description, and 6–8 feature bullets.
   - 10 screenshots, each a 1920×1080 download, in one zip as well.
   - The wordmark and logo on light and dark, the palette and font, alt text for every image, and the contact.
6. **FAQ `/faq/`:** platforms, release, price, Steam, "do scouts die?", difficulty, the playtest.
7. **Privacy** and **404**.

## Content rules (from the game's CLAUDE.md and memory)
- Scouts are teenagers, 12–17. Player-facing text says "scouts", never "boys", and uses no diminutives.
- No BSA terms: the ranks run Recruit→Master Cadet, there are "field badges", and the rival is only ever "Troop 13".
- Say "Tundra", never "Winter". Use American English and plain, flat wording.
- Art is described only as the game's art ("painted", "drawn"); no production-process talk anywhere in the site or its repo.
- Copy comes from `Docs/GDD.src.html` (v3.0, the current text). The pitch paragraph is in its section 1.
- All page text is drafted as a **content table for Brett's review before it's wired in**.

## Assets
- `tools/import-assets.mjs` copies a fixed list from the game repo into `src/assets/raw/`, so the site never reads the game repo at build time:
  - from `Docs/Screenshots/`: hero, camp-day, camp-night, raid-wall, alpha, the four biome shots, aurora-night, scout-card, mirage-tree, evidence, bus
  - from `Docs/media/gdd/`: the alpha-*, emblem-*, mood-*, lore-* and troop13-logo images
  - from `Resources/UI/Menus/`: the header and the grass background
- The 169 px `TMLogo.png` is too small for a favicon or social card. The social card (1200×630) is composed from the wordmark plus `hero.png` by the same script, using sharp, which eleventy-img already depends on.
- Motion: no videos or GIFs exist. A "B-roll / GIFs" slot in the press kit is marked "coming soon". A trailer is a later task.

## Phases (commit each; plan doc kept in the site repo as `PLAN.md`, with a pointer in the game repo's `Docs/BACKLOG.md`)
- **P0:** create the repo, scaffold Eleventy, `site.json`, the base layout and nav, the Pages workflow, a deploy "hello" page and confirm the github.io URL loads.
- **P1:** the content table (every page's copy) **goes to Brett for review**, then the asset import script.
- **P2:** the design system (tokens, Chewy, wood/parchment components, buttons in the menu's colors), then the Home page.
- **P3:** The Game, Troop 13, FAQ, Privacy, 404.
- **P4:** News, with the posts from the changelog, and RSS.
- **P5:** the press kit, the zip of screenshots and logos, the social card, and the meta and Open Graph tags.
- **P6:** a polish pass, the checks below, then go live and send Brett the URL.

## Verification
- `npx @11ty/eleventy` builds cleanly. `npx serve _site` gives a local preview.
- **Screenshots of every page** at 1440 px and 400 px wide, in light and with reduced motion. I look at each one before calling a page done (Playwright Chromium, run locally).
- Link check (`linkinator` over `_site`); HTML validation (`html-validate`); a Lighthouse run, aiming for 90+ on Performance, Accessibility and SEO.
- A grep of `_site` for banned words: boys, Boy Scout, Eagle, merit badge, Winter, kiddo, adorable.
- The form: with no ID it shows the "soon" state. Once Brett gives the Kit form ID, a test signup with his address shows up in Kit.
- After P0 and P6, load the live github.io URL.

## Brett's to-dos (outside the code)
- Create the Kit account and a form, and send me its ID.
- Make the public contact address.
- Look into the trademark question.
- Later: the Steam App ID and store URL, which turn the main button into Wishlist.
