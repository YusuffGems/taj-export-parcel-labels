# TAJ EXPORT – Wholesale Customer Management & Parcel Address Printing

An installable, offline-first web app (PWA) for managing wholesale customers and printing parcel address labels —
**two addresses per A4 page**. Built with Next.js (App Router), React, TypeScript, Tailwind CSS, Dexie (IndexedDB) and Lucide icons.
Customer data stays on your device; nothing is sent to a server.

## Quick start (Windows PowerShell)

Requires Node.js 20 or newer.

```powershell
npm install
npm run dev          # development: http://localhost:3000
```

Production build (needed for offline / install support):

```powershell
npm run build        # static export into ./out + offline service worker
npm start            # serves ./out at http://localhost:3000
```

Other scripts: `npm test` (unit tests), `npm run typecheck`, `npm run lint`.

> The service worker is only registered in the production build (`npm run build` + `npm start`), not in `npm run dev`.
> `./out` is a plain static site, so you can also host it on any HTTPS static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, your own server).

## Installing the app (PWA)

Browsers only offer installation on **HTTPS** (or `http://localhost`). To install on phones/tablets or other computers, host the `out` folder on an HTTPS site and open that address.

| Device | How to install |
|---|---|
| Windows / macOS (Chrome, Edge) | Click the install icon in the address bar, or menu → *Install TAJ EXPORT*. Opens in its own window. |
| Android (Chrome) | Menu ⋮ → *Install app* / *Add to Home screen*. |
| iPhone / iPad | Open in **Safari** → Share → *Add to Home Screen*. |
| macOS Safari | File → *Add to Dock*. |

This is an installable web app, **not** an App Store / Google Play app. The code is client-only and static, so it can later be wrapped (e.g. Capacitor) for store distribution.

## Using the app offline

1. Open the production site once while online (the service worker precaches every page and asset).
2. After that the app opens and works with no internet: add/edit/delete/search customers, print, import/export, backup/restore.
3. An *Offline* badge appears in the top bar when there is no connection.

## Screens

* **Dashboard** – four gradient KPI cards (Total Customers, States Covered, Districts, PIN Codes), a row of smaller stats (active, cities, added/updated in 7 days), state-wise distribution chart, recently added customers, and quick actions (*Add Customer*, *View Customers*, *Print Selected (n)*, *Import Customers*).
* **All Customers** – the *Customer Directory*: **Columns** picker (closed by default; click *Columns* to open it, *Done* to close; tablet/desktop only because phones show cards; your choice is remembered on the device), **Export** (CSV / Excel of the selection, or of the filtered list when nothing is selected), **Print Selected (n)** (opens the FROM-address dialog and A4 preview right there) and **Add Customer**. Filters: search, **A–Z letter bar** (pick *D* to see every customer whose name or shop name starts with D; letters with no customers are greyed out; *All* clears it), state, district, area, PIN, reset; sort; *Select all N filtered results* (works across pages); page size 10/25/50/100 with pager.
* **Print Addresses** – the same directory, intended for picking customers to print.
* Layout is responsive: sidebar on desktop, drawer on tablet/phone; the table scrolls horizontally on tablets and becomes cards on phones.
* Customer IDs are sequential (`CUS00001`, `CUS00002`, …) and are never reused after a delete. If a restored backup contains an ID that already belongs to a different customer, the restored customer receives a new ID.

## Managing customers

* **Customers → Add customer** (or *Quick add* on the dashboard). Only the name is required; mobile (10-digit Indian), PIN (6-digit) and GST (15-char) are validated when filled in.
* Possible duplicates (same mobile, or same name + PIN) trigger a warning with a *Save anyway* option.
* The list supports search (name, shop, mobile, city, district, state, PIN), state/city filters, sorting, pagination, single/page/all selection, view, edit and delete (always with confirmation).
* Customer pages use `/customers/view/?id=…` and `/customers/edit/?id=…` so the whole app can be a static, offline-capable export.

## Import and export

**Import** (*Import / Export* page): choose a `.csv` or `.xlsx` → match columns (auto-matched from common headings and from this app's own exports) → preview with per-row validation and duplicate detection → import. A downloadable error report lists rows that were skipped and why.
**Export**: all, selected or filtered (state/city) customers to CSV or Excel. Exported columns are exactly what the importer understands.

## Printing two addresses on one A4 page

1. **Printing** page (or *Print selected* on the Customers page): tick the customers — one, several, or *Select all*.
2. Click **Print selected** and choose the FROM address: default TAJ EXPORT address, a custom sender (optionally saved for next time), or no FROM.
3. Review the **preview** (selected count, A4 page count, sender, page-by-page navigation), then **Print / Save as PDF**.
4. In the browser print dialog choose: paper **A4**, **Portrait**, margins **None**, scale **100%**, **Background graphics** on. Pick *Save as PDF* as the printer to create a PDF.

| Customers | A4 pages |
|---|---|
| 1 | 1 page, 1 label |
| 2 | 1 page, 2 labels |
| 3 | 2 pages (2 + 1) |
| 4 | 2 pages (2 + 2) |
| 5 | 3 pages (2 + 2 + 1) |
| 10 | 5 pages (2 each) |

A single customer is never padded with an empty label. Long names/addresses wrap and the text size shrinks automatically so nothing is clipped. Label text size and the dashed cutting line can be changed in **Settings**.

## Backup and restore

Data lives only in this browser/device (IndexedDB) and is **not** shared between devices.
* **Settings** or **Import / Export → Download backup** saves a `.json` file with all customers and settings.
* **Restore from backup** offers *Merge* (default, keeps current data) or *Replace everything* (requires typing `REPLACE`).
* To move data to another device: back up on the old device, restore on the new one.
* Clearing browser data / uninstalling the app can erase customers — back up regularly.

### Migrating from an older version
If `localStorage` contains customers under `taj-export-customers-v1`, they are copied into IndexedDB automatically on first start. The original localStorage data is **never deleted**; it is only marked as migrated after every record is verified in IndexedDB.

## Troubleshooting printing

* **Two labels split across pages / extra blank page** – set scale to 100% (not "Fit to page"), margins to *None*, paper to A4.
* **Dashed line or borders missing** – enable *Background graphics*.
* **Wrong paper size** – choose A4 in the print dialog (Settings only records A4 as the default).
* **Nothing prints from an installed app on iOS** – use Share → Print, or print from Safari.
* **Text looks too large/small** – change *Label text size* in Settings.
* **Old version still showing** – close all windows of the app and reopen; the service worker updates on the next load after a new build.

## Project structure

```
app/                 routes (dashboard, customers, add, view, edit, printing, import-export, settings, about, manifest)
components/          layout, dashboard, customers, printing, import-export, settings, common
hooks/               use-customers, use-printing, use-selection, use-toast, use-install-prompt
lib/                 database (Dexie), customer-storage, validation, search, csv, excel, import, backup, print-layout, format
types/ constants/    shared types and constants (default sender address, fields, states)
scripts/             build-sw.mjs + sw-template.js (offline precache service worker)
public/icons/        PWA icons
tests/               vitest unit tests (validation, printing layout, storage/migration/backup)
```

## Tests

`npm test` runs 42 unit tests: validation, search/filter, CSV round-trip, import validation, A4 pairing for 1/2/3/4/5/10 customers,
server-rendered label sheets (labels per sheet, cut line, FROM on/off, long text), automatic font sizing, IndexedDB CRUD,
legacy-localStorage migration (original kept, idempotent, corrupt data ignored) and backup/restore (merge and replace).

## Known limitations

* Real browser Print Preview, "Save as PDF", PWA installation and the iOS/Android flows depend on the device and must be checked on your own machines (see checklist above).
* Data is per-device/per-browser; use backups to move it.
* `xlsx` (SheetJS 0.18.5 from npm) is used to read/write Excel; only import files you trust.
