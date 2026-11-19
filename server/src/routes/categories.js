const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth/auth');
const { check } = require('../validate');
const { paging, text, page, listRoute, links } = require('../list');

const schema = {
  name: { type: 'string', required: true, min: 2, max: 100 },
  description: { type: 'string', max: 1000 },
};

const find = (id) => db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM drones d WHERE d.category_id = c.id) AS drone_count
  FROM categories c WHERE c.id = ?`).get(id);
const out = (c) => ({ ...c, _links: links.category(c) });

// GET /categories?search=fpv&page=1&limit=10
router.get('/', listRoute((req, res) => {
  const p = paging(req.query);
  const search = text(req.query, 'search');
  const where = search ? 'WHERE c.name LIKE ? OR c.description LIKE ?' : '';
  const args = search ? [`%${search}%`, `%${search}%`] : [];
  const total = db.prepare(`SELECT COUNT(*) n FROM categories c ${where}`).get(...args).n;
  const rows = db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM drones d WHERE d.category_id = c.id) AS drone_count
    FROM categories c ${where} ORDER BY c.id LIMIT ? OFFSET ?`).all(...args, p.limit, p.offset);
  res.json(page(req, p, total, rows.map(out)));
}));

router.get('/:id', (req, res) => {
  const c = find(req.params.id);
  if (!c) return res.status(404).json({ error: 'Kategorija nerasta' });
  res.json(out(c));
});

router.post('/', requireRole('admin'), check(schema), (req, res) => {
  const { name, description = null } = req.body;
  const r = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description);
  res.status(201).location(`/api/categories/${r.lastInsertRowid}`).json(out(find(r.lastInsertRowid)));
});

router.put('/:id', requireRole('admin'), check(schema, true), (req, res) => {
  const c = find(req.params.id);
  if (!c) return res.status(404).json({ error: 'Kategorija nerasta' });
  const name = req.body.name !== undefined ? req.body.name : c.name;
  const description = req.body.description !== undefined ? req.body.description : c.description;
  db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(name, description, c.id);
  res.json(out(find(c.id)));
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const r = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Kategorija nerasta' });
  res.status(204).end();
});



module.exports = router;
