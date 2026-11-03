# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the static HTML website for Proper Eleven Technologies (P.E.T), hosted at propereleven.com: the company landing page, the company privacy policy and Stoppy's privacy policy.

## Project Structure

```
website/
├── index.html              # Main company landing page
├── privacy.html            # Company privacy policy
├── stoppy/
│   └── privacy.html        # Stoppy privacy policy, served at /stoppy/privacy (same text as stoppy/legal/privacy.html in the games repo)
├── app-store-icon.png      # iOS App Store button asset
└── play-store-icon.webp    # Google Play Store button asset
```

## Development Commands

Since this is a static HTML website, there are no build commands or dependencies. Development consists of:

```bash
# Serve locally for testing (using Python)
python3 -m http.server 8000

# Or using Node.js
npx serve .

# Or using PHP
php -S localhost:8000
```

## High-Level Architecture

- **Pure Static HTML**: No JavaScript frameworks or build process
- **Inline CSS**: All styling is embedded within HTML files
- **Responsive Design**: Media queries for mobile/desktop layouts
- **External Dependencies**: Google Fonts on `index.html` and Font Awesome icons on `privacy.html`, both from CDNs
- **Hosting**: a Cloudflare Worker named `pet-website` serves propereleven.com from this repo's files (static assets). GitHub Pages also builds the repo, at propereleven.github.io/website.

## Key Design Patterns

- **Card-based Layouts**: Main content organized in styled cards
- **Consistent Color Scheme**: Light background (#f5f5f7), dark text (#333)
- **Mobile-First**: Responsive design with specific mobile optimizations

## Important Notes

- This website is part of the Proper Eleven Technologies monorepo
- Each push to `main` makes Cloudflare build and deploy the `pet-website` Worker. If propereleven.com doesn't change after a push, read that build's log in the Cloudflare dashboard (Workers & Pages → pet-website).
- Pages are served without `.html`: `stoppy/privacy.html` is https://propereleven.com/stoppy/privacy.
- Don't add a `_redirects` file with full URLs, such as www to non-www. Cloudflare rejects the whole deploy ("Only relative URLs are allowed", code 100324) and the live site stops updating. Redirects between hostnames belong in a Redirect Rule in the Cloudflare dashboard.
- App store links should match the bundle identifiers defined in the parent CLAUDE.md