# Family Timeline — HANDOFF

Zoomable family timeline (Years → Months → Weeks) for looking back and planning ahead.
Live at https://bengalebg23.github.io/Timeline/app/ (the repo root redirects there).

## Architecture
- Single-file PWA in `app/`: `index.html` + `sw.js` + `manifest.json` + icons. No build step.
- Root `index.html` just redirects to `app/`; root `sw.js` is a retired worker that unregisters itself.
- Data is stored **on the device only** (IndexedDB `family-timeline`, store `events`). Not shared between devices or people yet.
- Small UI prefs in localStorage: `ft-filters`, `ft-scale`, `ft-seeded`, `ft-imported`, `ft-has-family`.
- Photos: compressed to max 1200px JPEG (q0.8) and stored as data URLs inside each event.
- Photo dates: read from EXIF DateTimeOriginal, falling back to Pixel file names (`PXL_YYYYMMDD_…`).
- Amazon Photos: link only (opens the album). Amazon has no usable public API, so nothing is read from the link.
- `BUNDLED` array in index.html: events added once from photos shared in chat (Reuben's 2nd birthday, Thomas Land, May 2022). Tracked by id in `ft-imported` so they don't come back after deletion.
- `EXAMPLES`: seeded once on first run, flagged `example:true`, removable from the banner or ⋯ menu.

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

## Open threads
- Check the photo picker and EXIF dates now it's on Pages (it failed inside the Claude app).
- Confirm exact dates for the May 2022 events and add the Amazon album link.
- Decide on sharing with Emily (Firebase RTDB, like the other apps). Photos would need Firebase Storage or staying local.
- Data from the Claude-app version doesn't carry over (different origin). Use Copy events / backup to move it.
