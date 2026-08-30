# GNOSIS: Class Notes Repository

GNOSIS is a single-page, offline-friendly class notes dashboard for the ten theory and laboratory papers in the classroom.

## Run locally

From this folder, install the backend dependency and start the server:

```bash
npm install
npm start
```

Then open `http://localhost:3000` in a browser.

## GitHub Pages deployment note

GitHub Pages only serves static files. It cannot run the Express backend in this repo directly. To keep the project deployable on GitHub Pages, host the frontend on GitHub Pages and host the API on a separate backend service such as Render or Railway.

1. Deploy the static frontend to GitHub Pages.
2. Deploy the Node backend in this repo to Render/Railway.
3. Set `window.GNOSIS_API_BASE` in `config.js` to your deployed backend URL.

Example:

```js
window.GNOSIS_API_BASE = 'https://your-backend-url.onrender.com';
```

## Persistence choice

This version uses a lightweight backend with a shared file store. Notes and uploaded files are saved on the server, so they can be seen by anyone using the same website across different browsers and devices.

## Adding or changing subjects

Edit the `subjects` array near the bottom of `index.html`. Each entry needs a unique `id`, a display `name`, and either `type: 'theory'` or `type: 'lab'`; the grids and notes area update automatically.