const router = require('express').Router({ mergeParams: true });
const db = require('../db');
const { requireRole } = require('../../../../lab2/auth/auth');
const { check } = require('../validate');

const schema = {
  rating: { type: 'number', required: true, min: 1, max: 5 },
  comment: { type: 'string', required: true, min: 3, max: 2000 },
  recommended: { type: 'boolean' },
  flown_at: { type: 'string', date: true },
};

const find = (droneId, id) => db.prepare(`SELECT r.*, u.username FROM reviews r JOIN users u ON u.id = r.user_id
  WHERE r.id = ? AND r.drone_id = ?`).get(id, droneId);
const out = (r) => r && { ...r, recommended: !!r.recommended };

router.use((req, res, next) => {
  const { categoryId, droneId } = req.params;
  if (!db.prepare('SELECT id FROM categories WHERE id = ?').get(categoryId))
    return res.status(404).json({ error: 'Kategorija nerasta' });
  if (!db.prepare('SELECT id FROM drones WHERE id = ? AND category_id = ?').get(droneId, categoryId))
    return res.status(404).json({ error: 'Dronas nerastas' });
  next();
});

router.get('/', (req, res) => {
  const rows = db.prepare(`SELECT r.*, u.username FROM reviews r JOIN users u ON u.id = r.user_id
    WHERE r.drone_id = ? ORDER BY r.id DESC`).all(req.params.droneId);
  res.json(rows.map(out));
});

router.get('/:id', (req, res) => {
  const r = find(req.params.droneId, req.params.id);
  if (!r) return res.status(404).json({ error: 'Atsiliepimas nerastas' });
  res.json(out(r));
});

router.post('/', requireRole('member', 'admin'), check(schema), (req, res) => {
  if (!Number.isInteger(req.body.rating)) return res.status(422).json({ error: 'Validacijos klaida', details: ['rating turi būti sveikas skaičius'] });
  const { rating, comment, recommended = true, flown_at = null } = req.body;
  const r = db.prepare('INSERT INTO reviews (drone_id, user_id, rating, comment, recommended, flown_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.params.droneId, req.user.id, rating, comment, recommended ? 1 : 0, flown_at);
  res.status(201).location(`${req.baseUrl}/${r.lastInsertRowid}`).json(out(find(req.params.droneId, r.lastInsertRowid)));
});

// narys gali keisti/trinti tik savo atsiliepimus, adminas - visus
function ownerOrAdmin(req, res, next) {
  const r = find(req.params.droneId, req.params.id);
  if (!r) return res.status(404).json({ error: 'Atsiliepimas nerastas' });
  if (req.user.role !== 'admin' && r.user_id !== req.user.id) return res.status(403).json({ error: 'Galite keisti tik savo atsiliepimus' });
  req.review = r;
  next();
}

router.put('/:id', requireRole('member', 'admin'), check(schema, true), ownerOrAdmin, (req, res) => {
  const r = req.review;
  if (req.body.rating !== undefined && !Number.isInteger(req.body.rating))
    return res.status(422).json({ error: 'Validacijos klaida', details: ['rating turi būti sveikas skaičius'] });
  const { rating = r.rating, comment = r.comment, flown_at = r.flown_at } = req.body;
  const recommended = req.body.recommended !== undefined ? (req.body.recommended ? 1 : 0) : r.recommended;
  db.prepare('UPDATE reviews SET rating = ?, comment = ?, recommended = ?, flown_at = ? WHERE id = ?')
    .run(rating, comment, recommended, flown_at, r.id);
  res.json(out(find(req.params.droneId, r.id)));
});

router.delete('/:id', requireRole('member', 'admin'), ownerOrAdmin, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.review.id);
  res.status(204).end();
});

module.exports = router;
