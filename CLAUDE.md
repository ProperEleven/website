# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the static website for Proper Eleven Technologies (P.E.T), hosted at propereleven.com: the company home page, a page for Sagazo, a Games section, Stoppy's page, Stoppy's privacy policy, terms of service and support page, and the company privacy policy.

The owner wants it to feel like "a great legendary company in the making": cinematic, animated and polished. A clean but plain version was rejected as "very basic" on 9 November 2026, so keep new work at that standard.

## Project Structure

```
website/
├── index.html              # Home: the intro, the 3D gate hero, a statement, Sagazo, "We build exciting games" (no game is named here), contact
├── sagazo.html             # /sagazo: Sagazo's own page, in Sagazo's look (warm whites, its red, Figtree)
├── games.html              # /games: every game P.E.T makes; Stoppy is the first, shown as a layered, animated scene
├── stoppy.html             # /stoppy: Stoppy's own page, in the game's bright look on the shared system
├── privacy.html            # /privacy: company privacy policy; an app with its own policy (Stoppy) follows that one
├── stoppy/
│   ├── privacy.html        # /stoppy/privacy (same text as stoppy/legal/privacy.html in the games repo)
│   ├── terms.html          # /stoppy/terms (same text as stoppy/legal/terms.html in the games repo)
│   ├── support.html        # /stoppy/support: the Support URL in App Store Connect
│   └── get.html            # /stoppy/get: the one link for bios, sends each phone to its store (see below)
├── assets/
│   ├── css/site.css        # The design system: tokens, type, header, menu, buttons, reveals, footer, documents
│   ├── css/scene.css       # Stoppy's layered world (games and Stoppy pages)
│   ├── js/site.js          # Every page: smooth scrolling, header, menu, reveals, magnetic buttons, and the home intro's timing
│   ├── js/gate.js          # Home only: the Three.js hero (an ES module)
│   ├── js/home.js          # Home only: the Sagazo phone and its cards
│   ├── js/scene.js         # Games and Stoppy pages: moves the layered scene with the pointer and the scroll
│   ├── js/stoppy.js        # Stoppy page: the video's pause button and the tilting phone
│   ├── js/sagazo.js        # Sagazo page: the phones' pointer tilt and scroll drift, and the ₹700 count-up
│   ├── js/vendor/          # Third-party code, served from here (see "Libraries")
│   ├── img/                # Share images, icons, store badges, Sagazo and Stoppy art (see "Images and video")
│   └── video/              # Stoppy's gameplay clip
├── favicon.svg, favicon.ico
├── robots.txt, sitemap.xml # Add new pages to the sitemap
└── .assetsignore           # Files Cloudflare must not publish (CLAUDE.md, README.md, .DS_Store)
```

`stoppy.html` and the `stoppy/` folder sit side by side: Cloudflare serves `/stoppy` from `stoppy.html` and `/stoppy/privacy` from the folder. Don't add `stoppy/index.html`.

`/stoppy/get` is the link for social profiles and bios; Stoppy's short videos end with "Link in bio". An inline script at the top of its `<head>` sends iPhones and iPads to the App Store, Android phones to Google Play and everything else to `/stoppy`, before anything else loads. `?from=youtube` (or `instagram`, `tiktok`, `facebook`) becomes `utm_source` on the Google Play link, so Play Console can split store visits by platform (Store performance → Listing conversion analysis, UTM source). The App Store link gets the same tag as a campaign (`ct`) once `PT` in the script holds the account's provider token from App Store Connect. The page is `noindex` and stays out of the sitemap. Its card, with both badges and the trademark line, only shows if the redirect can't run.

## Development

There's no build step. Pages are plain HTML with the shared CSS and scripts, plus a `<style>` block for styles only that page uses. Asset URLs are absolute (`/assets/...`), so preview from the site root with a server that maps `/games` to `games.html` the way Cloudflare does (for example `npx serve .`). Python's `http.server` doesn't, so `/stoppy` 404s there. The GitHub Pages mirror at propereleven.github.io/website serves from a subfolder and won't load the assets; propereleven.com is the real site.

Check every change at phone width (390 px) and desktop width, with motion and with reduced motion, and check that nothing scrolls sideways. For anything that moves, also check it on a phone or with Chrome's phone emulation and CPU throttling (see "Speed").

## Design

- **Night and ember.** Dark, lit backgrounds (`--night-*`), warm white text, and ember light from the logo's two bars. Tokens are at the top of `site.css`. Product pages and sections keep their product's look: Sagazo's warm whites, red (`#ff2442`, `#e01030` under white text), gold and Figtree; Stoppy's sky, Fredoka and art. Both product pages use a light page with `site-header on-light`, and the P.E.T footer stays dark.
- **Type.** Clash Display (by the Indian Type Foundry, from Fontshare) for headlines, the wordmark and statements; Schibsted Grotesk (Google Fonts) for reading and interface. Product pages use the product's own face for their content: Fredoka on the Stoppy and games pages, Figtree on the Sagazo page. The owner turned down Bodoni Moda on 9 November 2026 ("I dont like heading font"). Clash Display loads from Fontshare's CSS API: its licence (ITF Free Font License) allows commercial websites but limits redistribution, so don't copy the font files into this public repo.
- **The mark** is two ember bars, the "11" of Proper Eleven (`.mark`, `favicon.svg`). It returns at every scale: the header, the home page's intro, the 3D monoliths of the home hero and the footer's giant wordmark.
- **The intro** (the gate, `.gate` in `index.html`) is the home page's alone. Two dark halves stand closed at the first paint, each carrying one glowing bar; the bars light up and the halves slide apart, in about two seconds. It plays the first time the home page opens in a visit (sessionStorage `pet-intro`, set by the inline script in the page's `<head>`) and never with reduced motion. It's CSS only, so it starts with the first paint and stays smooth while scripts load; `site.js` reads its progress to time the hero's rise and removes it at the end. Until 11 November 2026 the gate also closed and opened between every page, which held each click for over a second; the owner asked for pages to open instantly ("Only keep it for home page"), so don't bring page transitions back.
- **Reveals** are attributes that `site.js` animates: `data-split` (headings rise line by line behind masks), `data-reveal` (fade up), `data-words` (a statement lights up word by word as you scroll), `data-parallax`. They're for content further down the page. The first screen of every page shows at the first paint: no reveals there, and `site.js` shows any reveal that's on screen when the page opens without animating it. The `-open` variants are only for the home hero, which rises with the intro and is simply there when the intro doesn't play. Content is hidden only while `html.motion` is set and the script hasn't taken over, with a CSS fallback, so nothing stays invisible if a script fails.
- **The home hero** (`gate.js`) is a Three.js scene: two obsidian monoliths with light lines on their inner edges, a beam between them, embers, mist, a starry dusk sky, bloom and a finishing pass. The hero is one screen tall and scrolls away normally. As it goes, the camera pushes in and the stage lags behind the scroll, and the next section (its own background and a rounded top) slides up over it. Don't pin it or fade it to black again: on 9 November 2026 the owner found the earlier 250svh pinned version slow, and its dark stretch looked like something was broken. It starts when the page is idle and builds all its shaders before the first frame with a compile-only pass (`precompile()` in `gate.js`), so the browser compiles them in the background (`KHR_parallel_shader_compile`). Without that, a first visit froze the page for over a second while the first frame compiled 22 shader programs. Phones (a touch screen under 700 px) render at 1.25× pixel ratio with fewer embers and less mist, and draw 30 frames a second while the page is still. It never draws more than 60 a second, drops to 1× pixel ratio on slow devices, pauses off screen, renders one still frame for reduced motion, and the page shows a CSS glow if WebGL is missing. Keep the light restrained: when bloom or light levels rise with the scroll, the pillars turn into a blurred wall of light.
- **Layered scenes** (`scene.css`, `scene.js`): every layer sits on a 16:9 stage that covers its box (container units), so the layers stay aligned. Portrait boxes use a wider stage nudged left to keep Stoppy in frame. Each layer has separate wrappers for the scroll, the pointer and the CSS bobbing (`.scene__layer`, `.scene__drift`, `.scene__float`), because a CSS animation overrides a script's transform on the same element. The scene is in place from the first paint; only the scroll and the pointer move it.
- **The home page's games section** is the heading, the line and the button, then a quiet row of five small worlds (`.worlds`, three on phones) on the night background. It used to be a full-screen window into Stoppy's world that opened as you scrolled; the owner found it overkill on 11 November 2026 ("Use something subtle"), so keep it small.
- **Store badges** are the stores' own artwork in `assets/img/badges/`, unmodified: Apple's from its marketing toolbox, and `google-play.svg`, the English "Get it on Google Play" SVG from Google's Partner Marketing Hub (Google Play, Lockups, icons and badges; downloaded 10 November 2026). Stoppy is on both stores (Google Play since November 2026), so the badges sit side by side in `.store-badges` and follow both stores' rules: Apple's black badge comes first (Apple asks for black, not white, whenever another store's badge is shown), Google's is the same height (Google asks for the same size or larger), and a quarter of the badge height stays clear around each. Heights are 54 px, 58 px on the Stoppy page and 46 px below 480 px wide, so both fit on one line on a 360 px phone (minimums: Apple 40 px, Google 28 px). Links: https://apps.apple.com/app/id6832074174 and https://play.google.com/store/apps/details?id=com.propereleven.stoppy. Pages that show the badges end with Apple's and Google's trademark credit line; Apple asks for one wherever its trademarks appear.

## Speed

Pages must open instantly and scroll without lag on phones (owner's request, 11 November 2026). Measured then with phone emulation and the CPU slowed 4×: a click to the next readable page went from about 2.5 s to 0.13 s once the gate transitions went.

- Links load the next page straight away. Don't hold a click for an animation.
- Nothing on the first screen waits for a script or a font to appear. Hero animations other than the home intro were removed for this.
- Touch screens keep the browser's own scrolling: `site.js` starts Lenis only for a mouse or trackpad, because its touch listeners aren't passive and make every swipe wait for the page's scripts.
- On touch screens (`pointer: coarse`) there's no film grain (a blended full-screen layer) and no blur behind the header, and the scenes' blurred rays and bokeh stay still.
- Don't put a CSS filter (blur, drop shadow) on an element that also animates: the filter is redrawn on every frame. Animate a wrapper and keep the filter on the element inside it, or keep it still on touch screens.
- Don't animate `clip-path` or full-screen effects with the scroll.
- Pages without reveals (the policies, terms and support) load only Lenis and `site.js`, not GSAP.

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
- **Stoppy facts** come from the game and its store listings (`stoppy/store/app-store-listing.md` and `stoppy/store/play-listing.md` in the games repo): 50 levels in five worlds with 10 each, what each world adds, 25 awards, the daily puzzle (Mondays gentle, Sundays tough), challenges, the wardrobe, three lives and three undos, hints paid with points, offline, no sign-in, iOS 15 or later and Android 7.0 or later (`minSdkVersion` 24 in `stoppy/android/variables.gradle`). Age ratings: 4+ on the App Store; Google Play shows Everyone in the US and "Rated for 3+" in India (read from the live listing on 10 November 2026), and other labels elsewhere. When the game changes, update `stoppy.html` and `games.html` with the listings.
- **Platform names:** Apple's marketing rules ask for Apple products to be named first, so write "iPhone, iPad and Android".
- **Stoppy's privacy and price claims:** the Stoppy and games pages say there are no ads and nothing to buy, that it plays offline and that progress stays on the device. If ads, purchases or analytics arrive, change those lines together with the privacy policy, the terms and the support page (the games repo's `stoppy/CLAUDE.md` has the full list).
- **Stoppy wording to avoid:** the tagline "Walls are your brakes" (the owner finds it cringy), "roll the ball", "maze", "sliding puzzle", IQ or brain-training claims, and "for kids". Describe what the game asks of you (planning, thinking ahead) rather than promising it improves anything.
- **Sagazo lines** follow Sagazo's settled copy and its content checklist (`docs/content-checklist.md` in the Sagazo repo). The sources are Sagazo's `/llms.txt` (`lib/sagazo_web/controllers/llms_controller.ex`), its About page (`priv/pages/en/about.md`) and the seller page's copy (`lib/sagazo_web/live/sell/copy.ex`).
  - "A social commerce app where India shares and shops". The feed ranks posts by how new and how active they are. A post can carry photos, a poll, a product from the author's shop, a link preview or a circle card. Circles have their own feed, member list and group chat, and are public or private. Every account is tied to a verified phone number, and moderators look at every report. The buttons and menus are in English, हिंदी, తెలుగు and தமிழ் (Sagazo's own labels).
  - For sellers: opening a shop is free, with no commission, no listing fee and no monthly charge, so a ₹700 sale pays ₹700. The only deduction is the TCS the law requires from GST-registered shops. Shops are verified before their products show to buyers. The eight free tools go by the names on sagazo.com/tools.
  - Keep the commission line in seller-facing sections and out of meta descriptions.
  - Checkout on Sagazo isn't open yet: don't say people can buy there today, don't promise dates, and leave delivery out until it's live (if delivery is ever mentioned, Sagazo's settled line says both ways in one sentence).

## Images and video

- Stoppy's key art (`assets/img/stoppy/key-*.webp`, `key-wide-*.webp`, `tall.webp`, `og.jpg`) comes from `stoppy/store/app-store/search-results.png` and `header.png` in the games repo.
- The world islands (`assets/img/stoppy/worlds/1-5.webp`), `prickle.webp` and the phone screens (`assets/img/stoppy/screens/`) were rendered from the running game on 9 November 2026: transparent 3D captures with the sky hidden, and screens from a mid-game save built with the game's own progress code. `worlds/1-480.webp` to `5-480.webp` are the same islands at 480 px wide for the home page's row (ImageMagick, WebP quality 84).
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
