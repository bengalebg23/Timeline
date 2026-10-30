# Family Timeline — HANDOFF

Zoomable family timeline (Years → Months → Weeks) for looking back and planning ahead.
Live at https://bengalebg23.github.io/Timeline/

## Architecture
- Single-file PWA: `index.html` + `sw.js` + `manifest.json` + icons. No build step.
- Data is stored **on the device only** (IndexedDB `family-timeline`, store `events`). Not shared between devices or people yet.
- Small UI prefs in localStorage: `ft-filters`, `ft-scale`, `ft-seeded`, `ft-imported`, `ft-has-family`.
- Photos: compressed to max 1200px JPEG (q0.8) and stored as data URLs inside each event.
- Photo dates: read from EXIF DateTimeOriginal, falling back to Pixel file names (`PXL_YYYYMMDD_…`).
- Amazon Photos: link only (opens the album). Amazon has no usable public API, so nothing is read from the link.
- `BUNDLED` array in index.html: events added once from photos shared in chat (Reuben's 2nd birthday, Thomas Land, May 2022). Tracked by id in `ft-imported` so they don't come back after deletion.
- `EXAMPLES`: seeded once on first run, flagged `example:true`, removable from the banner or ⋯ menu.

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
- v0.5.2 Manifest `id` + `start_url` set to `./?app=timeline-1` so Chrome offers a fresh install instead of "already installed" (same fix as Tally v1.8.3). Bump the number if it ever gets stuck again.

## Open threads
- Check the photo picker and EXIF dates now it's on Pages (it failed inside the Claude app).
- Confirm exact dates for the May 2022 events and add the Amazon album link.
- Decide on sharing with Emily (Firebase RTDB, like the other apps). Photos would need Firebase Storage or staying local.
- Data from the Claude-app version doesn't carry over (different origin). Use Copy events / backup to move it.
