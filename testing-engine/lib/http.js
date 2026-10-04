/**
 * lib/http.js — Shared HTTP client for all test modules
 *
 * Single source of truth for making requests to SatLegal APIs.
 * All response parsing normalises to { ok, status, data, ms, error }.
 */

'use strict';

const https = require('https');
const http  = require('http');

/**
 * Make an HTTP request.
 * @param {string} method  GET | POST
 * @param {string} url     Full URL including path
 * @param {object} body    JSON body (POST only)
 * @param {number} timeout Milliseconds (default 15000)
 * @returns {Promise<{ok, status, data, ms, error}>}
 */
function request(method, url, body = null, timeout = 15000) {
  return new Promise((resolve) => {
    const t0   = Date.now();
    const u    = new URL(url);
    const lib  = u.protocol === 'https:' ? https : http;
    const data = body ? JSON.stringify(body) : null;

    const opts = {
      hostname: u.hostname,
      port:     u.port || undefined,
      path:     u.pathname + (u.search || ''),
      method,
      headers: {
        'Content-Type':  'application/json',
        'User-Agent':    'SatLegal-TestRunner/2.0',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = lib.request(opts, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch (_) { parsed = raw; }
        resolve({
          ok:     res.statusCode >= 200 && res.statusCode < 400,
          status: res.statusCode,
          data:   parsed,
          ms:     Date.now() - t0,
          error:  null,
        });
      });
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({ ok: false, status: 0, data: null, ms: Date.now() - t0, error: 'Timeout' });
    });

    req.on('error', (err) => {
      resolve({ ok: false, status: 0, data: null, ms: Date.now() - t0, error: err.message });
    });

    if (data) req.write(data);
    req.end();
  });
}

function get(url, timeout)        { return request('GET',  url, null, timeout); }
function post(url, body, timeout) { return request('POST', url, body, timeout); }

module.exports = { request, get, post };
