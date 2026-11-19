# Lab 1 – REST API

- [Lab1_REST_API.docx](Lab1_REST_API.docx) – API aprašas, 15 metodų, atsako kodai, pavyzdžiai
- [api-spec.yaml](api-spec.yaml) – OpenAPI 3 specifikacija (Swagger: `/api-docs`)
- [EuroDroneHub.postman_collection.json](EuroDroneHub.postman_collection.json) – Postman testai (48 užklausos, 116 patikrinimų)
- `EuroDroneHub-cloud/local.postman_environment.json` – Postman aplinkos
- [diagramos/duomenu-modelis.png](diagramos/duomenu-modelis.png) – UML klasių (duomenų modelio) diagrama
- [diagramos/api-resursai.png](diagramos/api-resursai.png) – API resursų hierarchija
- [server/](server) – Express API kodas: `src/routes/` (15 metodų + dashboard), `src/list.js` (puslapiavimas, filtrai, hypermedia), `src/db.js`, `src/seed.js`, `src/validate.js`
- Paleidimas (iš projekto šaknies): `npm run install:all && npm run build && npm start`
