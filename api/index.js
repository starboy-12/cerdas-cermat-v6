'use strict';

const { requestListener, startInitialization } = require('../backend/src/server.js');

let initialized = false;
let initPromise = null;

async function ensureInitialized() {
  if (initialized) return;
  if (!initPromise) {
    initPromise = startInitialization()
      .then(() => {
        initialized = true;
      })
      .catch((err) => {
        initPromise = null;
        throw err;
      });
  }
  await initPromise;
}

module.exports = async function handler(req, res) {
  try {
    await ensureInitialized();
    return await requestListener(req, res);
  } catch (error) {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Serverless initialization error: ' + error.message }));
    }
  }
};
