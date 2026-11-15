// extras.js: Example C (LEO), Example D (private alert) and Example E (stand test) from the contract.
export const leoContext = { profile: "LEO", delay_s: 0, shown_delay_s: 0 };

export const leoEscalation = {
  escalation: "ask_ground",
  escalation_text: "Ask ground: reply in under 1 min",
  escalation_reason: "Earth can answer in time.",
  reply_min: 0
};

export const phqAlert = {
  "id": "B-phq",
  "ladder": "phq",
  "rule_id": "M5-b",
  "level": "CAUTION",
  "what": "PHQ-2 score suggests a longer check-in.",
  "why": "Your score is 4 of 6. At 3 or more, the PHQ-9 is offered.",
  "note": null,
  "provenance": "SIMULATED",
  "do_now": [
    "Take the PHQ-9 when you are ready.",
    "Share the result with the crew medical officer."
  ],
  "source": "Kroenke 2003",
  "evidence_class": "GEN POP",
  "design": false,
  "region": "mind",
  "metrics": [
    "phq2"
  ],
  "private": true,
  "shared": false,
  "refired": false,
  "conflict": null,
  "time_to_impact_min": 2880,
  "escalation": "ask_ground",
  "escalation_text": "Ask ground: reply in about 40 min",
  "escalation_reason": "Earth can answer in time.",
  "reply_min": 40,
  "who": "Only you can see this.",
  "priority": 3
};

export const sharedWho = "Shared with the crew medical officer.";

export const standSummary = { fired: "M4-a", hr_rise: 32, sys_drop: 8, dia_drop: 4, readiness: "WARNING" };

// 52 rows, one every 10 s: 5 min supine, 30 s sitting, 3 min standing. Mock values only.
export function makeStandRows() {
  const rows = [];
  for (let i = 0; i < 52; i += 1) {
    const t = i * 10;
    const posture = t < 300 ? "supine" : t < 330 ? "sit" : "stand";
    const up = posture === "stand" ? Math.min(1, (t - 330) / 120) : 0;
    rows.push({
      t_s: t, posture,
      hr_bpm: Math.round(58 + (posture === "sit" ? 6 : 0) + up * 32),
      bp_sys: Math.round(118 - up * 8), bp_dia: Math.round(76 - up * 4),
      provenance: "SIMULATED"
    });
  }
  return rows;
}
