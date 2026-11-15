// stateStorm.js: the parts of Example B that differ from Example A after the solar storm.
export const stormAlert = {
  "id": "B-flux",
  "ladder": "flux",
  "rule_id": "M1-c",
  "level": "WARNING",
  "what": "Solar storm: proton flux passed the S3 level.",
  "why": "Proton flux is 1200 pfu. The S3 level starts at 1000 pfu.",
  "note": null,
  "provenance": "SIMULATED",
  "do_now": [
    "Move to the storm shelter now.",
    "Postpone the spacewalk."
  ],
  "source": "NOAA SWPC scales",
  "evidence_class": "STANDARD",
  "design": false,
  "region": "radiation",
  "metrics": [
    "proton_pfu"
  ],
  "private": false,
  "shared": false,
  "refired": true,
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
  "who": "Crew medical officer now. Queued for the flight surgeon.",
  "priority": 13
};

export const stormRegion = {
  "id": "radiation",
  "label": "Whole body: radiation",
  "level": "WARNING",
  "alert_ids": [
    "B-flux"
  ],
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
      "value": 1200,
      "provenance": "SIMULATED",
      "at": "Day 142 11:30"
    }
  ]
};

export const stormEvent = {
  "type": "EVA",
  "day": 142,
  "time": "12:00",
  "crew": [
    "B",
    "C"
  ],
  "level": "WARNING",
  "past": false
};

export const stormGround = [
  {
    "alert_id": "B-flux",
    "level": "WARNING",
    "what": "Solar storm: proton flux passed the S3 level.",
    "data_as_of": "Day 142 11:30",
    "status": "in_transit"
  }
];
