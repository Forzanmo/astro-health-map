// selection.js: remembers which body region the user picked. Screen state only, never sent to the API.
let selected = null;

export function getSelectedRegion() { return selected; }
export function setSelectedRegion(id) { selected = id; }
