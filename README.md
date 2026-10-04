# Helle AS

The Signatur redesign of helleas.no, built with Next.js / React. The site is statically rendered; the mobile menu, gallery, and bathroom scene use client JavaScript. It runs locally and deploys as static files, with enquiries handled by Netlify Forms.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open **http://localhost:3000**. The server listens only on the local machine.

To preview the production export instead:

```sh
npm run build
npm run preview
```

Run either the development server or the preview server, not both on port 3000.

## Design and client preview

Signatur is the selected design. The concept switcher is removed, and old concept URLs or saved preferences cannot change the design. The original drop-and-wrench symbol sits beside the lowercase **helle.** wordmark in the header and footer. `public/img/helle-drop.svg` reuses the original logo's vector artwork, with the original brand purple, `#663675`. The full original logo remains in `public/img/orig_logo.png`.

The client preview is live at **https://ny.helleas.no** on Netlify, separate from the existing site at helleas.no. Preview pages have `noindex, nofollow` metadata, robots.txt disallows crawling, and Netlify adds an `X-Robots-Tag` header. Remove these preview restrictions and update the metadata/sitemap URLs when moving to the main domain.

## Free hosting and contact form

The recommended host is the existing **Netlify Free Legacy** team `adriah`: 100 GB/month bandwidth, 300 build minutes/month, and 100 form submissions per site/month. Keep the legacy plan; switching to a credit-based plan is irreversible. Cloudflare remains the DNS provider. Existing Microsoft 365 MX/SPF records should not change.

The static preview uses Netlify project `majestic-valkyrie-24d57f` (ID `c3ddf53e-f611-4f09-946a-44af2f99c634`), also accessible at **https://majestic-valkyrie-24d57f.netlify.app**. Cloudflare's DNS-only CNAME for `ny` now points to that Netlify hostname, and HTTPS was verified on 4 October 2026. The public "Powered by Netlify" badge is disabled. The original production project remains `astounding-cajeta-611825` (`helleas.no`). The previous Vercel preview project is `helle-client-preview` in `helle-consulting`.

```sh
npm ci
npm run build
npm run typecheck
npm run test:e2e
```

Deploy the **contents of `out/`** through Netlify Drop or the Netlify CLI. `netlify.toml` also supports future Git builds using Node 22, with the Next.js server adapter disabled because this is a static export. `_headers` and `_redirects` are bundled in the output, including preview noindex headers and redirects from the removed `/hire` and `/hire.html` pages to the contact section.

Enable **Forms → Enable form detection**, then deploy again. `public/__forms.html` declares the form for Netlify's deploy scanner. The visible form sends URL-encoded POSTs to `/__forms.html`; without JavaScript, it uses a native POST and the `/takk.html` thank-you page. The form has a honeypot and uses Netlify's built-in spam filtering. Network errors retain the visitor's message and display telephone/email alternatives. No browser API keys or client mailbox credentials are needed.

The preview has an **Email notification** for `kontakt` to **adrian@helle.me** for testing, as requested. Before the client launch, change **Forms → Submission notifications** to **post@helleas.no**. The subject is “Ny førespurnad frå helleas.no”. The field named `email` makes Netlify set Reply-To to the visitor, so Anders can reply normally. On 4 October 2026, a live Safari submission was saved as a verified entry and Adrian confirmed receiving its notification email. Notifications come from `formresponses@netlify.com`; check spam/quarantine if a notification is missing. Local tests mock Netlify responses and cannot prove inbox delivery. A plain local static server or Vercel static deployment cannot process the form.

Before launching on the main domain, change the metadata/sitemap URLs and remove preview noindex restrictions in `app/layout.tsx`, `app/robots.ts`, and `public/_headers`. Keep the thank-you page and hidden form declaration out of search results. Verify submissions on the production Netlify project and configure its own notification (settings belong to the project).

## Previous Vercel deployment

The existing Vercel deployment can remain as a rollback during migration. Its original Cloudflare record is `CNAME ny → c219f902824d53c8.vercel-dns-016.com`, DNS only. Vercel also hosts an unrelated `knitapp` project; review that before cancelling the team's Pro plan. No Vercel billing changes have been made; the owner will handle cancellation.

## Scroll experience

The home page has a continuous, scroll-controlled 3D bathroom transformation. One room stays in view while its construction tells four chapters: the plan, hidden pipework and underfloor heating, surfaces and fixtures, and the finished everyday space. Tiles settle into place, walls rise, a purple vanity and ceramic bath arrive, and the shower and mirror lighting come on. The camera orbits gently with scrolling. There is no decorative progress graph.

The scene works on desktop and phones, supports scrolling in both directions, and has keyboard-accessible chapter buttons and a skip link to services. The Three.js module loads only as the section approaches the viewport. Geometry and materials are built locally without external model or texture requests. Rendering happens on scroll and resize, stops outside the section, and GPU resources are disposed when the scene is removed.

Short viewports, reduced-motion preferences, browsers without JavaScript, and unavailable or lost WebGL contexts receive four readable chapters with existing photography. Native scrolling is preserved throughout. Service cards and photography retain their staggered entrance effects, disabled for reduced motion. The 3D room is labelled as an illustration rather than a photograph of a completed customer project.

Recruitment content is removed. The primary contact buttons and service cards lead to the enquiry form. Phone and email remain available as alternatives.

## Structure

- `app/`: page routes, metadata, styles, sitemap, and robots file.
- `components/site.tsx`: shared site sections and interaction controls.
- `components/scroll-experience.tsx`: scroll story, reading progress, and entrance effects.
- `components/bathroom-scene.ts`: the locally generated 3D room, reversible assembly, lighting, and resource cleanup.
- `public/img/`: original business photos and icons.
- `tests/site.spec.ts`: browser checks for the selected design, responsive layouts, navigation, and gallery.
- `tests/contact.spec.ts`: form validation, submission, pending/error/success states, retry, and deploy registration checks.
- `out/`: generated static site after `npm run build` (ignored by Git).

Fonts are bundled locally through Fontsource. No analytics or advertising scripts are loaded by the new site. The old Jekyll source, duplicate assets, and unused libraries have been removed; they remain available in Git history. `public/img/` contains the photos, logo, and icons used by the new site. `AGENTS.md` and `CLAUDE.md` retain instructions for AI-assisted development. The new preview is separate from the original production deployment.

## Checks

```sh
npm run build
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

The browser tests start a local production preview if one is not already running. Build before running them. To use an already installed Chromium instead of downloading one:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/Applications/Chromium.app/Contents/MacOS/Chromium npm run test:e2e
```
