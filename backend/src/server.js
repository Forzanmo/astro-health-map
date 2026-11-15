// Starts listening. Nothing else.
const { createApp } = require('./app');
const { port } = require('./config');

createApp().listen(port, () => console.log('VitalOrbit API listening on port ' + port));
