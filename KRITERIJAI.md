# Vertinimo kriterijai ir kur jie įgyvendinti

Kiekvienas kriterijus iš „Laboratorinių darbų vertinimo kriterijai“: ką jis reikalauja, kaip tai padaryta ir kurioje vietoje kodas. Nuorodos veda į failą ir eilutę.

---

## 1 laboratorinis darbas – REST API (10 b.)

### Bent 3 taikomosios srities objektai ir operacijos su jais (3 b.)

| Reikalavimas | Kaip įvykdyta | Kur |
|---|---|---|
| 3 objektai, ne naudotojų lentelė | Kategorija, Dronas, Atsiliepimas | [db.js:25-51](lab1/server/src/db.js:25) |
| Objektai iš kelių laukų | Kategorija: `name`, `description`, `created_at`. Dronas: `name`, `manufacturer`, `price`, `flight_time`, `weight`, `image_url`. Atsiliepimas: `rating`, `comment`, `recommended`, `flown_at` | [db.js](lab1/server/src/db.js) |
| CRUD + LIST kiekvienam | Po 5 metodus (GET sąrašas, GET vienas, POST, PUT, DELETE) | [categories.js](lab1/server/src/routes/categories.js), [drones.js](lab1/server/src/routes/drones.js), [reviews.js](lab1/server/src/routes/reviews.js) |
| Puslapiavimas | `?page=2&limit=5` visuose sąrašuose. Atsakyme `meta: { page, limit, total, totalPages }`. Neteisingos reikšmės → 400 | [list.js:6](lab1/server/src/list.js:6) `paging()`, [list.js:38](lab1/server/src/list.js:38) `page()` |
| Filtravimas | Kategorijos `?search=`. Dronai `?manufacturer=`, `?minPrice=`, `?maxPrice=`, `?search=`. Atsiliepimai `?minRating=`, `?recommended=` | [categories.js:17](lab1/server/src/routes/categories.js:17), [drones.js:31](lab1/server/src/routes/drones.js:31), [reviews.js:32](lab1/server/src/routes/reviews.js:32) |
| Hypermedia | Kiekvienas objektas turi `_links` (self, drones / category, reviews / drone). Sąrašai turi `_links` self, first, last, prev, next. `GET /api` grąžina įėjimo taškų nuorodas | [list.js:64](lab1/server/src/list.js:64) `links`, [app.js:17](lab1/server/src/app.js:17) |
| Resursas iš kelių (≥2) esybių | **`GET /api/dashboard`**: kategorijos + dronai + atsiliepimai + naudotojai. **`GET /api/auth/me`**: naudotojas + jo atsiliepimai + dronai + kategorijos. Be to, dronų sąraše yra `avg_rating` ir `review_count` iš atsiliepimų | [dashboard.js:6](lab1/server/src/routes/dashboard.js:6), [routes.js:64](lab2/auth/routes.js:64) |

### Objektų hierarchinis sąryšis (1 b.)

`Kategorija 1 → * Dronas 1 → * Atsiliepimas`. Ryšiai vienas-su-daug per `category_id` ir `drone_id` (FK su `ON DELETE CASCADE`), vienas-su-vienu ryšių nėra, naudotojų lentelė į hierarchiją neįeina.

- Schema: [db.js:33](lab1/server/src/db.js:33), [db.js:44](lab1/server/src/db.js:44)
- Apimties valdymas (scoping) per URL: vaikinis resursas ieškomas tik tėvinio viduje (`WHERE id = ? AND category_id = ?`), kitaip 404 – [drones.js:23](lab1/server/src/routes/drones.js:23), [reviews.js:20](lab1/server/src/routes/reviews.js:20)
- UML: [lab1/diagramos/duomenu-modelis.png](lab1/diagramos/duomenu-modelis.png)

### Paruošta testavimo aplinka (1 b.)

- Postman rinkinys: [lab1/EuroDroneHub.postman_collection.json](lab1/EuroDroneHub.postman_collection.json) – **48 užklausos, 116 patikrinimų**, apima **visus** prieigos taškus: 15 CRUD, `/dashboard`, `register`, `login`, `refresh`, `logout`, `me`, puslapiavimą, filtrus ir klaidas.
- Aplinkos: [local](lab1/EuroDroneHub-local.postman_environment.json), [cloud](lab1/EuroDroneHub-cloud.postman_environment.json).
- Paleidimas terminale: `npm run test:api` (Newman). Swagger UI: `/api-docs`.

### Duomenų bazė užpildyta prasmingais duomenimis (1 b.)

[seed.js](lab1/server/src/seed.js): **5 kategorijos, 11 dronų, 11 atsiliepimų** (tikri modeliai, kainos, lietuviški komentarai), 5 naudotojai. Kiekvienoje hierarchijos lentelėje yra ≥5 įrašų.
Padidinus `SEED_VERSION` ([seed.js:5](lab1/server/src/seed.js:5)), serveris paleidimo metu pats perrašo demonstracinius duomenis (ir Railway).

### Grąžinami teisingi kodai (2 b.)

| Kodas | Kada | Kur |
|---|---|---|
| 200 | GET, PUT sėkmingai | visi maršrutai |
| 201 + `Location` | POST sukurta | pvz. [categories.js:34](lab1/server/src/routes/categories.js:34) |
| 204 | DELETE, logout | pvz. [categories.js:49](lab1/server/src/routes/categories.js:49) |
| 400 | Blogas JSON, tuščias body, blogi `?page`/filtrai, blogai užkoduotas URL | [app.js:41](lab1/server/src/app.js:41), [validate.js:24](lab1/server/src/validate.js:24), [list.js:54](lab1/server/src/list.js:54) |
| 401 | Nėra / blogas / pasibaigęs / atšauktas žetonas | [auth.js:24](lab2/auth/auth.js:24), [auth.js:38](lab2/auth/auth.js:38) |
| 403 | Rolė neturi teisės arba svetimas atsiliepimas | [auth.js:38](lab2/auth/auth.js:38), [reviews.js:66](lab1/server/src/routes/reviews.js:66) |
| 404 | Nėra resurso ar jo tėvinio resurso, nežinomas `/api/...` | [drones.js:23](lab1/server/src/routes/drones.js:23), [app.js:32](lab1/server/src/app.js:32) |
| 409 | Toks naudotojo vardas jau yra | [routes.js:18](lab2/auth/routes.js:18) |
| 422 | Laukų reikšmės netinkamos, privalomas laukas `null` | [validate.js:8](lab1/server/src/validate.js:8) |
| **ne 500** | `PUT {"name": null}` anksčiau duodavo 500, dabar 422. Kitos kliento klaidos paverčiamos 4xx | [validate.js:8](lab1/server/src/validate.js:8), [app.js:46](lab1/server/src/app.js:46) |

### REST semantikos laikymasis ir apimtis (2 b.)

- Daiktavardžiai ir HTTP metodai, jokių `/createX` ar `?id=`: [app.js:24-27](lab1/server/src/app.js:24).
- Hierarchinis metodas per **visus 3 objektus**: `GET /api/categories/{cid}/drones/{did}/reviews` (ir `.../reviews/{id}`) – [reviews.js:32](lab1/server/src/routes/reviews.js:32).
- Query parametrai naudojami tik filtrams ir puslapiavimui, ne resurso identifikavimui.

### Gynimui (1 LD)

- **REST principai**: *stateless* – kiekviena užklausa neša JWT, serveris nelaiko sesijos. *Uniform interface* – vienodi URL, metodai, kodai, `_links`. *Cacheable* – GET yra saugūs ir idempotentiški, juos galima kešuoti (Cache-Control antraščių nėra – žinoti, kad tai nerealizuota). *Client-server* – React ir API atskirti. *Layered system* – Railway proxy prieš serverį.
- **Architektūra**: keliai aprašyti [app.js:24-27](lab1/server/src/app.js:24), logika – `routes/*.js`, validacija – [validate.js](lab1/server/src/validate.js), DB – [db.js](lab1/server/src/db.js).
- **Naujo objekto pridėjimas**: lentelė `db.js` → naujas `routes/x.js` (nukopijuoti `categories.js` šabloną) → `app.use(...)` `app.js` faile.
- **Kodėl SQLite**: įdiegta Node.js (`node:sqlite`), nereikia atskiro serverio, vienas failas Railway volume. Alternatyvos – PostgreSQL, MySQL (didesnė apkrova, lygiagretus rašymas), MongoDB (dokumentinė).

---

## 2 laboratorinis darbas – autentifikacija ir autorizacija (10 b.)

### Integruota autorizacija naudojant JWT (3 b.)

- Žetonas kuriamas ir pasirašomas: [auth.js:8](lab2/auth/auth.js:8) `signAccess()`. Payload: `sub` (ID), `username`, `role`, `jti`, `iat`, `exp`.
- Tikrinamas kiekvienoje užklausoje: [auth.js:24](lab2/auth/auth.js:24) `authOptional()` (įjungta [app.js:15](lab1/server/src/app.js:15)).
- Apsaugoti prieigos taškai: [auth.js:38](lab2/auth/auth.js:38) `requireRole()` – visi POST/PUT/DELETE ir `GET /auth/me`.

### Pasirinkta tinkama žetonų atnaujinimo strategija (2 b.)

- Access žetonas – 15 min. ([auth.js:6](lab2/auth/auth.js:6)), refresh – 7 d., atsitiktinė 80 simbolių eilutė DB ([routes.js:8-12](lab2/auth/routes.js:8)).
- **Rotacija**: `POST /auth/refresh` atšaukia seną ir išduoda naują porą. Pakartotinai panaudojus seną žetoną atšaukiami visi naudotojo žetonai (vagystės aptikimas) – [routes.js:36](lab2/auth/routes.js:36).
- Klientas atnaujina automatiškai: gavęs 401, kviečia refresh ir pakartoja užklausą – [api.js:8](lab3/client/src/api.js:8), [api.js:27](lab3/client/src/api.js:27). Naudotojui nereikia jungtis iš naujo 7 dienas.

### Realizuoti register, login ir logout metodai (2 b.)

- `register` (201, 409): [routes.js:18](lab2/auth/routes.js:18), slaptažodis maišomas `bcrypt`.
- `login` (200, 401): [routes.js:28](lab2/auth/routes.js:28).
- `logout` (204): [routes.js:51](lab2/auth/routes.js:51) – refresh žetonas pažymimas `revoked = 1`, access žetono `jti` įrašomas į `revoked_tokens` ([db.js:21](lab1/server/src/db.js:21)). Po atsijungimo tas pats access žetonas iškart duoda 401 ([auth.js:21](lab2/auth/auth.js:21)).
- Žetonai valdomi serverio pusėje (vietinė autentifikacija).

### Autorizacija pagal rolę ir ID, ≥3 rolės (3 b.)

| Rolė | Gali | Kur nustatoma |
|---|---|---|
| `member` (narys) | rašyti atsiliepimus, keisti / trinti **tik savo** | registracija [routes.js:18](lab2/auth/routes.js:18) |
| `moderator` | keisti / trinti **bet kurį** atsiliepimą, bet negali kurti kategorijų ir dronų (403) | [reviews.js:18](lab1/server/src/routes/reviews.js:18) |
| `admin` | viską, įskaitant kategorijų ir dronų CRUD | [categories.js:34](lab1/server/src/routes/categories.js:34), [drones.js:55](lab1/server/src/routes/drones.js:55) |
| (svečias) | tik GET | – |

- Apsauga pagal ID, kurios rolė nesuteikia: narys negali keisti svetimo atsiliepimo, net žinodamas jo ID – [reviews.js:66](lab1/server/src/routes/reviews.js:66) `ownerOrModerator()`. Autorius imamas iš žetono (`req.user.id`), ne iš body.
- Demonstracinės paskyros: `admin/admin123`, `moderator/moder123`, `jonas/jonas123`, `ruta/ruta123`, `tomas/tomas123`.

### Gynimui (2 LD)

- **Žetono struktūra**: `header.payload.signature` (Base64URL). Pavyzdys – Postman „Prisijungti (admin)“ → jwt.io.
- **Pasirašymas**: HS256 su slaptu raktu `JWT_SECRET` ([auth.js:5](lab2/auth/auth.js:5)). Algoritmas užfiksuotas ir tikrinant (`algorithms: ['HS256']`), todėl `alg: none` ataka neveikia. **Railway nustatykite `JWT_SECRET` aplinkos kintamąjį**, kitaip naudojamas numatytasis `dev_access_secret`.
- **Rolė žetone**: teisėms patikrinti nereikia DB užklausos. Pakeisti rolės neįmanoma, nes pasikeistų parašas.
- **Perdavimas**: `Authorization: Bearer` antraštė, saugoma `localStorage` ([api.js:1](lab3/client/src/api.js:1)). Pliusai: nėra CSRF, paprasta. Minusai: XSS atveju žetoną galima pavogti (cookie su `HttpOnly` + `Secure` to išvengtų, bet tada reikia CSRF apsaugos).
- **Grėsmės**: SQL injekcijos – visur parametrizuotos užklausos (`?`). Teisių eskalacija – rolė tik iš pasirašyto žetono, registracija visada suteikia `member`. Slaptažodžiai – `bcrypt`.
- **Statuso kodai**: 401 (nėra / blogas / atšauktas žetonas), 403 (per maža rolė arba svetimas resursas). Postman aplanke „Klaidos“ ir „Atsijungimas“.

---

## 3 laboratorinis darbas – naudotojo sąsaja (10 b.)

### Sąsaja leidžia panaudoti visus API metodus (2 b.)

- CRUD per sąsają: kategorijos [Home.jsx](lab3/client/src/pages/Home.jsx), dronai [Category.jsx](lab3/client/src/pages/Category.jsx), atsiliepimai [Drone.jsx](lab3/client/src/pages/Drone.jsx). Puslapiavimas, paieška ir filtrai taip pat naudojami.
- Registracija ir prisijungimas: [Auth.jsx](lab3/client/src/pages/Auth.jsx). Žetonų atnaujinimas: [api.js:8](lab3/client/src/api.js:8). Panelė: [Dashboard.jsx](lab3/client/src/pages/Dashboard.jsx). Profilis: [Profile.jsx](lab3/client/src/pages/Profile.jsx).
- ≥4 skirtingi įvesties elementai: `text`, `password`, `number`, `search`, `select`, `textarea`, `range` ([Drone.jsx:142](lab3/client/src/pages/Drone.jsx:142)), `date` ([Drone.jsx:144](lab3/client/src/pages/Drone.jsx:144)), `checkbox` ([Drone.jsx:146](lab3/client/src/pages/Drone.jsx:146)).
- API grąžina tik JSON.

### Paveiksliukai, vektorinės ikonėlės, header, footer, modaliniai langai (2 b.)

- Paveiksliukai keičia dydį pagal langą (`width: 100%`, `aspect-ratio`): [index.css:19](lab3/client/src/index.css:19), [index.css:64](lab3/client/src/index.css:64). Failai: [public/img/](lab3/client/public/img).
- SVG ikonėlės prie **visų** meniu punktų: [components.jsx:26](lab3/client/src/components.jsx:26). Ikonų šaltinis: [icons.jsx](lab3/client/src/icons.jsx) (inline SVG).
- Modalai: kūrimas / redagavimas ([Home.jsx:85](lab3/client/src/pages/Home.jsx:85), [Category.jsx:108](lab3/client/src/pages/Category.jsx:108), [Drone.jsx:114](lab3/client/src/pages/Drone.jsx:114)) ir **trynimo patvirtinimas** ([components.jsx:93](lab3/client/src/components.jsx:93) `ConfirmModal`).
- Header ir footer: [components.jsx:12](lab3/client/src/components.jsx:12), [components.jsx:47](lab3/client/src/components.jsx:47).

### Panaudotos animacijos (1 b.)

Visos [index.css](lab3/client/src/index.css): `@keyframes fadeIn` / `slideUp` (puslapis, modalas) [index.css:123](lab3/client/src/index.css:123), `spin` (kraunama) [index.css:151](lab3/client/src/index.css:151), `slideIn` (pranešimai) [index.css:159](lab3/client/src/index.css:159), `grow` (statistikos juostos) [index.css:175](lab3/client/src/index.css:175). Hover: kortelių pakilimas [index.css:58](lab3/client/src/index.css:58), paveikslo priartinimas [index.css:65](lab3/client/src/index.css:65), logotipo pasisukimas, meniu pabraukimas.

### Vientisa sąsaja, pagyvinta CSS (2 b.)

- Spalvų paletė per CSS kintamuosius: [index.css:1-15](lab3/client/src/index.css:1) (tamsiai mėlyna + oranžinė + žydra).
- Nestandartiniai šriftai *Exo 2* ir *Inter* iš Google Fonts: įtraukti [index.html:9](lab3/client/index.html:9), naudojami [index.css:17-18](lab3/client/src/index.css:17).
- Grįžtamasis ryšys be `alert()` / `confirm()`: pranešimai (toast) [components.jsx:138](lab3/client/src/components.jsx:138), klaidų blokai formose, trynimo modalas, kraunamo turinio indikatorius.

### Responsive layout (1 b.)

- Breakpoint'ai: `@media (max-width: 1024px)` [index.css:182](lab3/client/src/index.css:182) ir `@media (max-width: 768px)` [index.css:186](lab3/client/src/index.css:186).
- Hamburgeris: mygtukas [components.jsx:23](lab3/client/src/components.jsx:23), CSS [index.css:187](lab3/client/src/index.css:187).

### Publikavimas (2 b.)

- Railway: https://saitynai-production-9875ec70.up.railway.app. Backend ir frontend viename Docker konteineryje ([Dockerfile](Dockerfile), [railway.json](railway.json)): Express aptarnauja `/api/*` ir sukompiliuotą React ([app.js:35](lab1/server/src/app.js:35)).
- **Po šių pakeitimų reikia perdiegti** (`railway up`). Paleistas serveris pats atnaujins DB (5 kategorijos, moderatorius).

### Gynimui (3 LD)

- **Karkasas**: React 19 + Vite – komponentai, didelė bendruomenė. Alternatyvos: Vue, Angular, Svelte.
- **Architektūra ir būsena**: komponentinė, vienos krypties duomenų srautas. Lokali būsena – `useState`. Globali – React Context: prisijungimas [auth.jsx](lab3/client/src/auth.jsx), pranešimai [components.jsx:138](lab3/client/src/components.jsx:138). Žetonai – `localStorage`.
- **Šriftai**: `<link>` į Google Fonts [index.html:9](lab3/client/index.html:9) + `font-family` [index.css:17](lab3/client/src/index.css:17).
- **Animacija**: `@keyframes` + `animation` / `transition` (eilutės nurodytos aukščiau).
- **Breakpoint**: `@media (max-width: 768px)` – norint pakeisti, keisti skaičių [index.css:186](lab3/client/src/index.css:186).
- **Vektorinė grafika**: neprarandama kokybė didinant, mažas dydis, spalva keičiama per `currentColor`. Šaltiniai – [icons.jsx](lab3/client/src/icons.jsx) ir [public/img/*.svg](lab3/client/public/img).

---

## Inžinerinis projektas – ataskaita (10 b.)

| Kriterijus | Kur | Pastaba |
|---|---|---|
| Struktūra, formatavimas, turinys (3 b.) | [ATASKAITA.md](ATASKAITA.md) (GitHub) | Sutikrinkite skyrius su dėstytojo pateiktu šablonu |
| Diegimo diagrama (2 b.) | [ATASKAITA.md](ATASKAITA.md) 3.1 skyrius, [lab0/diagramos/diegimo-diagrama.png](lab0/diagramos/diegimo-diagrama.png) | Dabar PlantUML – **perbraižyti MagicDraw** ir pakeisti PNG |
| Naudotojo sąsaja ir jos projektas (2 b.) | ATASKAITA 7 skyrius, [lab3/wireframes/](lab3/wireframes) (4 wireframe'ai), [lab3/screenshots/](lab3/screenshots) | Iškarpose dar nėra naujų Statistikos / Profilio puslapių ir filtrų – verta pridėti |
| OpenAPI specifikacija (2 b.) | [lab1/api-spec.yaml](lab1/api-spec.yaml), Swagger `/api-docs`, ATASKAITA 6 skyrius | Su pavyzdžiais ir visais atsakymų kodais |
| Išvados (1 b.) | ATASKAITA 9 skyrius | Sunumeruotos, su „kas iš to“ |
