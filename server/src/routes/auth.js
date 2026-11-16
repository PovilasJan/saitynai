const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { signAccess, requireRole } = require('../auth');
const { check } = require('../validate');

const REFRESH_DAYS = 7;
const creds = { username: { type: 'string', required: true, min: 3, max: 30 }, password: { type: 'string', required: true, min: 6, max: 100 } };

function issueTokens(user) {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  db.prepare('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)')
    .run(refreshToken, user.id, Date.now() + REFRESH_DAYS * 864e5);
  return { accessToken: signAccess(user), refreshToken, user: { id: user.id, username: user.username, role: user.role } };
}

router.post('/register', check(creds), (req, res) => {
  const { username, password } = req.body;
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username))
    return res.status(409).json({ error: 'Toks naudotojas jau egzistuoja' });
  const r = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
    .run(username, bcrypt.hashSync(password, 10), 'member');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(r.lastInsertRowid);
  res.status(201).json(issueTokens(user));
});

router.post('/login', check(creds), (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(req.body.username);
  if (!user || !bcrypt.compareSync(req.body.password, user.password_hash))
    return res.status(401).json({ error: 'Neteisingas vartotojo vardas arba slaptažodis' });
  res.json(issueTokens(user));
});

// refresh token rotacija: senas žetonas atšaukiamas, išduodama nauja pora
router.post('/refresh', check({ refreshToken: { type: 'string', required: true } }), (req, res) => {
  const row = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(req.body.refreshToken);
  if (!row || row.expires_at < Date.now()) return res.status(401).json({ error: 'Netinkamas refresh žetonas' });
  if (row.revoked) {
    // pakartotinis panaudojimas - galimai pavogtas, atšaukiam visus naudotojo žetonus
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(row.user_id);
    return res.status(401).json({ error: 'Refresh žetonas jau panaudotas' });
  }
  db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?').run(row.token);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(row.user_id);
  res.json(issueTokens(user));
});

router.post('/logout', (req, res) => {
  if (req.body && req.body.refreshToken)
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?').run(req.body.refreshToken);
  res.status(204).end();
});

router.get('/me', requireRole('member', 'admin'), (req, res) => res.json(req.user));

module.exports = router;
