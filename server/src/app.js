const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { authOptional } = require('./auth/auth');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');

const app = express();
app.use(cors());
app.use(express.json());

// auth maršrutai prieš bendrą žetono tikrinimą: login/register/logout turi veikti ir su pasibaigusiu žetonu
app.use('/api/auth', require('./auth/routes'));
app.use(authOptional);

app.get('/api', (req, res) => res.json({ _links: {
  categories: { href: '/api/categories' },
  dashboard: { href: '/api/dashboard' },
  login: { href: '/api/auth/login', method: 'POST' },
  register: { href: '/api/auth/register', method: 'POST' },
  docs: { href: '/api-docs' },
} }));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/categories/:categoryId/drones', require('./routes/drones'));
app.use('/api/categories/:categoryId/drones/:droneId/reviews', require('./routes/reviews'));
const spec = YAML.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'api-spec.yaml'), 'utf8'));
spec.servers = [{ url: '/api' }];
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

app.use('/api', (req, res) => res.status(404).json({ error: 'Resursas nerastas' }));

// sukompiliuotas React frontas
const dist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, req, res, next) => {
  // blogas JSON -> 400
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Neteisingas JSON formatas' });
  // kitos kliento klaidos (pvz. per didelis body - 413, blogai užkoduotas URL - 400)
  const status = err.status || err.statusCode;
  if (status >= 400 && status < 500) return res.status(status).json({ error: 'Neteisinga užklausa' });
  console.error(err);
  res.status(500).json({ error: 'Serverio klaida' });
});

module.exports = app;
