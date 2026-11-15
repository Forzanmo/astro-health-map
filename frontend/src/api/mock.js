// mock.js: the same functions as http.js, answered from the contract fixtures. No health logic.
import { ApiError } from './client.js';
import { stateInitial } from '../fixtures/stateInitial.js';
import { stormAlert, stormRegion, stormEvent, stormGround } from '../fixtures/stateStorm.js';
import { leoContext, leoEscalation, phqAlert, sharedWho, standSummary, makeStandRows } from '../fixtures/extras.js';

const DELIVERY_MS = 2000;
const clone = (value) => JSON.parse(JSON.stringify(value));

let state = clone(stateInitial);
let stormAt = 0;

function reply(result = null) { return Promise.resolve({ state: clone(state), result }); }
function bump() { state.version += 1; }

function settleStorm() {
  if (!state.pending || Date.now() - stormAt < DELIVERY_MS) return;
  state.ground = state.ground.map((item) => ({ ...item, status: 'delivered' }));
  state.pending = false;
  bump();
}

export function getState() {
  settleStorm();
  return reply();
}

export function triggerStorm() {
  if (!state.alerts.some((alert) => alert.id === stormAlert.id)) state.alerts.unshift(clone(stormAlert));
  state.regions = state.regions.map((region) => (region.id === stormRegion.id ? clone(stormRegion) : region));
  state.context.events = [clone(stormEvent)];
  state.ground = clone(stormGround);
  state.pending = true;
  stormAt = Date.now();
  bump();
  return reply();
}

export function setContext(change) {
  if (change.profile === leoContext.profile) {
    Object.assign(state.context, leoContext);
    state.alerts = state.alerts.map((alert) => ({ ...alert, ...leoEscalation }));
    bump();
  }
  return reply();
}

export function addObservation(reading) {
  if (typeof reading.value !== 'number') {
    return Promise.reject(new ApiError('VALIDATION', 'Value is not a number.', 'value'));
  }
  const isPrivateScore = phqAlert.metrics.includes(reading.metric);
  if (isPrivateScore && !state.alerts.some((alert) => alert.id === phqAlert.id)) {
    state.alerts.push(clone(phqAlert));
    bump();
  }
  return reply({ added: 1 });
}

export function importCsv() {
  return reply({ added: 0, rejected: 0, errors: [] });
}

export function resetDemo() {
  const version = state.version + 1;
  state = clone(stateInitial);
  state.version = version;
  return reply();
}

export function runStandTest() {
  state.stand_test = clone(standSummary);
  bump();
  return reply({ ...standSummary, rows: makeStandRows() });
}

export function shareAlert(id) {
  state.alerts = state.alerts.map((alert) => (alert.id === id ? { ...alert, shared: true, who: sharedWho } : alert));
  bump();
  return reply();
}
