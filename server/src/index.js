const app = require('./app');
require('./seed')();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serveris veikia http://localhost:${port}`));
