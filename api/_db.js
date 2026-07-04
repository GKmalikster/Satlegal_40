/**
 * api/_db.js — Shared MongoDB connection for Vercel serverless functions
 *
 * Caches the connection on `global` so warm Lambda invocations reuse it.
 * Import with: const { connectDB, User, LawyerProfile, SearchQuery, ... } = require('./_db');
 */

const mongoose = require('mongoose');

// ── Auth helper (shared by all admin endpoints) ──────────────────────────────
// Accepts:
//   1. New HMAC token from api/admin-login.js (preferred)
//   2. Legacy 'admin-session-<timestamp>' tokens (backwards compat)
function isAdmin(req) {
  const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  if (!auth) return false;

  // New signed token (contains a dot separator)
  if (auth.includes('.')) {
    try {
      const { verifyToken } = require('./admin-login');
      return verifyToken(auth) !== null;
    } catch { return false; }
  }

  // Legacy token set by old admin-login.html: 'admin-session-<timestamp>'
  if (auth.startsWith('admin-session-')) {
    const ts = parseInt(auth.replace('admin-session-', ''), 10);
    return !isNaN(ts) && (Date.now() - ts < 8 * 60 * 60 * 1000);
  }

  return false;
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

module.exports = { connectDB, isAdmin, getModels };
