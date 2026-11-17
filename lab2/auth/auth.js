const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_access_secret';
const ACCESS_TTL = process.env.ACCESS_TTL || '15m';

function signAccess(user) {
  // rolė saugoma žetono viduje
  return jwt.sign({ sub: user.id, username: user.username, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

// nustato req.user jei yra galiojantis žetonas, kitaip - svečias
function authOptional(req, res, next) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) {
    try {
      const p = jwt.verify(h.slice(7), ACCESS_SECRET);
      req.user = { id: p.sub, username: p.username, role: p.role };
    } catch {
      return res.status(401).json({ error: 'Netinkamas arba pasibaigęs žetonas' });
    }
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

module.exports = { signAccess, authOptional, requireRole };
