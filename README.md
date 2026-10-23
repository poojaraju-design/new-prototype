# Evolko AI — Daily Care

A standalone React + TypeScript patient check-in prototype, ready to put in your own Git repository and deploy to Render.

## About this package

This is a **fresh reconstruction from the design and implementation history**, prepared after the earlier working folder became unavailable. It is not a byte-for-byte backup of that folder. The source, image asset, tests, dependency lockfile, and deployment configuration are all included. There are no dependencies on Codex or on absolute paths from the original computer.

The visual comparison buttons are **01 · Panel**, **02 · Open**, **03 · Labeled**, **04 · Evolko**, and **06 · Warm**. Version 4 uses the supplied Evolko logo, neutral surfaces and navy accents. Version 6 uses warm white surfaces with navy text and orange actions. All variants share the same session flow. Version 5 was removed. The app opens on version 1.

## Run locally

Use Node.js **22.12 or newer within Node 22**, or Node 24. The `.node-version` file selects the Node 22 series on Render.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/**. Keep the terminal running while using the prototype.

```sh
npm test
npm run build
npm run preview
```

The production build is written to `dist/`. Preview opens on port 4173. The tests exercise ordered progression in both modes, skipped and completed sessions, carousel-only mode selection, draft cancellation, device-only vitals and stale-reading follow-up, reports/reminders, and local attachment messages.

## Put it in Git

Extract the ZIP. Make the **contents of the `evolko-daily-care` folder** the repository root: `package.json`, `package-lock.json`, `render.yaml`, and `src/` should be visible at the top level. Upload or commit these files to your own repository. Keep the hidden `.gitignore` and `.node-version` files too.

Do not commit `node_modules/`, `dist/`, local environment files, or personal data. They are excluded by `.gitignore` and are not included in this ZIP.

## Deploy on Render

### Option A — Static Site

1. Push the extracted project to your Git repository.
2. In Render, choose **New → Static Site** and connect that repository.
3. Select the branch you pushed.
4. If the project is at the repository root, leave **Root Directory** blank.
5. Set **Build Command** to `npm ci && npm run build`.
6. Set **Publish Directory** to `dist`.
7. Create the Static Site.

If you upload the whole `evolko-daily-care` folder inside a larger repository instead, set **Root Directory** to `evolko-daily-care`.

For single-page-app fallback, add a rewrite in Redirects/Rewrites:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

### Option B — Blueprint

In Render, choose **New → Blueprint** and connect your repository. Render reads the included `render.yaml`. The YAML already specifies a static site, the build command, `dist`, and the fallback rewrite. Keep `render.yaml` at the repository root for this option.

**No API keys, backend server, start command, database, or paid web service are needed for this frontend prototype.**

Official deployment references: [Render static sites](https://render.com/docs/static-sites), [Blueprint reference](https://render.com/docs/blueprint-spec), [SPA rewrites](https://render.com/docs/redirects-rewrites), [Node version selection](https://render.com/docs/node-version).

## Included experience

- Health radar with five cues; version 1 reveals compact names from the inner point outward, retaining earlier names.
- Hover/focus emphasis with an arrow inside each name label.
- An ordered session queue drives the five-card carousel. Cards provide context and cannot change the sequence. Device-filled bundles are bypassed; the next eligible bundle opens automatically after a four-second carousel interval.
- Hands-free and Tap to answer are selectable only in the fully visible carousel; each selection restarts the four-second interval. Back from an active bundle retains submitted answers, skips the rest for this session, and advances automatically. Exiting hands-free switches to tap; exiting tap stays in tap. Completed bundles retain their mode. A final summary distinguishes completed, skipped, and device-filled bundles. The queue is local prototype data; no backend is connected.
- Joints & Movement first, then Medications. Vitals groups blood pressure and temperature as device-only readings and is bypassed by the question sequence. Sleep & recovery and Nutrition remain separate bundles.
- Four scripted assistant/patient turns in hands-free mode. No microphone, speech recognition, or real voice service is used.
- No manual temperature or blood-pressure questions. Vitals displays sample values, units, device names and reading timestamps. Session records preserve their own device-reading snapshots.
- Weekly report history, visible three-week charts, and sample summary details.
- Nurse messaging separate from the AI check-in; compact photo/name profile, text composer, photo/file pickers, removable attachment drafts, and downloadable message attachments.
- Reminders that open the corresponding bundle or weekly report, separate unread badges, and mark-as-read.
- Light/dark settings, transcript preference during active hands-free check-ins, and reduced-motion styling.

## Prototype data and limits

This is a demonstrator, not a connected clinical application. Answers, drafts, attachments, messages, unread state, and preferences stay in browser memory and reset on reload. Message bubbles explicitly show that local messages are not sent. “Secure chat” is the screen's product name; authentication, encryption infrastructure, nurse delivery, real notifications, and server-side uploads are **not implemented**. Reports and trend measurements are illustrative sample data, not inferred clinical results. No clinical interpretation is provided.

The image in `public/images/nurse-portrait.jpg` is an AI-generated fictional nurse portrait, produced with the built-in imagegen tool and optimized to 256 × 256 pixels. See its accompanying prompt file.

## Palette comparison for later

Version 1 remains the original palette. Version 4 and Version 6 are implemented brand alternatives; the earlier proposed lavender concept is not a selectable version.

| Version | Palette | Background | Primary accent | Feel | Status |
| --- | --- | --- | --- | --- | --- |
| **1 — current** | **Blue-grey & navy** | `#F4F7F8` | `#17364B` | Calm, clinical, familiar | Current visual direction |
| 4 | Evolko blue | `#F7FAFF` | `#003B8A` | Brand navy, ice blue, orange accents | Implemented |
| 5 | Lavender & pearl | `#F8F6FB` | `#55456F` | Soft, welcoming | Concept |
| 6 | Evolko warm | `#FBFAF7` | `#FF9A12` | Warm white, navy and orange | Implemented |

## Project structure

```text
src/main.tsx             App screens, local state, interactions
src/data.ts              Bundles, questions, history, and reusable data helpers
src/style.css            Responsive phone preview and both themes
public/images/           Generated nurse portrait and provenance
index.html               App entry point
package.json             Pinned dependencies and run/build/test scripts
package-lock.json        Reproducible npm installs
render.yaml              Render Static Site Blueprint
.node-version            Node major version used for Render builds
.gitignore               Excludes dependencies, build output, secrets, and logs
tests/                   Deterministic app-flow and data tests
```

### Wellbeing introduction

Start check-in opens a scripted hands-free greeting before any bundle. The sample patient reply is defined in `wellbeingDemo` in `src/data.ts`. After that reply, `getDemoSessionPlan` simulates the backend decision and supplies the ordered queue. The default reply uses the default patient order; explicit sleep and refill fixtures demonstrate alternative orders. These fixtures do not perform clinical triage. As with the existing hands-free demo, no actual speech recognition, audio service, or backend is connected. The greeting is remembered within the in-memory session and is not repeated on continuation.

### My records

The home shortcut opens My records with Sessions and Weekly reports tabs. Sessions are stored in memory when a session reaches its final summary, including early exits. Completing remaining answers updates the same record. Starting a fresh check-in preserves earlier records until the page is refreshed. Records include independent answer snapshots and read-only detail pages. Reviewed and awaiting-review samples demonstrate nurse feedback; live preview records are marked Awaiting review for demonstration only. No nurse submission, server storage, or real review service is connected. Weekly report notifications open the report directly and Back returns to the Weekly reports tab. The final session summary still closes directly to home.

### Version 4 brand theme

Version 4 uses colors verified from https://www.evolko.com/us/css/theme.css: navy gradient `#00112A`–`#003B8A`, blue `#164893`, light surfaces `#F7FAFF` and `#E0EDFF`, and orange `#FF9A12`. Every theme override is scoped to `.version-4`. The supplied logo is copied unchanged to `public/images/evolko-logo.png` and appears in versions 4 and 6. Green remains a semantic completion color. Versions 1–3 retain their previous logos and colors.

### Local GitHub checkout

The latest source is copied into the cloned repository without changing its Git history. Install using Node 22.12+ or Node 24: `npm ci`, then run `npm test` and `npm run build`. Development uses `npm run dev` on port 5173. The app remains a frontend demo with in-memory state; refreshing the page clears session records, profile edits, and local messages. Profile editing supports local photo previews.

### Device-reading follow-up

Freshness is a boolean supplied by the device/backend fixture, not a clinical age threshold calculated by the UI. The explicit scripted reply “I feel a fever coming on.” triggers a thermometer request only when temperature is stale or missing. The demo then exposes a clearly labelled simulated thermometer event; there is no field for entering a temperature. A fresh temperature needs no repeat reading. No physical device integration or clinical triage service is connected.
