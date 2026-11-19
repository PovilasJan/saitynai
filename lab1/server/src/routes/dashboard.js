const router = require('express').Router();
const db = require('../db');

// Panelė (dashboard): vienas resursas, sukonstruotas iš 4 esybių -
// kategorijų, dronų, atsiliepimų ir naudotojų.
router.get('/', (req, res) => {
  const totals = db.prepare(`SELECT
    (SELECT COUNT(*) FROM categories) AS categories,
    (SELECT COUNT(*) FROM drones) AS drones,
    (SELECT COUNT(*) FROM reviews) AS reviews,
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT ROUND(AVG(rating), 2) FROM reviews) AS avg_rating`).get();

  const categories = db.prepare(`SELECT c.id, c.name, COUNT(d.id) AS drone_count,
      ROUND(AVG(d.price), 0) AS avg_price, MIN(d.price) AS min_price, MAX(d.price) AS max_price
    FROM categories c LEFT JOIN drones d ON d.category_id = c.id
    GROUP BY c.id ORDER BY c.id`).all()
    .map((c) => ({ ...c, _links: { self: { href: `/api/categories/${c.id}` }, drones: { href: `/api/categories/${c.id}/drones` } } }));

  const topDrones = db.prepare(`SELECT d.id, d.name, d.manufacturer, d.price, d.image_url, d.category_id,
      c.name AS category_name, ROUND(AVG(r.rating), 1) AS avg_rating, COUNT(r.id) AS review_count
    FROM drones d JOIN categories c ON c.id = d.category_id JOIN reviews r ON r.drone_id = d.id
    GROUP BY d.id ORDER BY avg_rating DESC, review_count DESC, d.id LIMIT 5`).all()
    .map((d) => ({ ...d, _links: { self: { href: `/api/categories/${d.category_id}/drones/${d.id}` } } }));

  const latestReviews = db.prepare(`SELECT r.id, r.rating, r.comment, r.created_at, u.username,
      d.id AS drone_id, d.name AS drone_name, c.id AS category_id, c.name AS category_name
    FROM reviews r JOIN users u ON u.id = r.user_id JOIN drones d ON d.id = r.drone_id JOIN categories c ON c.id = d.category_id
    ORDER BY r.id DESC LIMIT 5`).all()
    .map((r) => ({ ...r, _links: {
      self: { href: `/api/categories/${r.category_id}/drones/${r.drone_id}/reviews/${r.id}` },
      drone: { href: `/api/categories/${r.category_id}/drones/${r.drone_id}` },
    } }));

  res.json({ totals, categories, topDrones, latestReviews, _links: { self: { href: '/api/dashboard' }, categories: { href: '/api/categories' } } });
});

module.exports = router;
