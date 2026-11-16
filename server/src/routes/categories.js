const router = require('express').Router();
const db = require('../db');
const { requireRole } = require('../auth');
const { check } = require('../validate');

const schema = {
  name: { type: 'string', required: true, min: 2, max: 100 },
  description: { type: 'string', max: 1000 },
};

const find = (id) => db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

router.get('/', (req, res) => {
  res.json(db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM drones d WHERE d.category_id = c.id) AS drone_count
    FROM categories c ORDER BY c.id`).all());
});

router.get('/:id', (req, res) => {
  const c = find(req.params.id);
  if (!c) return res.status(404).json({ error: 'Kategorija nerasta' });
  res.json(c);
});

router.post('/', requireRole('admin'), check(schema), (req, res) => {
  const { name, description = null } = req.body;
  const r = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run(name, description);
  res.status(201).location(`/api/categories/${r.lastInsertRowid}`).json(find(r.lastInsertRowid));
});

router.put('/:id', requireRole('admin'), check(schema, true), (req, res) => {
  const c = find(req.params.id);
  if (!c) return res.status(404).json({ error: 'Kategorija nerasta' });
  const { name = c.name, description = c.description } = req.body;
  db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(name, description, c.id);
  res.json(find(c.id));
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const r = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Kategorija nerasta' });
  res.status(204).end();
});

module.exports = router;
