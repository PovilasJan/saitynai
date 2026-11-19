const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../../lab1/server/src/db');

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_access_secret';
const ACCESS_TTL = process.env.ACCESS_TTL || '15m';

function signAccess(user) {
  // rolė ir ID saugomi žetono viduje; jti - unikalus žetono ID, kad būtų galima jį atšaukti atsijungus
  return jwt.sign({ sub: user.id, username: user.username, role: user.role }, ACCESS_SECRET,
    { expiresIn: ACCESS_TTL, jwtid: crypto.randomUUID(), algorithm: 'HS256' });
}

// grąžina žetono turinį (payload) arba null, jei Authorization antraštės nėra; blogas parašas -> išimtis
function readToken(req, opts = {}) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  return jwt.verify(h.slice(7), ACCESS_SECRET, { algorithms: ['HS256'], ...opts });
}

const isRevoked = (jti) => !!(jti && db.prepare('SELECT 1 FROM revoked_tokens WHERE jti = ?').get(jti));

// nustato req.user jei yra galiojantis žetonas, kitaip - svečias
function authOptional(req, res, next) {
  let p;
  try {
    p = readToken(req);
  } catch {
    return res.status(401).json({ error: 'Netinkamas arba pasibaigęs žetonas' });
  }
  if (p) {
    if (isRevoked(p.jti)) return res.status(401).json({ error: 'Žetonas atšauktas (naudotojas atsijungė)' });
    req.user = { id: p.sub, username: p.username, role: p.role };
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Reikia prisijungti' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Neturite teisių' });
    next();
  };
}

module.exports = { signAccess, readToken, authOptional, requireRole };
