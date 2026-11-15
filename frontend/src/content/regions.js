// regions.js: for each body region, which "why this test" items it shows and the note to print.
export const REGION_CONTENT = {
  head: { why: [], note: 'No data yet. In-flight eye checks use OCT and eye ultrasound.' },
  heart: { why: ['hr', 'bp'], note: '' },
  lungs: { why: ['ppco2'], note: '' },
  metabolism: { why: ['glucose', 'temp'], note: '' },
  bones: { why: [], note: 'No data yet. Exercise data would fill this region.' },
  mind: { why: ['sleep_h', 'mood'], note: '' },
  radiation: { why: ['radiation'], note: '' }
};
