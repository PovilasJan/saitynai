const bcrypt = require('bcryptjs');
const db = require('./db');

// Padidinus versiją, paleidus serverį DB automatiškai užpildoma iš naujo (taip pat ir Railway).
const SEED_VERSION = 2;

function seed(force = false) {
  const version = db.prepare('PRAGMA user_version').get().user_version;
  const count = db.prepare('SELECT COUNT(*) c FROM categories').get().c;
  if (count > 0 && version >= SEED_VERSION && !force) return;

  db.exec('DELETE FROM reviews; DELETE FROM drones; DELETE FROM categories; DELETE FROM refresh_tokens; DELETE FROM revoked_tokens; DELETE FROM users;');
  db.exec("DELETE FROM sqlite_sequence");

  const addUser = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
  addUser.run('admin', bcrypt.hashSync('admin123', 10), 'admin');        // 1
  addUser.run('jonas', bcrypt.hashSync('jonas123', 10), 'member');       // 2
  addUser.run('ruta', bcrypt.hashSync('ruta123', 10), 'member');         // 3
  addUser.run('moderator', bcrypt.hashSync('moder123', 10), 'moderator'); // 4
  addUser.run('tomas', bcrypt.hashSync('tomas123', 10), 'member');       // 5

  const addCat = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
  addCat.run('FPV dronai', 'Greiti, manevringi dronai lenktynėms ir freestyle skrydžiams su FPV akiniais.');
  addCat.run('Filmavimo dronai', 'Dronai su stabilizuota kamera aerofotografijai ir video filmavimui.');
  addCat.run('Pramoniniai dronai', 'Dronai inspekcijoms, kartografavimui ir žemės ūkiui.');
  addCat.run('Mini dronai', 'Lengvesni nei 250 g dronai pradedantiesiems – nereikia registracijos ir lengva pasiimti į kelionę.');
  addCat.run('Pristatymo dronai', 'Krovinių gabenimo dronai siuntoms, medicininėms priemonėms ir logistikai.');

  const addDrone = db.prepare(`INSERT INTO drones (category_id, name, manufacturer, price, flight_time, weight, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  addDrone.run(1, 'Avata 2', 'DJI', 999, 23, 377, '/img/fpv-1.svg');                    // 1
  addDrone.run(1, 'Nazgul5 V3', 'iFlight', 329, 8, 640, '/img/fpv-2.svg');              // 2
  addDrone.run(2, 'Mavic 3 Pro', 'DJI', 2199, 43, 958, '/img/cam-1.svg');               // 3
  addDrone.run(2, 'Mini 4 Pro', 'DJI', 799, 34, 249, '/img/cam-2.svg');                 // 4
  addDrone.run(2, 'EVO Lite+', 'Autel Robotics', 1149, 40, 835, '/img/cam-3.svg');      // 5
  addDrone.run(3, 'Matrice 350 RTK', 'DJI', 11500, 55, 6470, '/img/ind-1.svg');         // 6
  addDrone.run(3, 'Agras T40', 'DJI', 21000, 18, 38000, '/img/ind-2.svg');              // 7
  addDrone.run(4, 'Neo', 'DJI', 199, 18, 135, '/img/mini-1.svg');                       // 8
  addDrone.run(4, 'Cetus Pro', 'BetaFPV', 159, 5, 54, '/img/fpv-2.svg');                // 9
  addDrone.run(5, 'FlyCart 30', 'DJI', 17000, 18, 42500, '/img/del-1.svg');             // 10
  addDrone.run(5, 'Anafi UKR', 'Parrot', 9800, 38, 1250, '/img/ind-1.svg');             // 11

  const addReview = db.prepare(`INSERT INTO reviews (drone_id, user_id, rating, comment, recommended, flown_at)
    VALUES (?, ?, ?, ?, ?, ?)`);
  addReview.run(1, 2, 5, 'Labai lengva valdyti, puikus vaizdas akiniuose.', 1, '2025-06-12');
  addReview.run(1, 3, 4, 'Smagu skraidyti, bet baterija galėtų laikyti ilgiau.', 1, '2025-07-03');
  addReview.run(2, 2, 4, 'Tvirtas rėmas, atlaikė ne vieną kritimą.', 1, '2025-05-20');
  addReview.run(3, 3, 5, 'Geriausia kamera, kokią teko naudoti. Verta savo kainos.', 1, '2025-08-14');
  addReview.run(4, 2, 5, 'Nereikia registracijos, telpa į kišenę.', 1, '2025-09-01');
  addReview.run(5, 3, 3, 'Gera kamera, bet programėlė kartais stringa.', 0, '2025-04-11');
  addReview.run(6, 2, 5, 'Naudojame elektros linijų inspekcijoms, veikia nepriekaištingai.', 1, '2025-03-18');
  addReview.run(8, 5, 4, 'Puikus pirmas dronas vaikui, sekimo režimas veikia gerai.', 1, '2025-10-05');
  addReview.run(9, 5, 3, 'Mažas ir linksmas skraidyti namuose, bet vėjyje nevaldomas.', 0, '2025-08-22');
  addReview.run(10, 3, 5, 'Ūkyje gabename trąšas į sunkiai pasiekiamus laukus, sutaupome daug laiko.', 1, '2025-07-30');
  addReview.run(4, 5, 4, 'Vaizdo kokybė stebina tokiam mažam dronui, tik vėjyje šiek tiek blaškosi.', 1, '2025-09-15');

  db.exec(`PRAGMA user_version = ${SEED_VERSION}`);
  console.log('DB užpildyta pradiniais duomenimis');
}

if (require.main === module) seed(true);
module.exports = seed;
