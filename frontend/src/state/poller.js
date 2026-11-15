// poller.js: asks for State once a second while a timed change is on its way.
import { POLL_MS } from '../config.js';

export function startPoller(store, api, onError) {
  let busy = false;
  setInterval(async () => {
    const state = store.getState();
    if (busy || !state || !state.pending) return;
    busy = true;
    try { store.setState((await api.getState()).state); } catch (err) { onError(err); } finally { busy = false; }
  }, POLL_MS);
}
