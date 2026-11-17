// API tests: the HTTP layer, the envelope, CORS and the live stream. Run: npm test
process.env.CLIENT_URLS = 'https://vitalorbit.vercel.app,http://localhost:5173';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createApp } = require('../src/app');

let server; let base;
test.before(async () => { server = createApp().listen(0); await new Promise((r) => server.once('listening', r)); base = 'http://127.0.0.1:' + server.address().port; });
test.after(() => { server.closeAllConnections(); server.close(); });

const H = (id) => ({ 'X-Session-Id': id, 'Content-Type': 'application/json' });
const call = async (method, url, id, body) => {
  const res = await fetch(base + url, { method, headers: id ? H(id) : {}, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, headers: res.headers, json: await res.json().catch(() => null) };
};

test('A1-A3. health, session required, state', async () => {
  const h = await fetch(base + '/health'); assert.equal(h.status, 200); assert.equal(await h.text(), 'ok');
  const no = await call('GET', '/api/v1/state');
  assert.deepEqual([no.status, no.json.ok, no.json.error.code], [400, false, 'SESSION_REQUIRED']);
  const ok = await call('GET', '/api/v1/state', 'api-test-0001');
  assert.deepEqual([ok.status, ok.json.ok, ok.json.result, ok.json.state.alerts.length], [200, true, null, 3]);
});

test('A4. fresh state has every key of Example A at every level (the contract shape test)', async () => {
  const ex = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'exampleA.json'), 'utf8'));
  const { json } = await call('GET', '/api/v1/state', 'api-test-0002');
  const check = (want, got, where) => {
    if (Array.isArray(want)) { assert.ok(Array.isArray(got), where); if (want.length && typeof want[0] === 'object' && want[0] !== null) want.forEach((w, i) => check(w, got[i], where + '[' + i + ']')); return; }
    if (want && typeof want === 'object') Object.keys(want).forEach((k) => { assert.ok(got && k in got, where + '.' + k + ' is missing'); check(want[k], got[k], where + '.' + k); });
  };
  check(ex, json.state, 'state');
});

test('A5. two sessions do not see each other', async () => {
  await call('POST', '/api/v1/observations', 'api-test-000a', { metric: 'hr', value: 95 });
  const a = await call('GET', '/api/v1/state', 'api-test-000a'); const b = await call('GET', '/api/v1/state', 'api-test-000b');
  assert.equal(a.json.state.vitals[1].value, 95); assert.notEqual(b.json.state.vitals[1].value, 95);
});

test('A6. errors use the envelope', async () => {
  const bad = await fetch(base + '/api/v1/observations', { method: 'POST', headers: H('api-test-0003'), body: '{oops' });
  assert.equal(bad.status, 400); assert.equal((await bad.json()).error.code, 'VALIDATION');
  const v = await call('POST', '/api/v1/observations', 'api-test-0003', { metric: 'hr', value: 'abc' });
  assert.deepEqual([v.status, v.json.error.code, v.json.error.field, v.json.error.message], [400, 'VALIDATION', 'value', 'Value is not a number.']);
  const nf = await call('GET', '/api/v1/nope', 'api-test-0003');
  assert.deepEqual([nf.status, nf.json.ok, nf.json.error.code], [404, false, 'NOT_FOUND']);
  const na = await call('POST', '/api/v1/alerts/B-nope/share', 'api-test-0003', {});
  assert.deepEqual([na.status, na.json.error.code], [404, 'NOT_FOUND']);
});

test('A7. CORS: listed origin allowed with PATCH and X-Session-Id, other origins refused', async () => {
  const pre = (origin) => fetch(base + '/api/v1/context', { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'PATCH', 'Access-Control-Request-Headers': 'content-type,x-session-id' } });
  const ok = await pre('https://vitalorbit.vercel.app');
  assert.equal(ok.headers.get('access-control-allow-origin'), 'https://vitalorbit.vercel.app');
  assert.match(ok.headers.get('access-control-allow-methods'), /PATCH/);
  assert.match(ok.headers.get('access-control-allow-headers'), /X-Session-Id/);
  assert.equal((await pre('https://evil.example')).headers.get('access-control-allow-origin'), null);
});

test('A8. every endpoint returns the envelope with a full state', async () => {
  const id = 'api-test-0004';
  const calls = [
    ['GET', '/api/v1/state'], ['POST', '/api/v1/observations', { metric: 'phq2', value: 4 }],
    ['POST', '/api/v1/observations/import', { csv: fs.readFileSync(path.join(__dirname, '..', 'data', 'sample_device_export.csv'), 'utf8') }],
    ['PATCH', '/api/v1/context', { profile: 'LEO' }], ['POST', '/api/v1/demo/storm', {}], ['POST', '/api/v1/stand-test', {}],
    ['POST', '/api/v1/alerts/B-phq/share', {}], ['POST', '/api/v1/demo/reset', { scenario: 'problem' }],
    ['GET', '/api/v1/live'], ['GET', '/api/v1/regions/heart'], ['GET', '/api/v1/devices'], ['GET', '/api/v1/records?metric=hr&limit=3']
  ];
  for (const [method, url, body] of calls) {
    const r = await call(method, url, id, body);
    assert.equal(r.status, 200, method + ' ' + url); assert.equal(r.json.ok, true);
    assert.equal(r.json.state.vitals.length, 6); assert.equal(r.json.state.regions.length, 7);
  }
  const reg = await call('GET', '/api/v1/regions/heart', id);
  assert.equal(reg.json.result.metrics[0].metric, 'hr');
  assert.equal((await call('GET', '/api/v1/state', id)).json.state.context.scenario, 'problem');
});

test('v1.1 live stream: a state event first, then a live frame about every 100 ms', async () => {
  const events = await new Promise((resolve, reject) => {
    const got = [];
    const req = http.get(base + '/api/v1/stream?session=api-test-0005', { headers: { Origin: 'https://vitalorbit.vercel.app' } }, (res) => {
      assert.equal(res.statusCode, 200);
      assert.match(res.headers['content-type'], /text\/event-stream/);
      assert.equal(res.headers['access-control-allow-origin'], 'https://vitalorbit.vercel.app');
      let buf = '';
      res.on('data', (chunk) => {
        buf += chunk;
        let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const block = buf.slice(0, i); buf = buf.slice(i + 2);
          const ev = /event: (\w+)/.exec(block); const data = /data: (.*)/.exec(block);
          if (ev && data) got.push({ event: ev[1], data: JSON.parse(data[1]) });
        }
      });
      setTimeout(() => { req.destroy(); resolve(got); }, 1050);
    });
    req.on('error', (e) => { if (e.code !== 'ECONNRESET') reject(e); });
  });
  assert.equal(events[0].event, 'state'); assert.equal(events[0].data.alerts.length, 3);
  const live = events.filter((e) => e.event === 'live');
  assert.ok(live.length >= 8 && live.length <= 13, 'about 10 frames a second, got ' + live.length);
  assert.ok(typeof live[0].data.values.hr === 'number' && live[0].data.provenance === 'SIMULATED');
  assert.ok(new Set(live.map((e) => e.data.values.hr)).size > 3, 'the value moves');
  const noSession = await fetch(base + '/api/v1/stream');
  assert.equal(noSession.status, 400);
});
