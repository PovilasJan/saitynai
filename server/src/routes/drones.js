const router = require('express').Router({ mergeParams: true });
const db = require('../db');
const { requireRole } = require('../auth/auth');
const { check } = require('../validate');
const { paging, text, number, page, listRoute, links } = require('../list');

const schema = {
  name: { type: 'string', required: true, min: 2, max: 100 },
  manufacturer: { type: 'string', required: true, min: 2, max: 100 },
  price: { type: 'number', required: true, min: 0, max: 1000000 },
  flight_time: { type: 'number', min: 0, max: 600 },
  weight: { type: 'number', min: 0, max: 100000 },
  image_url: { type: 'string', max: 500 },
};

const fields = Object.keys(schema);
const SELECT = `SELECT d.*, ROUND(AVG(r.rating), 1) AS avg_rating, COUNT(r.id) AS review_count
  FROM drones d LEFT JOIN reviews r ON r.drone_id = d.id`;
const find = (catId, id) => db.prepare(`${SELECT} WHERE d.id = ? AND d.category_id = ? GROUP BY d.id`).get(id, catId);
const out = (d) => ({ ...d, _links: links.drone(d) });

// visi maršrutai po /categories/:categoryId - tikrinam ar tėvinė kategorija egzistuoja
router.use((req, res, next) => {
  if (!db.prepare('SELECT id FROM categories WHERE id = ?').get(req.params.categoryId))
    return res.status(404).json({ error: 'Kategorija nerasta' });
  next();
});

// hierarchinis metodas: konkrečios kategorijos dronai
// GET /categories/1/drones?manufacturer=DJI&minPrice=100&maxPrice=1000&search=mini&page=1&limit=10
router.get('/', listRoute((req, res) => {
  const p = paging(req.query);
  const where = ['d.category_id = ?'];
  const args = [req.params.categoryId];
  const manufacturer = text(req.query, 'manufacturer');
  const search = text(req.query, 'search');
  const minPrice = number(req.query, 'minPrice');
  const maxPrice = number(req.query, 'maxPrice');
  if (manufacturer) { where.push('d.manufacturer = ? COLLATE NOCASE'); args.push(manufacturer); }
  if (search) { where.push('d.name LIKE ?'); args.push(`%${search}%`); }
  if (minPrice !== undefined) { where.push('d.price >= ?'); args.push(minPrice); }
  if (maxPrice !== undefined) { where.push('d.price <= ?'); args.push(maxPrice); }
  const w = `WHERE ${where.join(' AND ')}`;
  const total = db.prepare(`SELECT COUNT(*) n FROM drones d ${w}`).get(...args).n;
  const rows = db.prepare(`${SELECT} ${w} GROUP BY d.id ORDER BY d.id LIMIT ? OFFSET ?`).all(...args, p.limit, p.offset);
  res.json(page(req, p, total, rows.map(out)));
}));

router.get('/:id', (req, res) => {
  const d = find(req.params.categoryId, req.params.id);
  if (!d) return res.status(404).json({ error: 'Dronas nerastas' });
  res.json(out(d));
});

router.post('/', requireRole('admin'), check(schema), (req, res) => {
  const vals = fields.map((f) => req.body[f] ?? null);
  const r = db.prepare(`INSERT INTO drones (category_id, ${fields.join(', ')}) VALUES (?, ${fields.map(() => '?').join(', ')})`)
    .run(req.params.categoryId, ...vals);
  res.status(201).location(`/api/categories/${req.params.categoryId}/drones/${r.lastInsertRowid}`)
    .json(out(find(req.params.categoryId, r.lastInsertRowid)));
});

router.put('/:id', requireRole('admin'), check(schema, true), (req, res) => {
  const d = find(req.params.categoryId, req.params.id);
  if (!d) return res.status(404).json({ error: 'Dronas nerastas' });
  const vals = fields.map((f) => (req.body[f] !== undefined ? req.body[f] : d[f]));
  db.prepare(`UPDATE drones SET ${fields.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`).run(...vals, d.id);
  res.json(out(find(req.params.categoryId, d.id)));
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const r = db.prepare('DELETE FROM drones WHERE id = ? AND category_id = ?').run(req.params.id, req.params.categoryId);
  if (!r.changes) return res.status(404).json({ error: 'Dronas nerastas' });
  res.status(204).end();
});

module.exports = router;
