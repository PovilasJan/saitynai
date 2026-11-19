// Bendri sąrašų įrankiai: puslapiavimas, filtrų skaitymas, hypermedia nuorodos.

class BadQuery extends Error {}

// ?page=2&limit=5 -> { page, limit, offset }; neteisingos reikšmės -> 400
function paging(query, defLimit = 10) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? defLimit : Number(query.limit);
  if (!Number.isInteger(page) || page < 1) throw new BadQuery('page turi būti sveikas skaičius >= 1');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new BadQuery('limit turi būti sveikas skaičius nuo 1 iki 100');
  return { page, limit, offset: (page - 1) * limit };
}

// tekstinis filtras (jei parametras pakartotas - imamas pirmas)
function text(query, key) {
  let v = query[key];
  if (Array.isArray(v)) v = v[0];
  if (v === undefined || v === '') return undefined;
  return String(v).trim();
}

function number(query, key) {
  const v = text(query, key);
  if (v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new BadQuery(`${key} turi būti skaičius`);
  return n;
}

function bool(query, key) {
  const v = text(query, key);
  if (v === undefined) return undefined;
  if (v !== 'true' && v !== 'false') throw new BadQuery(`${key} turi būti true arba false`);
  return v === 'true';
}

// sąrašo atsakymas: { data, meta, _links } su self/first/last/prev/next nuorodomis
function page(req, { page, limit }, total, data) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const href = (p) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) if (k !== 'page' && k !== 'limit') q.set(k, Array.isArray(v) ? v[0] : v);
    q.set('page', p);
    q.set('limit', limit);
    return { href: `${req.baseUrl}?${q}` };
  };
  const _links = { self: href(page), first: href(1), last: href(totalPages) };
  if (page > 1) _links.prev = href(Math.min(page - 1, totalPages));
  if (page < totalPages) _links.next = href(page + 1);
  return { data, meta: { page, limit, total, totalPages }, _links };
}

// apgaubia handlerį: BadQuery -> 400
const listRoute = (fn) => (req, res) => {
  try {
    fn(req, res);
  } catch (e) {
    if (e instanceof BadQuery) return res.status(400).json({ error: 'Neteisingi užklausos parametrai', details: [e.message] });
    throw e;
  }
};

// hypermedia nuorodos kiekvienam resursui
const links = {
  category: (c) => ({
    self: { href: `/api/categories/${c.id}` },
    drones: { href: `/api/categories/${c.id}/drones` },
  }),
  drone: (d) => ({
    self: { href: `/api/categories/${d.category_id}/drones/${d.id}` },
    category: { href: `/api/categories/${d.category_id}` },
    reviews: { href: `/api/categories/${d.category_id}/drones/${d.id}/reviews` },
  }),
  review: (r, categoryId) => ({
    self: { href: `/api/categories/${categoryId}/drones/${r.drone_id}/reviews/${r.id}` },
    drone: { href: `/api/categories/${categoryId}/drones/${r.drone_id}` },
  }),
};

module.exports = { paging, text, number, bool, page, listRoute, links };
