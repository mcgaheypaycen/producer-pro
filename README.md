# Producer Pro

A standalone Windows desktop app for producers of cabaret-style shows. Manage your roster of performers, venues, and acts; build show lineups; generate show packages (media files + RTF run sheet); and settle the books when the curtain falls.

## Features

- **Shows** — Create a show, pick the venue, set the ticket price, and build the running order from performer acts and segments (host welcome, games, announcements, etc.). Reorder with one click.
- **Acts library** — Each act stores performer, aesthetic, length, lighting notes, stage notes, tagline, and an attached media file (audio or video). Acts are reusable across shows and searchable.
- **Performers roster** — Stage name, legal name, email, phone, payment method, and payment handle (Venmo, CashApp, PayPal, etc.). Searchable.
- **Venues** — Name, address, contact, capacity, notes. Searchable.
- **Create Show** — One click builds a folder containing every media file named `[POSITION IN SHOW] [PERFORMER NAME] [ACT NAME]` plus an RTF run sheet listing every act and segment in order with performer name, act name, tagline, lighting notes, and stage notes.
- **Close out** — After the show, record money in by source (Venmo, Eventbrite, door cash…), expenses and what they were spent on, what each performer was paid and how, and tickets sold. Live profit math, then close the show out.
- **Past shows** — Revisit any closed show and export a settlement CSV (who was paid what, expenses, ticket sales, revenue, net profit).

## Running the packaged app

Grab `release/ProducerPro.exe` — it's a portable, standalone executable. Double-click to run; no install needed. Your data is stored in `%APPDATA%/producer-pro/producer-pro-data.json`.

## Development

Requires Node.js 18+.

```bash
npm install        # install dependencies
npm start          # build the UI and launch the desktop app
npm run dev        # vite dev server (browser preview with mock data)
npm run dist       # build the portable exe into release/
```

## Tech stack

- [Electron](https://www.electronjs.org/) — desktop shell, file dialogs, file system access
- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) — UI
- JSON file storage with atomic writes (no database server needed)
- [electron-builder](https://www.electron.build/) — portable exe packaging

## Project layout

```
electron/        main process: window, IPC, storage, show package + CSV generation
  main.js
  preload.js     context-isolated bridge exposed as window.api
  store.js       JSON collection store (performers, venues, acts, shows)
  showExport.js  show folder + RTF run sheet + settlement CSV builders
src/             React renderer
  pages/         Shows list, Show editor, Close-out, Performers, Acts, Venues
  ui.jsx         shared components (modals, toasts, fields)
  data.jsx       data context over the IPC bridge
```
