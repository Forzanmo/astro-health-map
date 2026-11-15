// stateInitial.js: Example A from the contract. The State right after a session starts.
export const stateInitial = {
  "contract_version": "1.0",
  "session_started_at": "2026-11-15T10:30:00.000Z",
  "version": 1,
  "pending": false,
  "context": {
    "crew_id": "B",
    "profile": "MARS",
    "delay_s": 1200,
    "shown_delay_s": 6,
    "link_down": false,
    "phase": "P5b",
    "phase_label": "Mars transit",
    "day": 142,
    "time": "11:30",
    "events": [
      {
        "type": "EVA",
        "day": 142,
        "time": "12:00",
        "crew": [
          "B",
          "C"
        ],
        "level": "CAUTION",
        "past": false
      }
    ]
  },
  "vitals": [
    {
      "id": "bp",
      "label": "Blood pressure",
      "unit": "mmHg",
      "value": 119,
      "value2": 79,
      "provenance": "SIMULATED",
      "base_mean": 118,
      "base_sd": 5.2,
      "base_mean2": 76,
      "base_sd2": 3.7,
      "level": "OK",
      "trend7d": [
        117,
        117,
        115,
        112,
        119,
        119,
        119
      ]
    },
    {
      "id": "hr",
      "label": "Heart rate",
      "unit": "bpm",
      "value": 56,
      "value2": null,
      "provenance": "SIMULATED",
      "base_mean": 61,
      "base_sd": 4.3,
      "base_mean2": null,
      "base_sd2": null,
      "level": "OK",
      "trend7d": [
        64,
        61,
        65,
        64,
        65,
        60,
        56
      ]
    },
    {
      "id": "glucose",
      "label": "Glucose",
      "unit": "mg/dL",
      "value": 103,
      "value2": null,
      "provenance": "SIMULATED",
      "base_mean": 90,
      "base_sd": 5.6,
      "base_mean2": null,
      "base_sd2": null,
      "level": "CAUTION",
      "trend7d": [
        88,
        90,
        94,
        98,
        103,
        103,
        103
      ]
    },
    {
      "id": "temp",
      "label": "Temperature",
      "unit": "°C",
      "value": 36.9,
      "value2": null,
      "provenance": "SIMULATED",
      "base_mean": 36.9,
      "base_sd": 0.2,
      "base_mean2": null,
      "base_sd2": null,
      "level": "OK",
      "trend7d": [
        36.8,
        36.9,
        36.9,
        36.7,
        36.6,
        36.6,
        36.9
      ]
    },
    {
      "id": "sleep_h",
      "label": "Sleep",
      "unit": "h",
      "value": 5.2,
      "value2": null,
      "provenance": "SIMULATED",
      "base_mean": 6.9,
      "base_sd": 1.2,
      "base_mean2": null,
      "base_sd2": null,
      "level": "CAUTION",
      "trend7d": [
        6.8,
        7.4,
        7,
        7.4,
        5.2,
        5.2,
        5.2
      ]
    },
    {
      "id": "mood",
      "label": "Mood",
      "unit": "/100",
      "value": 78,
      "value2": null,
      "provenance": "SIMULATED",
      "base_mean": 74,
      "base_sd": 5.7,
      "base_mean2": null,
      "base_sd2": null,
      "level": "OK",
      "trend7d": [
        75,
        72,
        80,
        76,
        74,
        73,
        78
      ]
    }
  ],
  "regions": [
    {
      "id": "head",
      "label": "Head and eyes",
      "level": "NONE",
      "alert_ids": [],
      "readings": []
    },
    {
      "id": "heart",
      "label": "Heart and circulation",
      "level": "OK",
      "alert_ids": [],
      "readings": [
        {
          "metric": "hr",
          "label": "Heart rate",
          "unit": "bpm",
          "value": 56,
          "provenance": "SIMULATED",
          "at": "Day 142 08:00"
        },
        {
          "metric": "bp_sys",
          "label": "Systolic pressure",
          "unit": "mmHg",
          "value": 119,
          "provenance": "SIMULATED",
          "at": "Day 142 08:00"
        },
        {
          "metric": "bp_dia",
          "label": "Diastolic pressure",
          "unit": "mmHg",
          "value": 79,
          "provenance": "SIMULATED",
          "at": "Day 142 08:00"
        }
      ]
    },
    {
      "id": "lungs",
      "label": "Lungs and cabin air",
      "level": "CAUTION",
      "alert_ids": [
        "B-co2"
      ],
      "readings": [
        {
          "metric": "ppco2",
          "label": "Cabin CO2",
          "unit": "mmHg",
          "value": 3,
          "provenance": "SIMULATED",
          "at": "Day 142 11:00"
        }
      ]
    },
    {
      "id": "metabolism",
      "label": "Metabolism and temperature",
      "level": "CAUTION",
      "alert_ids": [
        "B-vital-glucose"
      ],
      "readings": [
        {
          "metric": "glucose",
          "label": "Glucose",
          "unit": "mg/dL",
          "value": 103,
          "provenance": "SIMULATED",
          "at": "Day 142 08:00"
        },
        {
          "metric": "temp",
          "label": "Temperature",
          "unit": "°C",
          "value": 36.9,
          "provenance": "SIMULATED",
          "at": "Day 142 08:00"
        }
      ]
    },
    {
      "id": "bones",
      "label": "Bones and muscles",
      "level": "NONE",
      "alert_ids": [],
      "readings": []
    },
    {
      "id": "mind",
      "label": "Mind and sleep",
      "level": "CAUTION",
      "alert_ids": [
        "B-sleep"
      ],
      "readings": [
        {
          "metric": "sleep_h",
          "label": "Sleep",
          "unit": "h",
          "value": 5.2,
          "provenance": "SIMULATED",
          "at": "Day 142 07:00"
        },
        {
          "metric": "mood",
          "label": "Mood",
          "unit": "/100",
          "value": 78,
          "provenance": "SIMULATED",
          "at": "Day 142 08:00"
        },
        {
          "metric": "phq2",
          "label": "PHQ-2 score",
          "unit": "/6",
          "value": null,
          "provenance": null,
          "at": null
        }
      ]
    },
    {
      "id": "radiation",
      "label": "Whole body: radiation",
      "level": "OK",
      "alert_ids": [],
      "readings": [
        {
          "metric": "dose_msv",
          "label": "Radiation dose",
          "unit": "mSv",
          "value": null,
          "provenance": null,
          "at": null
        },
        {
          "metric": "proton_pfu",
          "label": "Proton flux",
          "unit": "pfu",
          "value": 0.22,
          "provenance": "SIMULATED",
          "at": "Day 142 08:00"
        }
      ]
    }
  ],
  "alerts": [
    {
      "id": "B-sleep",
      "ladder": "sleep",
      "rule_id": "M2-a",
      "level": "CAUTION",
      "what": "Short sleep three nights in a row.",
      "why": "Last 3 nights: 5.2, 5.2, 5.2 h. The rule is 3 nights under 6 h.",
      "note": null,
      "provenance": "SIMULATED",
      "do_now": [
        "Follow the sleep schedule tonight and adjust the light plan.",
        "Ask the crew medical officer about the spacewalk assignment."
      ],
      "source": "Barger 2014 reference values",
      "evidence_class": null,
      "design": true,
      "region": "mind",
      "metrics": [
        "sleep_h"
      ],
      "private": false,
      "shared": false,
      "refired": false,
      "conflict": {
        "type": "EVA",
        "day": 142,
        "time": "12:00"
      },
      "time_to_impact_min": 30,
      "escalation": "act_onboard",
      "escalation_text": "Act onboard now",
      "escalation_reason": "Earth cannot answer before the spacewalk at 12:00.",
      "reply_min": 40,
      "who": "Tell the crew medical officer.",
      "priority": 7
    },
    {
      "id": "B-co2",
      "ladder": "co2",
      "rule_id": "M3-b",
      "level": "CAUTION",
      "what": "Cabin CO2 has been raised for a week.",
      "why": "The 7-day mean is 2.6 mmHg. The watch level is 2.5 mmHg.",
      "note": "We flag headache risk only.",
      "provenance": "SIMULATED",
      "do_now": [
        "Log any headache and tell the crew medical officer."
      ],
      "source": "Law 2014 (ISS)",
      "evidence_class": "SPACEFLIGHT",
      "design": false,
      "region": "lungs",
      "metrics": [
        "ppco2"
      ],
      "private": false,
      "shared": false,
      "refired": false,
      "conflict": null,
      "time_to_impact_min": 2880,
      "escalation": "ask_ground",
      "escalation_text": "Ask ground: reply in about 40 min",
      "escalation_reason": "Earth can answer in time.",
      "reply_min": 40,
      "who": "Tell the crew medical officer.",
      "priority": 3
    },
    {
      "id": "B-vital-glucose",
      "ladder": "vital-glucose",
      "rule_id": "V-1",
      "level": "CAUTION",
      "what": "Glucose is away from your baseline.",
      "why": "The last 2 readings were +2.3 and +2.3 SD from your pre-flight mean of 90 mg/dL.",
      "note": "Evidence of insulin resistance in flight is growing; no validated in-flight range.",
      "provenance": "SIMULATED",
      "do_now": [
        "Take the reading again.",
        "Tell the crew medical officer if it repeats."
      ],
      "source": "own baseline",
      "evidence_class": null,
      "design": true,
      "region": "metabolism",
      "metrics": [
        "glucose"
      ],
      "private": false,
      "shared": false,
      "refired": false,
      "conflict": null,
      "time_to_impact_min": 2880,
      "escalation": "ask_ground",
      "escalation_text": "Ask ground: reply in about 40 min",
      "escalation_reason": "Earth can answer in time.",
      "reply_min": 40,
      "who": "Tell the crew medical officer.",
      "priority": 3
    }
  ],
  "ground": [],
  "stand_test": null
};
