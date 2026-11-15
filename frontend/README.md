# VitalOrbit frontend

Static page (plain HTML, CSS, ES modules) that draws the `State` from the VitalOrbit API. No build step.
Run locally: `npx serve frontend -l 5173`, or `python -m http.server 5173` inside `frontend/`, then open `http://localhost:5173`.
Settings are in `src/config.js`: `API_MODE` is `mock` (contract fixtures) or `http` (real API at `API_BASE_URL`).
Deploy on Vercel with root directory `frontend`, framework preset Other, no build command.
Decision support and education prototype. Not a medical device. All demo data is SIMULATED.
