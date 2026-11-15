// http.js: one function per endpoint of the contract.
import { request } from './client.js';

export const getState       = ()        => request('GET',   '/api/v1/state');
export const addObservation = (reading) => request('POST',  '/api/v1/observations', reading);
export const importCsv      = (csv)     => request('POST',  '/api/v1/observations/import', { csv });
export const setContext     = (change)  => request('PATCH', '/api/v1/context', change);
export const triggerStorm   = ()        => request('POST',  '/api/v1/demo/storm', {});
export const resetDemo      = ()        => request('POST',  '/api/v1/demo/reset', {});
export const runStandTest   = ()        => request('POST',  '/api/v1/stand-test', {});
export const shareAlert     = (id)      => request('POST',  '/api/v1/alerts/' + encodeURIComponent(id) + '/share', {});
