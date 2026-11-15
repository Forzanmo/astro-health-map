// The /api/v1 routes. A route calls one engine method and sends the envelope. No logic lives here.
const express = require('express');

const router = express.Router();
const send = (res, engine, result = null) => res.json({ ok: true, state: engine.getState(), result });
const body = (req) => req.body || {};

// Contract v1.0
router.get('/state',                (req, res) => send(res, req.engine));
router.post('/observations',        (req, res) => send(res, req.engine, req.engine.addObservation(body(req))));
router.post('/observations/import', (req, res) => send(res, req.engine, req.engine.importCsv(body(req).csv)));
router.patch('/context',            (req, res) => send(res, req.engine, req.engine.setContext(body(req))));
router.post('/demo/storm',          (req, res) => send(res, req.engine, req.engine.triggerStorm()));
router.post('/demo/reset',          (req, res) => send(res, req.engine, req.engine.reset(body(req))));
router.post('/stand-test',          (req, res) => send(res, req.engine, req.engine.runStandTest(body(req).rows)));
router.post('/alerts/:id/share',    (req, res) => send(res, req.engine, req.engine.shareAlert(req.params.id)));

// Contract v1.1 additions
router.get('/live',                 (req, res) => send(res, req.engine, req.engine.getLiveFrame()));
router.get('/regions/:id',          (req, res) => send(res, req.engine, req.engine.getRegionDetail(req.params.id)));
router.get('/devices',              (req, res) => send(res, req.engine, req.engine.getDevices()));
router.get('/records',              (req, res) => send(res, req.engine, req.engine.getRecords(req.query)));

module.exports = router;
