const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { authOptional } = require('../../../lab2/auth/auth');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');

const app = express();
app.use(cors());
app.use(express.json());
app.use(authOptional);

app.use('/api/auth', require('../../../lab2/auth/routes'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/categories/:categoryId/drones', require('./routes/drones'));
app.use('/api/categories/:categoryId/drones/:droneId/reviews', require('./routes/reviews'));
const spec = YAML.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'api-spec.yaml'), 'utf8'));
spec.servers = [{ url: '/api' }];
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

app.use('/api', (req, res) => res.status(404).json({ error: 'Resursas nerastas' }));

// sukompiliuotas React frontas
const dist = path.join(__dirname, '..', '..', '..', 'lab3', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// blogas JSON -> 400
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Neteisingas JSON formatas' });
  console.error(err);
  res.status(500).json({ error: 'Serverio klaida' });
});

module.exports = app;
