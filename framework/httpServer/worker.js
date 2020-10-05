const http = require('http');
const requestHandler = require('framework/httpServer/requestHandler');
const normalizePort = require('framework/lib/normalizePort');
require('dotenv').config();

const BASE_PORT = normalizePort(process.env.PORT) || 7000;

const httpServer = http.createServer(requestHandler).listen(BASE_PORT, () => {
  console.log(`Server listening on http://localhost:${BASE_PORT}`);
});

httpServer.on('error', error => {
  console.error(error);
});

module.exports = httpServer;
