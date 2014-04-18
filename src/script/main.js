require('./lib/ratchet-mod.js');

var React = require('react/addons');
React.initializeTouchEvents(true);
window.React = React; // Enables React Chrome Developer Tools. Todo: dev only  https://github.com/facebook/react-devtools/issues/28

var app = require('./app.jsx');