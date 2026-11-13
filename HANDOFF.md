# Family Timeline — HANDOFF

Zoomable family timeline (Years → Months → Weeks) for looking back and planning ahead.
Live at https://bengalebg23.github.io/Timeline/app/ (the repo root redirects there).

## Architecture
- Single-file PWA in `app/`: `index.html` + `sw.js` + `manifest.json` + icons. No build step.
- Root `index.html` just redirects to `app/`; root `sw.js` is a retired worker that unregisters itself.
- Data lives in IndexedDB `family-timeline`, store `events` (the working copy, so it works offline), and syncs to Firebase once signed in (see Cloud sync).
- Small UI prefs in localStorage: `ft-filters`, `ft-scale`, `ft-seeded`, `ft-imported`, `ft-has-family`.
- Photos: compressed to max 1200px JPEG (q0.8) and stored as data URLs inside each event.
- Photo dates: read from EXIF DateTimeOriginal, falling back to Pixel file names (`PXL_YYYYMMDD_…`).
- Amazon Photos: link only (opens the album). Amazon has no usable public API, so nothing is read from the link.
- `BUNDLED` array in index.html is now empty. Family photos must never be committed: the repo is public.
- `EXAMPLES`: seeded once on first run, flagged `example:true`, removable from the banner or ⋯ menu.

## Cloud sync (v0.10.0)
- Firebase project of its own (Timeline), RTDB europe-west1. Config goes in `FB_CONFIG` in index.html; while it's `null` the app is local-only and nothing is loaded.
- **Sign-in required.** Email/password users created in the Firebase console (Ben, Emily). Rules in `database.rules.json` allow only their UIDs to read/write `timeline/`. Paste that file into Console → Realtime Database → Rules.
- Layout: `timeline/events/<id>` (event without `img`, plus `imgHash`), `timeline/photos/<hash>` (the JPEG data URL, stored once, downloaded once per phone), `timeline/backups/daily/<date>` (events copy, once a day).
- Merge: newest `updated` wins per event. First sync never wipes: phone-only events go up, cloud-only events come down. Deletes become tombstones `{deleted:true, updated}`.
- Local queue: localStorage `ft-sync-dirty` = {id: time} for changes not yet in the cloud (negative time = delete). `ft-sync-photos` = photo hashes known to be uploaded.
- `dbPut/dbPutMany/dbDel` stamp `updated` and queue for sync. `rawPutMany/rawDelMany` write this phone only (used for examples, bundled events and changes coming down from the cloud).
- Example events never sync. Bundled events are stamped `updated:0` so an edit or delete from the other phone wins.
- Status: dot on the ⋯ button (green synced, amber saving/offline, red problem, hollow signed out). Errors show as a toast and in the menu with a Retry button.
- sw.js never caches firebaseio / firebasedatabase.app / googleapis requests (this also stops Tally's vault GET being served stale).
- Firebase JS SDK 10.12.0 (modular, dynamic import from gstatic), same as MealRota.

## Tally (secret filter, v0.7.0)
- Read-only. Tally is on the same origin, so Timeline reads Tally's `tally.vault` (PIN-wrapped key) and decrypts the newer of `tally.blob` and the Firebase copy (`vaults/<vid>.json`, REST GET).
- Decrypted sessions live in memory only; never stored, never in backups. Only Tally's shared `tally.fails` counter is written, so the wrong-PIN lockout applies here too.
- Colours: each picked tag gets one of 6 colours (tags are per group, keyed group id + tag). A session takes the colour of the first picked tag it carries; sessions with none are hidden from the dots (grey in the day list).
- Picked tags are stored in localStorage `ft-tally-sel` as AES-GCM {iv, ct} sealed with the Tally data key, so tag names never sit in plain storage. Default when nothing is saved: PIV and M-Orgasm (falls back to the two most-used tags).
- No vault on the phone → long-press does nothing, so the feature stays hidden.
- Depends on Tally's crypto (PBKDF2 310k SHA-256, AES-GCM, 16-byte vid + 32-byte key). If Tally changes that, update both.

## Event shape
`{id, title, cat: holiday|work|home|trip|family, start: YYYY-MM-DD, end, status: idea|planned|booked, notes, album, img, size: L|M|S, rank, updated}`

## Views
- Years: photo tiles placed by priority (size group, then rank), staggered sideways, nudged ±, then shrunk, then dropped into a "+N" chip per month.
- Months / Weeks: cards beside the axis; duration bars in up to 3 lanes; Today line.
- Priorities sheet (bars icon): drag to rank per year across Large / Medium / Small.

## Feature history
- v0.1.0 Timeline, zoom, filters, add/edit, Amazon link, cover photo, backup/restore.
- v0.2.0 Multi-photo pick; dates filled from photo metadata.
- v0.3.0 Family category; May 2022 events added.
- v0.4.0 Photo tiles at Years zoom; size + drag-to-rank priorities.
- v0.5.0 Moved to GitHub Pages as a PWA (manifest, icons, service worker).
- v0.5.1 Tapping the big cover photo in an event opens its Amazon Photos album.
- v0.5.2 Manifest `id` + `start_url` set to `./?app=timeline-1` so Chrome offers a fresh install instead of "already installed" (same fix as Tally v1.8.3). Didn't help on its own.
- v0.6.0 App moved into `app/` so Chrome sees a new scope, sidestepping a ghost "already installed" entry for /Timeline/. Data carries over (same origin).
- v0.7.0 Secret Tally filter: long-press the title, enter the Tally PIN, and Tally sessions show in a column on the right (count per month at Years, dots per day at Months/Weeks; tap for the list). Long-press again to lock; locks after 60 s in the background.
- v0.8.0 Tally view is now full width and replaces the events while it's on. Dots are coloured Masturbate / PIV / Other (legend in the filter row). Years: each month's sessions as a row of dots; Months/Weeks: dots placed across the width by time of day, with 06/12/18 guides.
- v0.9.0 Tally tag picker (Tags… chip): choose up to 6 tags, each with its own colour; defaults to PIV vs M-Orgasm. Selection is saved encrypted with the Tally key.
- v0.9.1 "Install app" button (beforeinstallprompt); Chrome's ⋮ menu install has been failing on Ben's Pixel.
- v0.10.1 Sync switched on (project timeline-7b9ae); Ben's login only so far.
- v0.10.0 Firebase cloud sync with sign-in (dormant until FB_CONFIG is filled in). Events and photos sync between phones; daily cloud backups.
- v0.10.2 Bundled family photos removed from the public app. They stay on phones and in the private Firebase copy.

## Open threads
- Check the photo picker and EXIF dates now it's on Pages (it failed inside the Claude app).
- Confirm exact dates for the May 2022 events and add the Amazon album link.
- Sync: Emily's login not created yet. Add her user, replace EMILY_UID in database.rules.json and paste the rules into the console again.
- Data from the Claude-app version doesn't carry over (different origin). Use Copy events / backup to move it.
- Family photos are still in the public repo's git history (commits before v0.10.2) until the history is squashed.
