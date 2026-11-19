# Defence prep

Quick links and passwords are in [README.md](README.md).

## 1. One-time setup (≈10 min)

1. **Node.js 22+**: check with `node -v`.
2. **Install and test locally** (backup in case the internet or Railway is down):
   ```bash
   cd Desktop/saitynai
   npm run install:all
   npm run build
   npm start
   ```
   Open http://localhost:3000. You should see 3 drone categories.
3. **Postman**: install from https://www.postman.com/downloads/ and sign in, or click *Skip / use lightweight client*.
4. **Import into Postman**: *Import* → drag in these 3 files from `lab1/`:
   - `EuroDroneHub.postman_collection.json` (the tests)
   - `EuroDroneHub-cloud.postman_environment.json` (live Railway URL)
   - `EuroDroneHub-local.postman_environment.json` (localhost)
5. Top right environment dropdown → pick **EuroDroneHub cloud** (or **local** if the server is running on your PC).
6. Do a dry run: right-click the collection → **Run collection** → **Run EuroDroneHub API**. Expect **29 requests and 63 tests passing**, all green, in about a second.
7. Open https://saitynai-production-9875ec70.up.railway.app/api-docs once so the server is warm.

Running the collection again is fine. It creates its own test data and deletes it at the end. If the local data ever looks weird, run `npm run seed`.

## 2. Lab 0 – project task

Show `lab0/Lab0_Projekto_uzduotis.docx`.

- **Name:** EuroDroneHub, a drone catalogue with reviews. The domain is based on eurodronehub.com.
- **Purpose and functional requirements:** 3 logged-in roles (member, moderator, admin) plus guest and what each can do. Point at the use case diagram.
- **UML deployment diagram:** browser → Railway (Docker container: Express + React build + SQLite on a volume).
- **Technologies:** Express, SQLite, JWT, React, Swagger, Postman, Docker/Railway (table in the doc).

## 3. Lab 1 – REST API (target: about 15 s)

1. Postman → **Run collection** (cloud environment) → show all green. That covers all 15 methods plus these cases:
   - **404:** "404 - neegzistuojanti kategorija", "404 - ištrinta kategorija"
   - **400:** "400 - blogas JSON", "400 - tuščias body"
   - **422:** "422 - netinkamas laukas", "422 - įvertinimas už ribų"
   - **201:** every "Sukurti …" request
   - **204:** every "Ištrinti …" request (no response body, so 204 not 200)
2. If asked for a specific request, open it and press **Send**. Show the status code and that `Content-Type` is `application/json`.
3. **OpenAPI:** open `/api-docs` (Swagger) or `lab1/api-spec.yaml`. Every method is documented with its response codes and examples.
4. **Meaningful DB data:** `GET /api/categories`, then `GET /api/categories/1/drones`. The second one is the **hierarchical** method: all drones of one category.
5. **Git:** show the GitHub repo.

Things they might ask:
- *400 vs 422?* 400 means the JSON can't be parsed or the body is empty. 422 means the JSON is valid but the values break the rules, e.g. `rating: 9` or a missing `name`.
- *Why 204 on delete?* Nothing is returned in the body.
- *Why REST?* Resources are nouns in the URL, actions are HTTP verbs, the server keeps no session (stateless), and the hierarchy shows in the URL.
- *What if the parent doesn't exist?* `/categories/999/drones` → 404 "Kategorija nerasta".

## 4. Lab 2 – JWT

Show `lab2/Lab2_Autentifikacija_JWT.docx` and its sequence diagram.

1. In Postman run **Autentifikacija → Prisijungti (admin)** and copy `accessToken` from the response.
2. Paste it into https://jwt.io. The payload shows `"role": "admin"`, which proves the role is stored in the token.
3. **Refresh strategy:** run **Atnaujinti žetoną (refresh)**. It returns a new token pair. Then run **Senas refresh žetonas atmestas**. The old refresh token gives 401, because each one works once (rotation). Reusing an old one revokes all of that user's tokens.
4. **Authorization:** run **401 - be žetono** (no token) and **403 - narys negali kurti kategorijos** (member token, admin-only action).
5. In the website, log in as `jonas`. You can write, edit and delete your own reviews but not other people's. Log in as `moderator`: you can edit/delete anyone's review but cannot create categories (403). Log in as `admin` and the edit/delete buttons appear everywhere.

Things they might ask:
- *Why two tokens?* Access is short (15 min) so a stolen one dies fast. Refresh is long (7 d) but stored in the DB, so it can be revoked.
- *Where is the role checked?* `lab2/auth/auth.js` → `requireRole()`. The token is decoded in `authOptional()`.
- *How are passwords stored?* As bcrypt hashes.
- *Where does the frontend refresh?* `lab3/client/src/api.js`: on a 401 it calls `/auth/refresh` and retries the request.

## 5. If something breaks during the defence

| Problem | Fix |
|---|---|
| Live site doesn't load | Use local: `npm start` and switch the Postman environment to **local** |
| Port 3000 busy | PowerShell: `$env:PORT=3001; npm start`, then change the env `baseUrl` |
| Tests fail on "Prisijungti" | Someone changed the demo users. Run `npm run seed` locally and use the **local** environment |
| Postman shows `{{baseUrl}}` error | No environment selected (top right dropdown) |
