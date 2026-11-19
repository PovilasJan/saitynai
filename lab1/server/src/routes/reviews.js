const router = require('express').Router({ mergeParams: true });
const db = require('../db');
const { requireRole } = require('../../../../lab2/auth/auth');
const { check } = require('../validate');
const { paging, number, bool, page, listRoute, links } = require('../list');

const schema = {
  rating: { type: 'number', required: true, min: 1, max: 5 },
  comment: { type: 'string', required: true, min: 3, max: 2000 },
  recommended: { type: 'boolean' },
  flown_at: { type: 'string', date: true },
};

const SELECT = 'SELECT r.*, u.username FROM reviews r JOIN users u ON u.id = r.user_id';
const find = (droneId, id) => db.prepare(`${SELECT} WHERE r.id = ? AND r.drone_id = ?`).get(id, droneId);

// moderatorius ir administratorius gali keisti/trinti bet kurį atsiliepimą
const MODERATORS = ['admin', 'moderator'];

router.use((req, res, next) => {
  const { categoryId, droneId } = req.params;
  if (!db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId))
    return res.status(404).json({ error: 'Kategorija nerasta' });
  if (!db.prepare('SELECT id FROM drones WHERE id = ? AND category_id = ?').get(droneId, categoryId))
    return res.status(404).json({ error: 'Dronas nerastas' });
  // hypermedia nuorodoms
  res.locals.out = (r) => r && { ...r, recommended: !!r.recommended, _links: links.review(r, categoryId) };
  next();
});

// GET .../reviews?minRating=4&recommended=true&page=1&limit=10
router.get('/', listRoute((req, res) => {
  const p = paging(req.query);
  const where = ['r.drone_id = ?'];
  const args = [req.params.droneId];
  const minRating = number(req.query, 'minRating');
  const recommended = bool(req.query, 'recommended');
  if (minRating !== undefined) { where.push('r.rating >= ?'); args.push(minRating); }
  if (recommended !== undefined) { where.push('r.recommended = ?'); args.push(recommended ? 1 : 0); }
  const w = `WHERE ${where.join(' AND ')}`;
  const total = db.prepare(`SELECT COUNT(*) n FROM reviews r ${w}`).get(...args).n;
  const rows = db.prepare(`${SELECT} ${w} ORDER BY r.id DESC LIMIT ? OFFSET ?`).all(...args, p.limit, p.offset);
  res.json(page(req, p, total, rows.map(res.locals.out)));
}));

router.get('/:id', (req, res) => {
  const r = find(req.params.droneId, req.params.id);
  if (!r) return res.status(404).json({ error: 'Atsiliepimas nerastas' });
  res.json(res.locals.out(r));
});

const integerRating = (req, res, next) => {
  if (req.body.rating !== undefined && !Number.isInteger(req.body.rating))
    return res.status(422).json({ error: 'Validacijos klaida', details: ['rating turi būti sveikas skaičius'] });
  next();
};

router.post('/', requireRole('member', 'moderator', 'admin'), check(schema), integerRating, (req, res) => {
  const { rating, comment, recommended = true, flown_at = null } = req.body;
  const r = db.prepare('INSERT INTO reviews (drone_id, user_id, rating, comment, recommended, flown_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.params.droneId, req.user.id, rating, comment, recommended ? 1 : 0, flown_at);
  res.status(201).location(`${req.baseUrl}/${r.lastInsertRowid}`).json(res.locals.out(find(req.params.droneId, r.lastInsertRowid)));
});

// narys gali keisti/trinti tik savo atsiliepimus, moderatorius ir adminas - visus
function ownerOrModerator(req, res, next) {
  const r = find(req.params.droneId, req.params.id);
  if (!r) return res.status(404).json({ error: 'Atsiliepimas nerastas' });
  if (!MODERATORS.includes(req.user.role) && r.user_id !== req.user.id)
    return res.status(403).json({ error: 'Galite keisti tik savo atsiliepimus' });
  req.review = r;
  next();
}

router.put('/:id', requireRole('member', 'moderator', 'admin'), check(schema, true), integerRating, ownerOrModerator, (req, res) => {
  const r = req.review;
  const pick = (k) => (req.body[k] !== undefined ? req.body[k] : r[k]);
  const recommended = req.body.recommended !== undefined && req.body.recommended !== null ? (req.body.recommended ? 1 : 0) : r.recommended;
  db.prepare('UPDATE reviews SET rating = ?, comment = ?, recommended = ?, flown_at = ? WHERE id = ?')
    .run(pick('rating'), pick('comment'), recommended, pick('flown_at'), r.id);
  res.json(res.locals.out(find(req.params.droneId, r.id)));
});

router.delete('/:id', requireRole('member', 'moderator', 'admin'), ownerOrModerator, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.review.id);
  res.status(204).end();
});

module.exports = router;
