# VitalOrbit backend

Node.js API and rules engine for the VitalOrbit prototype. The API is described in CONTRACT_V1.1.md.

- Run: `npm install`, then `npm run dev` (port 8080). Check `http://localhost:8080/health`.
- Test: `npm test` (25 tests: engine, API, CORS, live stream).
- Settings: `CLIENT_URLS` (frontend origins, comma separated, no trailing slash) and `PORT` (Render sets it).
- Deploy on Render: Web Service, root directory `backend`, build `npm install`, start `npm start`, health check path `/health`.
- All data is generated from a fixed seed and tagged SIMULATED. Nothing is stored on disk.
