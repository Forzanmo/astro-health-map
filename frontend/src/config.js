// config.js: every setting in one place.
export const API_MODE = 'mock';                       // 'mock' while building, 'http' to ship
export const API_BASE_URL = 'http://localhost:8080';  // the Render URL in the final deploy, no trailing slash
export const POLL_MS = 1000;
export const FIRST_TIMEOUT_MS = 75000;                // the free server can take about a minute to wake
export const TIMEOUT_MS = 15000;
