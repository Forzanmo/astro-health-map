# Contract v1.1: additions for the frontend

Everything in contract v1.0 (Part 4 of both instruction files) still holds. Nothing was renamed or removed, so a v1.0 frontend keeps working. `contract_version` is now `"1.1"`.

## 1. Live stream (values move every 100 ms)

`GET /api/v1/stream?session=<session id>` is a Server-Sent Events stream. `EventSource` cannot send headers, so the session id goes in the query string here. It is the same id as `X-Session-Id`.

| Event | When | Data |
| --- | --- | --- |
| `state` | On connect, and every time `state.version` changes | The whole `State` |
| `live` | Every 100 ms | A live frame |

```js
// replaces state/poller.js
const es = new EventSource(API_BASE_URL + '/api/v1/stream?session=' + encodeURIComponent(getSessionId()));
es.addEventListener('state', (e) => store.setState(JSON.parse(e.data)));
es.addEventListener('live', (e) => drawLive(JSON.parse(e.data)));     // update numbers and scrolling charts only
```

A live frame:

```json
{ "seq": 412, "server_ms": 1794748000000, "interval_ms": 100, "version": 7, "pending": false, "provenance": "SIMULATED",
  "values": { "bp_sys": 119.42, "bp_dia": 78.61, "hr": 56.37, "temp": 36.912, "ppco2": 2.9931, "proton_pfu": 0.2143 } }
```

- Six metrics are live: `hr`, `bp_sys`, `bp_dia`, `temp`, `ppco2`, `proton_pfu`. A value is `null` when the metric has no reading.
- The live value is a smooth simulated sensor trace around the latest stored reading. Vitals stay within a quarter of the astronaut's own SD. When a new reading arrives (typed, imported or the storm), the trace glides to it in about a second.
- The live value never changes a level or an alert. Colours and alerts come only from `State`. Show the live number, and keep the tag `SIMULATED` next to it.
- Live values carry two more decimals than stored readings. Round them for display as you like.
- With the stream open you get every `State` change pushed, so the 1-second poller is not needed. Keep `GET /api/v1/state` for the first load and for Retry.
- Without `EventSource`, `GET /api/v1/live` returns one frame in `result`.
- If more than 60 streams are open the server answers `503` with code `BUSY`.

## 2. Body region detail (the click on the body figure)

`GET /api/v1/regions/{region_id}` returns the detail in `result`. Region ids are the 7 in contract 4.6.

```json
{ "id": "heart", "label": "Heart and circulation", "level": "OK", "measured": true, "note": null,
  "metrics": [ {
    "metric": "hr", "label": "Heart rate", "unit": "bpm", "value": 56, "provenance": "SIMULATED", "at": "Day 142 08:00",
    "live": true, "live_value": 56.37,
    "device": { "id": "wearable", "name": "Wearable band", "simulated": true },
    "base_mean": 61, "base_sd": 4.3, "baseline_low": 53, "baseline_high": 70, "deviation_sd": -1.2, "level": "OK",
    "history": [ { "at": "Day 128 08:00", "ts_utc": "2031-05-09T08:00:00.000Z", "value": 61, "provenance": "SIMULATED", "device": "wearable" } ]
  } ],
  "alerts": [],
  "rules": [ { "rule_id": "M4-a", "fires_when": "Heart rate rise of 30 bpm or more, ...", "level": "WARNING", "source": "Freeman 2011 consensus", "evidence_class": "GEN POP", "design": false } ],
  "baseline_band_note": "The baseline band is the pre-flight mean plus or minus 2 SD. It is our own choice (DESIGN)." }
```

- `metrics[].history` holds up to the last 24 in-flight readings, oldest first, for the trend chart.
- `baseline_low` and `baseline_high` are the band to draw behind the chart. Show the DESIGN note with it.
- `head` and `bones` have `measured: false`, no metrics, and a `note` to print.
- An unknown id returns `404 NOT_FOUND`.

## 3. Scenario presets

`POST /api/v1/demo/reset` now accepts `{ "scenario": "normal" | "watch" | "problem" }`. With `{}` it keeps the current one. A new session starts on `watch`, which is the v1.0 demo.

| Preset | Start state |
| --- | --- |
| `normal` | No alerts. Every measured region is Fine |
| `watch` | Three Watch alerts: sleep, cabin CO2, glucose (Example A) |
| `problem` | `watch`, plus three red alerts already open: storm at S3, CO2 above the 1-hour limit, heart rate 3 SD above baseline |

## 4. New fields in `State`

| Field | Meaning |
| --- | --- |
| `state.live` | The latest live frame, so the first paint has numbers |
| `state.context.scenario` | `normal`, `watch` or `problem` |
| `state.context.gravity` | Text for the top bar, set by the phase, for example `weightless` or `3/8 g`. No rule uses it |
| `state.regions[].measured` | `false` for `head` and `bones` |

## 5. Two more read endpoints

- `GET /api/v1/devices`: the 5 simulated devices, each with its metrics and the time of its last reading.
- `GET /api/v1/records?metric=hr&limit=50`: stored readings, newest first, with region, baseline band, deviation in SD, device and provenance. `limit` is 1 to 500, default 100.

## Not in v1.1

- `dose_msv` still has no readings. A daily dose rate would be a number we would have to invent.
- The six live metrics are the continuous ones. Glucose, sleep, mood and PHQ-2 change only when a reading is stored.
