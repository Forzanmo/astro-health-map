// index.js: picks the real API or the mock. Every other file imports from here.
import { API_MODE } from '../config.js';
import * as http from './http.js';
import * as mock from './mock.js';

const api = API_MODE === 'mock' ? mock : http;

export const getState = api.getState;
export const addObservation = api.addObservation;
export const importCsv = api.importCsv;
export const setContext = api.setContext;
export const triggerStorm = api.triggerStorm;
export const resetDemo = api.resetDemo;
export const runStandTest = api.runStandTest;
export const shareAlert = api.shareAlert;
