const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { signAccess, readToken, authOptional, requireRole } = require('./auth');
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
    return res.status(401).json({ error: 'Refresh žetonas atšauktas arba jau panaudotas' });
  }
  db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?').run(row.token);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(row.user_id);
  res.json(issueTokens(user));
});

// atsijungimas: atšaukiamas refresh žetonas ir dabartinis access žetonas (pagal jti),
// todėl senu access žetonu nebegalima naudotis net iki jo galiojimo pabaigos
router.post('/logout', (req, res) => {
  try {
    const p = readToken(req, { ignoreExpiration: true });
    if (p && p.jti) db.prepare('INSERT OR IGNORE INTO revoked_tokens (jti, expires_at) VALUES (?, ?)').run(p.jti, p.exp * 1000);
  } catch { /* netinkamas žetonas - nėra ką atšaukti */ }
  const rt = req.body && req.body.refreshToken;
  if (typeof rt === 'string') db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token = ?').run(rt);
  // išvalom nebeaktualius įrašus
  db.prepare('DELETE FROM revoked_tokens WHERE expires_at < ?').run(Date.now());
  res.status(204).end();
});

// profilis: naudotojas + jo atsiliepimai su dronų ir kategorijų pavadinimais (4 esybės)
router.get('/me', authOptional, requireRole('member', 'moderator', 'admin'), (req, res) => {
  const user = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Naudotojas nerastas' });
  const reviews = db.prepare(`SELECT r.id, r.rating, r.comment, r.recommended, r.flown_at, r.created_at,
      d.id AS drone_id, d.name AS drone_name, c.id AS category_id, c.name AS category_name
    FROM reviews r JOIN drones d ON d.id = r.drone_id JOIN categories c ON c.id = d.category_id
    WHERE r.user_id = ? ORDER BY r.id DESC`).all(user.id)
    .map((r) => ({ ...r, recommended: !!r.recommended, _links: {
      self: { href: `/api/categories/${r.category_id}/drones/${r.drone_id}/reviews/${r.id}` },
      drone: { href: `/api/categories/${r.category_id}/drones/${r.drone_id}` },
    } }));
  const avg = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null;
  res.json({ ...user, stats: { review_count: reviews.length, avg_rating: avg }, reviews,
    _links: { self: { href: '/api/auth/me' }, logout: { href: '/api/auth/logout', method: 'POST' } } });
});

module.exports = router;
