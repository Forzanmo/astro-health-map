// Engine acceptance tests, plus the v1.1 additions. Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createEngine } = require('../src/engine');
const { builtInRows } = require('../src/engine/standTest');

function make(scenario) {
  const clock = { t: 1700000000000, nowMs() { return this.t; } };
  const engine = createEngine({ clock, scenario });
  return { engine, clock, state: () => engine.getState(), ids: () => engine.getState().alerts.map((a) => a.id),
    alert: (id) => engine.getState().alerts.find((a) => a.id === id), storm: () => { engine.triggerStorm(); clock.t += 1600; engine.getState(); } };
}
const region = (s, id) => s.regions.find((r) => r.id === id);
const card = (s, id) => s.vitals.find((v) => v.id === id);
const fails = (fn, code, field) => assert.throws(fn, (e) => e.code === code && (field === undefined || e.field === field));

test('1-2. seeded baseline: same on every start, 7 metrics from 28 readings', () => {
  const a = make().engine._baseline(); const b = make().engine._baseline();
  assert.deepEqual(a, b);
  assert.equal(Object.keys(a).length, 7);
  Object.values(a).forEach((x) => { assert.equal(x.n, 28); assert.ok(x.sd > 0); });
});

test('3-4. six vital cards and seven regions in contract order, every field present', () => {
  const s = make().state();
  assert.deepEqual(s.vitals.map((v) => v.id), ['bp', 'hr', 'glucose', 'temp', 'sleep_h', 'mood']);
  s.vitals.forEach((v) => {
    assert.ok(v.value !== null && v.unit && v.provenance === 'SIMULATED' && v.base_mean !== null && v.base_sd !== null && v.level);
    assert.equal(v.trend7d.length, 7);
    if (v.id !== 'bp') assert.deepEqual([v.value2, v.base_mean2, v.base_sd2], [null, null, null]);
  });
  assert.deepEqual(s.regions.map((r) => r.id), ['head', 'heart', 'lungs', 'metabolism', 'bones', 'mind', 'radiation']);
  assert.equal(region(s, 'head').level, 'NONE'); assert.equal(region(s, 'bones').level, 'NONE');
  assert.deepEqual(region(s, 'head').readings, []);
  assert.equal(region(s, 'radiation').level, 'OK');
});

test('5. start state matches Example A of the contract exactly', () => {
  const s = make().state();
  assert.deepEqual(s.alerts.map((a) => [a.id, a.level]), [['B-sleep', 'CAUTION'], ['B-co2', 'CAUTION'], ['B-vital-glucose', 'CAUTION']]);
  const ex = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'exampleA.json'), 'utf8'));
  ['vitals', 'alerts', 'ground', 'stand_test', 'pending'].forEach((k) => assert.deepEqual(s[k], ex[k], k));
  ex.regions.forEach((r, i) => Object.keys(r).forEach((k) => assert.deepEqual(s.regions[i][k], r[k])));
  Object.keys(ex.context).forEach((k) => assert.deepEqual(s.context[k], ex.context[k]));
});

test('6. CLAUDE.md step 1 check: order at 09:15 after the storm', () => {
  const x = make(); x.engine.setContext({ time: '09:15' }); x.storm();
  assert.deepEqual(x.ids(), ['B-flux', 'B-sleep', 'B-co2', 'B-vital-glucose']);
});

test('7-8. storm: S1 then S3 on one card, spacewalk conflict, radiation region', () => {
  const x = make(); x.engine.triggerStorm();
  let f = x.alert('B-flux');
  assert.deepEqual([f.level, f.rule_id, f.refired], ['ADVISORY', 'M1-b', false]);
  assert.equal(x.state().pending, true);
  x.clock.t += 1600;
  f = x.alert('B-flux');
  assert.deepEqual([f.level, f.rule_id, f.refired], ['WARNING', 'M1-c', true]);
  assert.deepEqual(f.conflict, { type: 'EVA', day: 142, time: '12:00' });
  const s = x.state();
  assert.equal(s.context.events[0].level, 'WARNING');
  assert.equal(region(s, 'radiation').level, 'WARNING');
});

test('9-12. fatigue, CO2 ladder, glucose and sleep rules', () => {
  const x = make();
  const sleep = x.alert('B-sleep');
  assert.deepEqual([sleep.rule_id, sleep.level, sleep.design, sleep.evidence_class], ['M2-a', 'CAUTION', true, null]);
  assert.equal(x.alert('B-co2').rule_id, 'M3-b');
  x.engine.setContext({ time: '09:15' }); assert.equal(x.alert('B-co2').rule_id, 'M3-b');
  x.engine.setContext({ time: '13:00' });
  const co2 = x.alert('B-co2');
  assert.deepEqual([co2.rule_id, co2.level, co2.refired], ['M3-a', 'WARNING', true]);
  x.engine.setContext({ time: '11:30' });
  const g = x.alert('B-vital-glucose');
  assert.equal(g.rule_id, 'V-1'); assert.match(g.note, /insulin resistance/);
  assert.equal(x.alert('B-vital-sleep_h'), undefined);
});

test('13-17. escalation and priority across profiles and link state', () => {
  const x = make(); x.engine.setContext({ time: '09:15' }); x.storm();
  let f = x.alert('B-flux');
  assert.deepEqual([f.escalation, f.reply_min, f.escalation_text], ['ask_ground', 40, 'Ask ground: reply in about 40 min']);
  x.engine.setContext({ time: '11:30' });
  f = x.alert('B-flux');
  assert.deepEqual([f.escalation, f.escalation_text, f.escalation_reason], ['act_onboard', 'Act onboard now', 'Earth cannot answer before the spacewalk at 12:00.']);
  assert.deepEqual(x.state().alerts.map((a) => a.priority), [13, 7, 3, 3]);
  x.engine.setContext({ profile: 'LEO' });
  f = x.alert('B-flux');
  assert.deepEqual([f.escalation, f.escalation_text, f.reply_min, f.level], ['ask_ground', 'Ask ground: reply in under 1 min', 0, 'WARNING']);
  assert.deepEqual(x.state().alerts.map((a) => a.priority), [12, 6, 3, 3]);
  x.engine.setContext({ profile: 'MOON' }); assert.equal(x.alert('B-flux').escalation, 'ask_ground');
  x.engine.setContext({ link_down: true });
  x.state().alerts.forEach((a) => assert.deepEqual([a.escalation, a.escalation_reason], ['act_onboard', 'The link to Earth is down.']));
});

test('18-20. ground queue, pending and version', () => {
  const x = make(); const v0 = x.state().version; x.storm();
  let s = x.state();
  assert.equal(s.ground.length, 1);
  assert.deepEqual([s.ground[0].alert_id, s.ground[0].status, s.ground[0].data_as_of, s.pending], ['B-flux', 'in_transit', 'Day 142 11:30', true]);
  const v1 = s.version; assert.ok(v1 > v0 + 1);
  x.clock.t += 6000; s = x.state();
  assert.deepEqual([s.ground[0].status, s.pending], ['delivered', false]);
  assert.ok(s.version > v1);

  const y = make(); y.engine.setContext({ link_down: true }); y.storm();
  assert.equal(y.state().ground[0].status, 'held_link_down');
  y.engine.setContext({ link_down: false });
  assert.equal(y.state().ground[0].status, 'in_transit');
  y.clock.t += 6000;
  assert.equal(y.state().ground[0].status, 'delivered');
});

test('21-22. typed readings against the personal baseline, and V-3 in flight', () => {
  const x = make(); const b = x.engine._baseline();
  x.engine.addObservation({ metric: 'hr', value: Math.round(b.hr.mean + 3.5 * b.hr.sd) });
  let s = x.state();
  assert.deepEqual([x.alert('B-vital-hr').rule_id, region(s, 'heart').level, card(s, 'hr').level], ['V-2', 'WARNING', 'WARNING']);
  const y = make(); const t = +(b.temp.mean + 2.4 * b.temp.sd).toFixed(1);
  y.engine.addObservation({ metric: 'temp', value: t }); y.engine.addObservation({ metric: 'temp', value: t });
  assert.equal(y.alert('B-vital-temp').rule_id, 'V-3'); assert.equal(y.alert('B-vital-temp').level, 'ADVISORY');
  assert.match(y.alert('B-vital-temp').note, /Stahn 2017/);
  y.engine.setContext({ phase: 'P7' });
  assert.deepEqual([y.alert('B-vital-temp').rule_id, y.alert('B-vital-temp').level], ['V-1', 'CAUTION']);
});

test('23. validation errors name their field', () => {
  const e = make().engine;
  fails(() => e.addObservation({ metric: 'hr', value: 'abc' }), 'VALIDATION', 'value');
  fails(() => e.addObservation({ metric: 'nope', value: 1 }), 'VALIDATION', 'metric');
  fails(() => e.addObservation({ metric: 'mood', value: 101 }), 'VALIDATION', 'value');
  fails(() => e.addObservation({ metric: 'phq2', value: 2.5 }), 'VALIDATION', 'value');
  fails(() => e.addObservation({ metric: 'hr', value: -1 }), 'VALIDATION', 'value');
  fails(() => e.setContext({}), 'VALIDATION');
  fails(() => e.setContext({ profile: 'PLUTO' }), 'VALIDATION', 'profile');
  fails(() => e.setContext({ day: 10 }), 'VALIDATION', 'day');
  fails(() => e.setContext({ time: '25:00' }), 'VALIDATION', 'time');
  fails(() => e.reset({ scenario: 'chaos' }), 'VALIDATION', 'scenario');
});

test('24-25. device CSV import', () => {
  const x = make();
  const sample = fs.readFileSync(path.join(__dirname, '..', 'data', 'sample_device_export.csv'), 'utf8');
  const r = x.engine.importCsv(sample + 'B,not_a_metric,5,x,,dev,SIMULATED\nA,hr,70,bpm,,dev,SIMULATED\n');
  assert.deepEqual([r.added, r.rejected], [3, 2]);
  assert.deepEqual(r.errors.map((e) => e.row), [5, 6]);
  assert.equal(card(x.state(), 'hr').level, 'CAUTION');
  fails(() => x.engine.importCsv('wrong,header\n1,2\n'), 'VALIDATION', 'csv');
});

test('26-27. stand test at landing', () => {
  const rows = builtInRows();
  assert.deepEqual(['supine', 'sit', 'stand'].map((p) => rows.filter((r) => r.posture === p).length), [30, 3, 19]);
  const stand = rows.filter((r) => r.posture === 'stand');
  assert.equal(stand[stand.length - 1].t_s - stand[0].t_s, 180);
  const x = make(); x.engine.setContext({ phase: 'P6' });
  const r = x.engine.runStandTest();
  assert.deepEqual([r.fired, r.hr_rise, r.sys_drop, r.dia_drop, r.readiness, r.rows.length], ['M4-a', 32, 8, 4, 'WARNING', 52]);
  const a = x.alert('B-stand');
  assert.deepEqual([a.escalation, a.escalation_reason, a.time_to_impact_min, a.priority], ['act_onboard', 'Earth cannot answer before the landing.', 0, 13]);
  assert.equal(x.state().stand_test.fired, 'M4-a');
  fails(() => x.engine.runStandTest([{ t_s: 0, posture: 'sit', hr_bpm: 60, bp_sys: 110, bp_dia: 70 }]), 'VALIDATION', 'rows');
});

test('28-31. privacy, sharing and reset', () => {
  const x = make();
  x.engine.addObservation({ metric: 'phq2', value: 4 });
  const p = x.alert('B-phq');
  assert.deepEqual([p.level, p.private, p.who], ['CAUTION', true, 'Only you can see this.']);
  x.engine.addObservation({ metric: 'mood', value: 5 });
  assert.equal(x.alert('B-vital-mood').level, 'WARNING');
  assert.equal(x.state().ground.length, 0);
  x.engine.shareAlert('B-vital-mood');
  assert.deepEqual([x.alert('B-vital-mood').shared, x.alert('B-vital-mood').who, x.state().ground.length], [true, 'Shared with the crew medical officer.', 1]);
  fails(() => x.engine.shareAlert('B-nope'), 'NOT_FOUND');
  const before = x.state();
  x.engine.reset();
  const after = x.state();
  assert.deepEqual(after.alerts.map((a) => a.id), ['B-sleep', 'B-co2', 'B-vital-glucose']);
  assert.equal(after.session_started_at, before.session_started_at);
  assert.ok(after.version > before.version);
});

test('32. no banned words and no em dashes in any health text', () => {
  const banned = /diagnos|detects depression|predicts fainting|—/i;
  ['normal', 'watch', 'problem'].forEach((sc) => {
    const x = make(sc); x.engine.setContext({ phase: 'P6' }); x.engine.runStandTest(); x.engine.addObservation({ metric: 'phq2', value: 5 });
    x.state().alerts.forEach((a) => [a.what, a.why, a.note || '', a.who, a.escalation_text, a.escalation_reason, ...a.do_now].forEach((t) => assert.ok(!banned.test(t), t)));
  });
});

// ---------------- v1.1 additions
test('v1.1 presets: normal is all fine, problem has three red findings', () => {
  const n = make('normal').state();
  assert.equal(n.alerts.length, 0);
  assert.equal(n.context.scenario, 'normal');
  n.regions.filter((r) => r.measured).forEach((r) => assert.equal(r.level, 'OK'));
  const p = make('problem'); const s = p.state();
  ['B-flux', 'B-co2', 'B-vital-hr'].forEach((id) => assert.equal(p.alert(id).level, 'WARNING', id));
  assert.equal(p.alert('B-flux').escalation, 'act_onboard');
  assert.equal(s.ground.length, 3);
  const x = make(); x.engine.reset({ scenario: 'problem' });
  assert.equal(x.state().context.scenario, 'problem');
});

test('v1.1 live signal: smooth, seeded, close to the stored reading, never changes a status', () => {
  const x = make(); const s0 = x.state(); const hr = card(s0, 'hr').value; const sd = card(s0, 'hr').base_sd;
  const seen = []; let prev = null; let maxStep = 0;
  for (let i = 0; i < 300; i += 1) {                                     // 30 s at 10 frames a second
    x.clock.t += 100;
    const f = x.engine.getLiveFrame();
    assert.equal(f.provenance, 'SIMULATED');
    assert.ok(Math.abs(f.values.hr - hr) <= 0.25 * sd + 0.02, 'stays within a quarter SD of the reading');
    if (prev !== null) maxStep = Math.max(maxStep, Math.abs(f.values.hr - prev));
    prev = f.values.hr; seen.push(f.values.hr);
  }
  assert.ok(new Set(seen).size > 100, 'the value keeps moving');
  assert.ok(maxStep < 0.4, 'no jumps between frames: ' + maxStep);
  assert.deepEqual(x.state().alerts.map((a) => a.id), s0.alerts.map((a) => a.id));
  assert.equal(x.state().version, s0.version, 'the live signal does not change the state version');
  const y = make(); y.clock.t = x.clock.t - 30000;
  for (let i = 0; i < 300; i += 1) { y.clock.t += 100; y.engine.getLiveFrame(); }
  assert.equal(y.engine.getLiveFrame().values.hr, x.engine.getLiveFrame().values.hr, 'same seed and time give the same trace');
});

test('v1.1 live signal glides to a new reading', () => {
  const x = make(); x.engine.getLiveFrame();
  x.engine.addObservation({ metric: 'hr', value: 95 });
  x.clock.t += 100; const first = x.engine.getLiveFrame().values.hr;
  for (let i = 0; i < 40; i += 1) { x.clock.t += 100; x.engine.getLiveFrame(); }
  const later = x.engine.getLiveFrame().values.hr;
  assert.ok(first < 80 && later > 93, first + ' then ' + later);
});

test('v1.1 region detail: what a click on the body returns', () => {
  const x = make();
  const d = x.engine.getRegionDetail('heart');
  assert.deepEqual(d.metrics.map((m) => m.metric), ['hr', 'bp_sys', 'bp_dia']);
  const hr = d.metrics[0];
  assert.ok(hr.live && typeof hr.live_value === 'number' && hr.device.name === 'Wearable band' && hr.device.simulated === true);
  assert.ok(hr.baseline_low < hr.base_mean && hr.base_mean < hr.baseline_high && hr.history.length >= 10 && hr.deviation_sd !== null);
  assert.deepEqual(d.rules.map((r) => r.rule_id), ['M4-a', 'V-3', 'V-1', 'V-2']);
  const mind = x.engine.getRegionDetail('mind');
  assert.deepEqual(mind.alerts.map((a) => a.id), ['B-sleep']);
  const head = x.engine.getRegionDetail('head');
  assert.deepEqual([head.measured, head.level, head.metrics.length], [false, 'NONE', 0]); assert.match(head.note, /eye ultrasound/);
  fails(() => x.engine.getRegionDetail('tail'), 'NOT_FOUND');
  assert.equal(x.engine.getDevices().length, 5);
  assert.ok(x.engine.getRecords({ metric: 'hr', limit: 5 }).length === 5);
});
