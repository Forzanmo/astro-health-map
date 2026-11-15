// why.js: the five "why this test" lines for each of the 8 items. Text for the reader only, never used in code.
const NO_EVIDENCE = 'Not enough evidence yet.';

export const WHY = {
  bp: { title: 'Blood pressure', lines: [
    'The pressure of blood on the artery walls, as a top and a bottom number in mmHg.',
    'Yes. Fu 2019 recorded 24-hour blood pressure on astronauts in flight.',
    'In flight, 24-hour systolic pressure fell from about 120 to 106 mmHg and returned after landing (Fu 2019). After landing, blood pools in the legs and staying upright is harder.',
    'Tell the crew medical officer at Watch. At Problem, involve the crew medical officer now and queue it for the flight surgeon.',
    'Before re-entry, crews use fluid and salt loading and compression garments.'
  ] },
  hr: { title: 'Heart rate', lines: [
    'The number of heart beats per minute.',
    'Yes. Heart rate is part of suit telemetry during launch.',
    'The heart and vessels adapt to a lower load in weightlessness. After landing, heart rate can rise sharply on standing.',
    'A rise of 30 bpm or more within 3 min of standing is a Problem (Freeman 2011). Involve the crew medical officer now.',
    'About 2 hours of exercise a day is the main countermeasure on the ISS.'
  ] },
  glucose: { title: 'Glucose', lines: [
    'The amount of sugar in the blood, in mg/dL.',
    NO_EVIDENCE,
    'Evidence of insulin resistance in flight is growing; no validated in-flight range.',
    'Tell the crew medical officer at Watch. At Problem, involve the crew medical officer now.',
    NO_EVIDENCE
  ] },
  temp: { title: 'Temperature', lines: [
    'Body temperature in °C.',
    'Yes. Stahn 2017 measured resting core temperature on the ISS. Our sources do not name the device.',
    'Resting core temperature rose about 1 °C over about 2.5 months on the ISS (Stahn 2017).',
    'In flight, a rise in this direction is logged as a note first. At Problem, involve the crew medical officer now.',
    NO_EVIDENCE
  ] },
  sleep_h: { title: 'Sleep', lines: [
    'Hours of sleep per night.',
    'Yes. A wrist actigraphy device tracks sleep before, during and after the mission (ARCHeR, Artemis II).',
    'Astronauts averaged about 6 hours of sleep in flight (Barger 2014).',
    'Three nights in a row under 6 h is a Watch. Tell the crew medical officer.',
    'A steady sleep schedule and a change to the light plan.'
  ] },
  mood: { title: 'Mood', lines: [
    'A 0 to 100 self-rating of how you feel today, plus the PHQ-2 score.',
    'Yes. It is a short self-report in this app. NASA studies also use behavioral surveys.',
    'Months of isolation and delayed contact with Earth add strain.',
    'Results stay private to you. At a PHQ-2 score of 3 or more, the PHQ-9 is offered and you can share it with the crew medical officer (Kroenke 2003).',
    'On the ISS, crews hold weekly private conferences with ground support.'
  ] },
  ppco2: { title: 'Cabin CO2', lines: [
    'The partial pressure of carbon dioxide in the cabin air, in mmHg.',
    'Yes. It is cabin telemetry, measured for the cabin and not for each person.',
    'In a closed cabin, CO2 builds up. We flag headache risk only (Law 2014, ISS).',
    'A 1-hour mean above 3 mmHg is a Problem (NASA-STD-3001 V2). A 7-day mean above 2.5 mmHg is a Watch (Law 2014).',
    NO_EVIDENCE
  ] },
  radiation: { title: 'Radiation', lines: [
    'Proton flux from the Sun in pfu, and your running dose in mSv.',
    'Yes. Artemis II carried six cabin sensors and an active dosimeter for each astronaut.',
    'Outside Earth\'s magnetic field, a solar particle event can raise exposure during transit or a spacewalk.',
    'At 10 pfu (NOAA S1) it is logged. At 1000 pfu (NOAA S3), involve the crew medical officer now.',
    'Moving to the storm shelter. Orion uses a caution level first and a shelter level above it.'
  ] }
};
