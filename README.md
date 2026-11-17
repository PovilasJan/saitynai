# EuroDroneHub – saitynai

KTU „Saityno taikomųjų programų projektavimas“. Drone catalogue with reviews: **Category → Drone → Review**.
Stack: Node.js + Express, SQLite, JWT, React (Vite), Swagger, Postman, Docker, Railway.

## Links

| What | Where |
|---|---|
| Live site | https://saitynai-production-9875ec70.up.railway.app |
| Swagger (API docs) | https://saitynai-production-9875ec70.up.railway.app/api-docs |
| API example | https://saitynai-production-9875ec70.up.railway.app/api/categories |
| GitHub | https://github.com/PovilasJan/saitynai |
| Railway project | https://railway.com/project/65f5bc7e-e081-4e81-ae2c-14c282101596 |
| Local site | http://localhost:3000 |
| Local Swagger | http://localhost:3000/api-docs |

## Logins

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Member | `jonas` | `jonas123` |
| Member | `ruta` | `ruta123` |
| Guest | – (just don't log in) | – |

## Folders

| Folder / file | Contents |
|---|---|
| `lab0/` | `Lab0_Projekto_uzduotis.docx` + UML use case and deployment diagrams |
| `lab1/` | `Lab1_REST_API.docx`, `api-spec.yaml` (OpenAPI), Postman collection + 2 environments, UML diagrams, **`server/` = the Express API code** |
| `lab2/` | `Lab2_Autentifikacija_JWT.docx`, UML sequence + activity diagrams, **`auth/` = the JWT code** (`auth.js`, `routes.js`) |
| `lab3/` | **`client/` = the React frontend**, wireframes, screenshots |
| `package.json` | server dependencies + all commands (run them from this root folder) |
| `Dockerfile`, `railway.json` | cloud deploy |
| `ATASKAITA.md` | full report in Lithuanian (final report) |
| `DEFENCE.md` | how to prepare and what to show at each defence |

Each `lab*/diagramos/` folder has the `.png` and the PlantUML source `.puml`.

## Commands

```bash
npm run install:all   # first time only
npm run build         # build React
npm start             # http://localhost:3000
npm run seed          # reset DB to demo data
npm run test:api      # run Postman tests from terminal (server must be running)
railway up            # redeploy to Railway
```

## API in one table

| Resource | List | Create | Get | Update | Delete |
|---|---|---|---|---|---|
| Categories | `GET /api/categories` | `POST /api/categories` | `GET /api/categories/{id}` | `PUT …/{id}` | `DELETE …/{id}` |
| Drones (hierarchical) | `GET /api/categories/{cid}/drones` | `POST` same | `GET …/drones/{id}` | `PUT` | `DELETE` |
| Reviews | `GET …/drones/{did}/reviews` | `POST` same | `GET …/reviews/{id}` | `PUT` | `DELETE` |

Auth: `POST /api/auth/register`, `/login`, `/refresh`, `/logout`, `GET /api/auth/me`.
Access token 15 min (role inside), refresh token 7 days, rotated on every refresh.
