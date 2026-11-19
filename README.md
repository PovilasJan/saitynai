# EuroDroneHub

Dronų katalogas su atsiliepimais: **Kategorija → Dronas → Atsiliepimas**.
Node.js + Express, SQLite, JWT, React (Vite), Docker, Railway.

| | |
|---|---|
| Veikianti sistema | https://saitynai-production-9875ec70.up.railway.app |
| Swagger | https://saitynai-production-9875ec70.up.railway.app/api-docs |
| GitHub | https://github.com/PovilasJan/saitynai |
| Ataskaita | [docs/ataskaita.docx](docs/ataskaita.docx) |

## Prisijungimai

| Rolė | Vardas | Slaptažodis |
|---|---|---|
| Administratorius | `admin` | `admin123` |
| Moderatorius | `moderator` | `moder123` |
| Narys | `jonas` | `jonas123` |
| Narys | `ruta` | `ruta123` |
| Svečias | neprisijungti | – |

## Struktūra

```
saitynai/
├── server/src/          Express API
│   ├── app.js           maršrutai, klaidų apdorojimas
│   ├── db.js            DB lentelės
│   ├── seed.js          pradiniai duomenys
│   ├── validate.js      body validacija (400 / 422)
│   ├── list.js          puslapiavimas, filtrai, _links
│   ├── routes/          categories, drones, reviews, dashboard
│   └── auth/            JWT: auth.js (žetonai, rolės), routes.js (register, login, refresh, logout, me)
├── client/              React klientas (src/pages, src/components.jsx, src/index.css)
├── postman/             Postman rinkinys + local ir cloud aplinkos
├── docs/                ataskaita.docx, wireframes/, screenshots/
├── api-spec.yaml        OpenAPI specifikacija
├── package.json         visos komandos
└── Dockerfile, railway.json
```

## Paleidimas nuo nulio

1. Įsidiekite **Node.js 22.13 arba naujesnį** (https://nodejs.org) ir patikrinkite:
   ```bash
   node -v
   ```
2. Parsisiųskite projektą:
   ```bash
   git clone https://github.com/PovilasJan/saitynai.git
   cd saitynai
   ```
3. Įdiekite priklausomybes (serverio ir kliento):
   ```bash
   npm run install:all
   ```
4. Sukompiliuokite React klientą:
   ```bash
   npm run build
   ```
5. Paleiskite serverį:
   ```bash
   npm start
   ```
6. Atsidarykite http://localhost:3000. Swagger: http://localhost:3000/api-docs.

Pirmą kartą paleidus, sukuriamas `server/data.db` failas su demonstraciniais duomenimis (5 kategorijos, 11 dronų, 11 atsiliepimų). Duomenis atstatyti į pradinius:

```bash
npm run seed
```

Kodo keitimui patogiau dviem terminalais (serveris persikrauna pats, klientas http://localhost:5173):

```bash
npm run dev:api
```

```bash
npm run dev:client
```

Nebūtini aplinkos kintamieji (numatytosios reikšmės tinka lokaliai):

| Kintamasis | Numatyta | Paskirtis |
|---|---|---|
| `PORT` | `3000` | serverio portas |
| `JWT_SECRET` | `dev_access_secret` | JWT parašo raktas (debesyje būtinai savas) |
| `ACCESS_TTL` | `15m` | access žetono galiojimas |
| `DB_FILE` | `server/data.db` | SQLite failo kelias |

## Testavimas su Postman

1. Postman → **Import** → pasirinkite visus 3 failus iš `postman/`.
2. Dešinėje viršuje pasirinkite aplinką **EuroDroneHub-local** (serveris turi veikti) arba **EuroDroneHub-cloud**.
3. Rinkinys **EuroDroneHub API** → **Run**. Rinkinys pats prisijungia, išsisaugo žetonus ir sukurtų objektų ID (48 užklausos, 116 patikrinimų).

Tas pats iš terminalo (veikiant lokaliam serveriui):

```bash
npm run test:api
```

Rinkinys sukuria ir ištrina testinę kategoriją bei užregistruoja naują naudotoją, todėl debesyje jį leiskite tik prieš gynimą, jei reikia.

## Diegimas į Railway

Railway projektas `saitynai` jau sukonfigūruotas: kintamieji `JWT_SECRET`, `DB_FILE=/data/data.db` ir volume `/data`. Perdiegti:

```bash
railway login
```

```bash
railway link --project saitynai --environment production
```

```bash
railway up
```

## API

| Resursas | Sąrašas | Sukurti | Gauti | Atnaujinti | Ištrinti |
|---|---|---|---|---|---|
| Kategorijos | `GET /api/categories` | `POST` | `GET /api/categories/{id}` | `PUT` | `DELETE` |
| Dronai | `GET /api/categories/{cid}/drones` | `POST` | `GET …/drones/{id}` | `PUT` | `DELETE` |
| Atsiliepimai | `GET …/drones/{did}/reviews` | `POST` | `GET …/reviews/{id}` | `PUT` | `DELETE` |

- Sąrašai: `{ data, meta, _links }`, puslapiavimas `?page=1&limit=10`.
- Filtrai: kategorijos `?search=`, dronai `?manufacturer=&minPrice=&maxPrice=&search=`, atsiliepimai `?minRating=&recommended=`.
- Statistika: `GET /api/dashboard`.
- Autentifikacija: `POST /api/auth/register`, `/login`, `/refresh`, `/logout`, `GET /api/auth/me`. Access žetonas 15 min., refresh 7 d. (keičiamas kiekvieną kartą), logout atšaukia abu.
- Teisės: kategorijas ir dronus keičia tik `admin`; atsiliepimus rašo prisijungę; savo atsiliepimą keičia autorius, bet kurį – `moderator` ir `admin`.
