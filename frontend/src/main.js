// main.js: boot and wiring. The only place that catches ApiError.
import * as api from './api/index.js';
import * as store from './state/store.js';
import { startPoller } from './state/poller.js';
import { TEXT } from './constants.js';
import { setSelectedRegion } from './ui/selection.js';
import * as banner from './ui/banner.js';
import * as topBar from './ui/topBar.js';
import * as vitalsPanel from './ui/vitalsPanel.js';
import * as addReadingForm from './ui/addReadingForm.js';
import * as csvImport from './ui/csvImport.js';
import * as bodyFigure from './ui/bodyFigure.js';
import * as regionPanel from './ui/regionPanel.js';
import * as alertInbox from './ui/alertInbox.js';
import * as demoControls from './ui/demoControls.js';
import * as groundView from './ui/groundView.js';
import * as standTest from './ui/standTest.js';
import * as whyPopup from './ui/whyPopup.js';
import * as themeToggle from './ui/themeToggle.js';

const modules = [
  topBar, vitalsPanel, addReadingForm, csvImport, bodyFigure, regionPanel,
  alertInbox, demoControls, groundView, standTest, whyPopup, themeToggle
];

async function run(call, onFieldError) {
  try {
    const { state, result } = await call();
    store.setState(state);
    banner.clear();
    return result;
  } catch (err) {
    if (err.code === 'VALIDATION' && onFieldError) onFieldError(err.message);
    else banner.showError(err.message, boot);
    return null;
  }
}

function renderAll() {
  const state = store.getState();
  if (state) modules.forEach((m) => m.render(state));
}

const actions = {
  addObservation: (reading, onFieldError) => run(() => api.addObservation(reading), onFieldError),
  importCsv:      (csv)    => run(() => api.importCsv(csv)),
  setContext:     (change) => run(() => api.setContext(change)),
  triggerStorm:   ()       => run(() => api.triggerStorm()),
  resetDemo:      ()       => run(() => api.resetDemo()),
  shareAlert:     (id)     => run(() => api.shareAlert(id)),
  runStandTest:   async () => {
    const result = await run(() => api.runStandTest());
    if (result) standTest.play(result);
  },
  selectRegion:   (id)     => { setSelectedRegion(id); renderAll(); },
  openWhy:        (id)     => whyPopup.open(id)
};

async function boot() {
  banner.showWaking();
  await run(() => api.getState());
}

modules.forEach((m) => m.mount(document, actions));
store.subscribe((state, info) => {
  renderAll();
  if (info.restarted) banner.showNotice(TEXT.restarted);
});
startPoller(store, api, (err) => banner.showError(err.message, boot));
boot();
