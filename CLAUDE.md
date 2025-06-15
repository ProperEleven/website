# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the static HTML website for Proper Eleven Technologies, hosted at propereleven.com. It serves as the company landing page and product showcase, primarily featuring Pictura AI.

## Project Structure

```
website/
├── index.html              # Main company landing page
├── privacy.html            # Company privacy policy
├── pictura/                # Pictura AI product pages
│   ├── index.html          # Pictura AI product showcase
│   ├── privacy_policy.html # Pictura AI privacy policy
│   └── terms.html          # Pictura AI terms and conditions
├── app-store-icon.png      # iOS App Store button asset
├── play-store-icon.webp    # Google Play Store button asset
└── CNAME                   # GitHub Pages domain configuration
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
- **External Dependencies**: Only Font Awesome icons (loaded via CDN)
- **Hosting**: GitHub Pages with custom domain (propereleven.com)

## Key Design Patterns

- **Card-based Layouts**: Main content organized in styled cards
- **Consistent Color Scheme**: Light background (#f5f5f7), dark text (#333)
- **Mobile-First**: Responsive design with specific mobile optimizations
- **App Store Links**: Direct links to Pictura AI on iOS/Android stores

## Important Notes

- This website is part of the Proper Eleven Technologies monorepo
- Changes pushed to main branch are automatically deployed via GitHub Pages
- The Pictura AI showcased here connects to the `phoenix_ai` backend service
- App store links should match the bundle identifiers defined in the parent CLAUDE.md