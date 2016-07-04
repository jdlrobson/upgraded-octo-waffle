// app.js
require('babel-core/register')
// Avoid processing of CSS on the server before continuing
require.extensions['.css'] = function () { return null }
require('./libs/server/app-server.js')