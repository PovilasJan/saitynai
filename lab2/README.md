# Lab 2 – JWT autentifikacija ir autorizacija

- [Lab2_Autentifikacija_JWT.docx](Lab2_Autentifikacija_JWT.docx) – JWT, refresh žetonų rotacija, rolės, teisės
- [diagramos/jwt-seka.png](diagramos/jwt-seka.png) – UML sekų diagrama (prisijungimas, atnaujinimas, atsijungimas)
- [diagramos/roliu-teises.png](diagramos/roliu-teises.png) – UML veiklos diagrama (autorizacija)
- [auth/auth.js](auth/auth.js) – JWT kūrimas ir tikrinimas, `requireRole()`
- [auth/routes.js](auth/routes.js) – register, login, refresh (rotacija), logout, me
- Kliento pusė: [`lab3/client/src/api.js`](../lab3/client/src/api.js) – automatinis žetonų atnaujinimas
