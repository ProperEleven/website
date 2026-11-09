# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the static website for Proper Eleven Technologies (P.E.T), hosted at propereleven.com: the company home page, a page for Sagazo, a Games section, Stoppy's page, Stoppy's privacy policy, terms of service and support page, and the company privacy policy.

The owner wants it to feel like "a great legendary company in the making": cinematic, animated and polished. A clean but plain version was rejected as "very basic" on 9 November 2026, so keep new work at that standard.

## Project Structure

```
website/
├── index.html              # Home: the 3D gate hero, a statement, Sagazo, "We build exciting games" (no game is named here), contact
├── sagazo.html             # /sagazo: Sagazo's own page, in Sagazo's look (warm whites, its red, Figtree)
├── games.html              # /games: every game P.E.T makes; Stoppy is the first, shown as a layered, animated scene
├── stoppy.html             # /stoppy: Stoppy's own page, in the game's bright look on the shared system
├── privacy.html            # /privacy: company privacy policy; an app with its own policy (Stoppy) follows that one
├── stoppy/
│   ├── privacy.html        # /stoppy/privacy (same text as stoppy/legal/privacy.html in the games repo)
│   ├── terms.html          # /stoppy/terms (same text as stoppy/legal/terms.html in the games repo)
│   └── support.html        # /stoppy/support: the Support URL in App Store Connect
├── assets/
│   ├── css/site.css        # The design system: tokens, type, header, menu, gate, buttons, reveals, footer, documents
│   ├── css/scene.css       # Stoppy's layered world (games and Stoppy pages)
│   ├── js/site.js          # Every page: the gate transitions, smooth scrolling, header, menu, reveals, magnetic buttons
│   ├── js/gate.js          # Home only: the Three.js hero (an ES module)
│   ├── js/home.js          # Home only: the Sagazo phone and cards, and the window into the game worlds
│   ├── js/scene.js         # Games and Stoppy pages: brings the layered scene in and moves it with the pointer and scroll
│   ├── js/stoppy.js        # Stoppy page: the video's pause button and the tilting phone
│   ├── js/sagazo.js        # Sagazo page: the phones fanning out, the pointer tilt and the ₹700 count-up
│   ├── js/vendor/          # Third-party code, served from here (see "Libraries")
│   ├── img/                # Share images, icons, store badges, Sagazo and Stoppy art (see "Images and video")
│   └── video/              # Stoppy's gameplay clip
├── favicon.svg, favicon.ico
├── robots.txt, sitemap.xml # Add new pages to the sitemap
└── .assetsignore           # Files Cloudflare must not publish (CLAUDE.md, README.md, .DS_Store)
```

`stoppy.html` and the `stoppy/` folder sit side by side: Cloudflare serves `/stoppy` from `stoppy.html` and `/stoppy/privacy` from the folder. Don't add `stoppy/index.html`.

## Development

There's no build step. Pages are plain HTML with the shared CSS and scripts, plus a `<style>` block for styles only that page uses. Asset URLs are absolute (`/assets/...`), so preview from the site root with a server that maps `/games` to `games.html` the way Cloudflare does (for example `npx serve .`). Python's `http.server` doesn't, so `/stoppy` 404s there. The GitHub Pages mirror at propereleven.github.io/website serves from a subfolder and won't load the assets; propereleven.com is the real site.

Check every change at phone width (390 px) and desktop width, with motion and with reduced motion, and check that nothing scrolls sideways.

## Design

- **Night and ember.** Dark, lit backgrounds (`--night-*`), warm white text, and ember light from the logo's two bars. Tokens are at the top of `site.css`. Product pages and sections keep their product's look: Sagazo's warm whites, red (`#ff2442`, `#e01030` under white text), gold and Figtree; Stoppy's sky, Fredoka and art. Both product pages use a light page with `site-header on-light`, and the P.E.T footer stays dark.
- **Type.** Clash Display (by the Indian Type Foundry, from Fontshare) for headlines, the wordmark and statements; Schibsted Grotesk (Google Fonts) for reading and interface. Product pages use the product's own face for their content: Fredoka on the Stoppy and games pages, Figtree on the Sagazo page. The owner turned down Bodoni Moda on 9 November 2026 ("I dont like heading font"). Clash Display loads from Fontshare's CSS API: its licence (ITF Free Font License) allows commercial websites but limits redistribution, so don't copy the font files into this public repo.
- **The mark** is two ember bars, the "11" of Proper Eleven (`.mark`, `favicon.svg`). It returns at every scale: the header, the gate transition, the 3D monoliths of the home hero and the footer's giant wordmark.
- **The gate** (`site.js`, `.gate` in `site.css`) is the page transition. Two dark halves close like doors, each carrying one glowing bar, then open on the next page. An inline script in each page's `<head>` closes it before the first paint when you arrive from another page of the site (sessionStorage `pet-gate`). The home page also plays it once per visit as the intro (`pet-intro`). If the script never runs, a CSS fallback opens the gate after 2.5 seconds. Reduced motion turns it off.
- **Reveals** are attributes that `site.js` animates: `data-split` (headings rise line by line behind masks), `data-reveal` (fade up), `data-words` (a statement lights up word by word as you scroll), `data-parallax`. The `-open` variants wait for the gate. Content is hidden only while `html.motion` is set and the script hasn't taken over, with a CSS fallback, so nothing stays invisible if a script fails.
- **The home hero** (`gate.js`) is a Three.js scene: two obsidian monoliths with light lines on their inner edges, a beam between them, embers, mist, a starry dusk sky, bloom and a finishing pass. The hero is one screen tall and scrolls away normally. As it goes, the camera pushes in and the stage lags behind the scroll, and the next section (its own background and a rounded top) slides up over it. Don't pin it or fade it to black again: on 9 November 2026 the owner found the earlier 250svh pinned version slow, and its dark stretch looked like something was broken. It drops to 1× pixel ratio on slow devices, pauses off screen, renders one still frame for reduced motion, and the page shows a CSS glow if WebGL is missing. Keep the light restrained: when bloom or light levels rise with the scroll, the pillars turn into a blurred wall of light.
- **Layered scenes** (`scene.css`, `scene.js`): every layer sits on a 16:9 stage that covers its box (container units), so the layers stay aligned. Portrait boxes use a wider stage nudged left to keep Stoppy in frame. Each layer has separate wrappers for the scroll, the pointer and the CSS bobbing (`.scene__layer`, `.scene__drift`, `.scene__float`), because a CSS animation overrides a script's transform on the same element.
- **The App Store badge** is Apple's own artwork (`assets/img/badges/`, from Apple's marketing toolbox), unmodified and at least 40 px tall: the white badge on dark backgrounds, the black one on light. Link it to https://apps.apple.com/app/id6832074174. Add Google Play's official badge the same way once Stoppy is live there.

## Libraries

All served from `assets/js/vendor/`, so the site makes no third-party script requests (the fonts come from Google Fonts and Fontshare):
- Three.js 0.187.0: `three.core.js`, `three.module.js` and the addons in `three/addons/`, minified with esbuild from the games repo's `node_modules/three` (the version Stoppy uses). Loaded through the import map in `index.html`. Licence in `three/LICENSE`.
- GSAP 3.15.0 with ScrollTrigger and SplitText (free under GSAP's standard licence), from jsDelivr.
- Lenis 1.3.27 for smooth scrolling, from jsDelivr.

Pin exact versions, and use a release that's at least two weeks old when upgrading.

## Words on the site

Everything people read here is checked before it ships: facts against the game's code and the products' own copy, the AI-writing grep (no em dashes, no "vibrant", "seamless", "journey", "empower", "unlock", "elevate", "testament", "showcase", "delve", "crucial", "leverage" or "boasts"), straight quotes, full sentences, sentence-case headings, and a humanizer pass. Indian English spelling ("colour").

- **The mission line** is "We build companies and products that move humanity forward." (the owner's wording, 9 November 2026), in the home hero, the share description and every footer.
- **The home page doesn't name Stoppy** (owner's request, 9 November 2026): it says "We build exciting games" and links to /games.
- **Stoppy facts** come from the game and its store listings (`stoppy/store/app-store-listing.md` in the games repo): 50 levels in five worlds with 10 each, what each world adds, 25 awards, the daily puzzle (Mondays gentle, Sundays tough), challenges, the wardrobe, three lives and three undos, hints paid with points, offline, no sign-in, rated 4+, iOS 15 or later. When the game changes, update `stoppy.html` and `games.html` with the listings.
- **Stoppy's privacy and price claims:** the Stoppy and games pages say there are no ads and nothing to buy, that it plays offline and that progress stays on the device. If ads, purchases or analytics arrive, change those lines together with the privacy policy, the terms and the support page (the games repo's `stoppy/CLAUDE.md` has the full list).
- **Stoppy wording to avoid:** the tagline "Walls are your brakes" (the owner finds it cringy), "roll the ball", "maze", "sliding puzzle", IQ or brain-training claims, and "for kids". Describe what the game asks of you (planning, thinking ahead) rather than promising it improves anything.
- **Sagazo lines** follow Sagazo's settled copy and its content checklist (`docs/content-checklist.md` in the Sagazo repo). The sources are Sagazo's `/llms.txt` (`lib/sagazo_web/controllers/llms_controller.ex`), its About page (`priv/pages/en/about.md`) and the seller page's copy (`lib/sagazo_web/live/sell/copy.ex`).
  - "A social commerce app where India shares and shops". The feed ranks posts by how new and how active they are. A post can carry photos, a poll, a product from the author's shop, a link preview or a circle card. Circles have their own feed, member list and group chat, and are public or private. Every account is tied to a verified phone number, and moderators look at every report. The buttons and menus are in English, हिंदी, తెలుగు and தமிழ் (Sagazo's own labels).
  - For sellers: opening a shop is free, with no commission, no listing fee and no monthly charge, so a ₹700 sale pays ₹700. The only deduction is the TCS the law requires from GST-registered shops. Shops are verified before their products show to buyers. The eight free tools go by the names on sagazo.com/tools.
  - Keep the commission line in seller-facing sections and out of meta descriptions.
  - Checkout on Sagazo isn't open yet: don't say people can buy there today, don't promise dates, and leave delivery out until it's live (if delivery is ever mentioned, Sagazo's settled line says both ways in one sentence).

## Images and video

- Stoppy's key art (`assets/img/stoppy/key-*.webp`, `key-wide-*.webp`, `tall.webp`, `og.jpg`) comes from `stoppy/store/app-store/search-results.png` and `header.png` in the games repo.
- The world islands (`assets/img/stoppy/worlds/1-5.webp`), `prickle.webp` and the phone screens (`assets/img/stoppy/screens/`) were rendered from the running game on 9 November 2026: transparent 3D captures with the sky hidden, and screens from a mid-game save built with the game's own progress code.
- `assets/img/stoppy/stoppy.svg` is Stoppy as the app icon draws him, exported from `scripts/stoppy-art.ts` in the games repo, so he stays sharp at any size.
- `assets/video/stoppy-preview.mp4` is the App Store preview (`stoppy/store/app-store/preview-iphone.mp4`) re-encoded at 600 px wide with no sound.
- Sagazo: `logo-color.webp` is the app's 1360 px logo (`sagazo_app/assets/images/sagazo-logo.webp`), and `logo-white.webp` is the same with the navy turned white for dark backgrounds, as Sagazo's own dark logo does. The `screen-*.webp` phone screens are 3× captures of sagazo.com's own pages (become-a-seller, tools, help, about) with the cookie banner and the ordering-date strip hidden. Only company pages, so no member's posts or shop is shown without their say. The product photos are copies from the Sagazo repo (`priv/static/images/sell/`). `og.jpg` is a capture of the page's hero.
- `assets/img/og-home.jpg` is a 1200×630 capture of the home hero after the intro; retake it when the hero changes.
- Use WebP with `width` and `height` set, and `loading="lazy"` below the first screen.

## Hosting

- A Cloudflare Worker named `pet-website` serves propereleven.com from this repo's files (static assets).
- Each push to `main` makes Cloudflare build and deploy the Worker. If propereleven.com doesn't change after a push, read that build's log in the Cloudflare dashboard (Workers & Pages → pet-website).
- Pages are served without `.html`: `stoppy/privacy.html` is https://propereleven.com/stoppy/privacy.
- Every file in the repo is published unless `.assetsignore` lists it. Add any new non-public file there.
- Don't add a `_redirects` file with full URLs, such as www to non-www. Cloudflare rejects the whole deploy ("Only relative URLs are allowed", code 100324) and the live site stops updating. Redirects between hostnames belong in a Redirect Rule in the Cloudflare dashboard.
