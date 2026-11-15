// client.js: the only file that talks to the API. Turns the envelope into { state, result } or an ApiError.
import { API_BASE_URL, FIRST_TIMEOUT_MS, TIMEOUT_MS } from '../config.js';
import { getSessionId } from './session.js';

export class ApiError extends Error {
  constructor(code, message, field = null) { super(message); this.code = code; this.field = field; }
}

let firstCall = true;

export async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), firstCall ? FIRST_TIMEOUT_MS : TIMEOUT_MS);
  const headers = { 'X-Session-Id': getSessionId() };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  try {
    const response = await fetch(API_BASE_URL + path, {
      method, headers, signal: controller.signal,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => null);
    if (!data || data.ok !== true) {
      const e = (data && data.error) || { code: 'INTERNAL', message: 'The server sent a reply we could not read.' };
      throw new ApiError(e.code, e.message, e.field ?? null);
    }
    firstCall = false;
    return { state: data.state, result: data.result };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('NETWORK', 'Cannot reach the server. Check the connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}
