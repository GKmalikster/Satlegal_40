/**
 * api/_db.js — Shared MongoDB connection for Vercel serverless functions
 *
 * Caches the connection on `global` so warm Lambda invocations reuse it.
 * Import with: const { connectDB, isAdmin, verifyToken, makeToken, getModels } = require('./_db');
 *
 * Auth functions (makeToken, verifyToken) live here so admin-login.js can be
 * removed as a standalone serverless function (Vercel Hobby 12-function limit).
 */

const mongoose = require('mongoose');
const crypto   = require('crypto');

// ── Admin token helpers (HMAC-SHA256) ────────────────────────────────────────
// Token format: base64url(email:role:timestamp).hex(HMAC-SHA256)
// Tokens expire after 8 hours. ADMIN_SECRET must be set in Vercel env vars.

function _getSecret() {
  if (!process.env.ADMIN_SECRET) throw new Error('ADMIN_SECRET env var not set');
  return process.env.ADMIN_SECRET;
}

function makeToken(email, role) {
  const secret  = _getSecret();
  const ts      = Date.now();
  const payload = `${email.toLowerCase()}:${role}:${ts}`;
  const sig     = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const secret = _getSecret();
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;
    const payloadB64 = token.slice(0, dot);
    const sig        = token.slice(dot + 1);
    if (sig.length !== 64) return null;
    const payload = Buffer.from(payloadB64, 'base64url').toString();
    const parts   = payload.split(':');
    if (parts.length < 3) return null;
    const role  = parts[1];
    const ts    = parseInt(parts[parts.length - 1], 10);
    const email = parts.slice(0, parts.length - 2).join(':');
    if (isNaN(ts) || Date.now() - ts > 8 * 60 * 60 * 1000) return null;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const valid = crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
    return valid ? { email, role } : null;
  } catch { return null; }
}

// ── Auth helper (shared by all admin endpoints) ──────────────────────────────
// Accepts HMAC-signed tokens issued by /api/admin-login ONLY.
// Legacy timestamp-only tokens ('admin-session-*') are no longer accepted.
function isAdmin(req) {
  const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (!auth || !auth.includes('.')) return false;
  try { return verifyToken(auth) !== null; } catch { return false; }
}

// ── Connection singleton ──────────────────────────────────────────────────────
let cached = global._mongoConn;
if (!cached) cached = global._mongoConn = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI environment variable is not set');
    cached.promise = mongoose.connect(uri, { bufferCommands: false })
      .then(m => m)
      .catch(err => { cached.promise = null; throw err; });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ── Models (lazy — only compiled once per process) ───────────────────────────
// We require the shared models from the backend folder.
// Node module cache ensures they're compiled only once per Lambda instance.
let _models = null;
function getModels() {
  if (_models) return _models;
  try {
    _models = require('../backend/models');
  } catch (e) {
    throw new Error('Could not load backend/models.js: ' + e.message);
  }
  return _models;
}

module.exports = { connectDB, isAdmin, verifyToken, makeToken, getModels };
