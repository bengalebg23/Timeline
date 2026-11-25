# Family Timeline

Zoomable family timeline (Years → Months → Weeks) for looking back and planning ahead. The app lives in `app/`. The root `index.html` only redirects there, and the root `sw.js` is a retired worker that unregisters itself.

Live: https://bengalebg23.github.io/Timeline/app/

## How Ben works
- Ben works from his phone. He asks for changes in chat and Claude pushes them straight to the deploy branch. There's no local build and no pull-request review.
- Pushing to `main` deploys via GitHub Pages within a minute or two.
- The repo is **public**. Never commit secrets, API keys meant to stay private, family photos or personal data.

## Every release
- Bump `VERSION` in `app/index.html` and `CACHE` in `app/sw.js` together.
- Keep `HANDOFF.md` up to date (version, what changed, open threads) if the repo has one.
- After pushing, give Ben the live URL and the new version number so he can check it on his phone.

## Code rules
- Single-file app: keep HTML, CSS and JS in `index.html`. No build step, bundler or npm packages.
- Pin exact CDN versions (no `@latest` or floating majors). A floating Babel major broke an app before.
- Self-review before pushing: duplicate `const`/`let` in one scope, variable shadowing inside loops, unclosed template literals, undefined references.
- Defer re-renders triggered inside click handlers with `setTimeout(..., 0)` to avoid detached-node bugs from bubbled events.
- Don't swallow Firebase errors with a bare `console.warn`. Surface them so permission problems are visible.
- UK English in all user-facing text.
- Bulk Firebase writes: use direct awaited `set()` calls. Debounced save helpers only keep the last write in a tight loop.
- Never let a fresh or cleared device overwrite cloud data on first load. Read the cloud first, merge, then write.

## This app
- `HANDOFF.md` is the full reference (data model, sync, merge rules). Read it before non-trivial changes.
- Data: IndexedDB working copy, synced to Firebase (own project, europe-west1) after sign-in. Only Ben's and Emily's UIDs can read/write (`database.rules.json`, pasted into the Firebase console by Ben). Newest `updated` wins per event, and deletes are tombstones.
- **Never commit family photos here.** The repo is public, and the `BUNDLED` array stays empty. Photos and new events go in through the private `bengalebg23/TimelineInbox` repo.
- Reads Tally's vault read-only for an optional filter. Never store decrypted Tally data, and keep the crypto in step with `bengalebg23/Tally`.
