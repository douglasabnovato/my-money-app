#### Backend

API Express 5 + MongoDB. Veja o README da raiz.

```sh
cp .env.example .env   # MONGODB_URI e AUTH_SECRET (32+ caracteres)
npm install
npm run dev            # http://localhost:3003  (MONGODB_URI=memory para demonstração sem banco)
npm test
npm run claim-orphans -- seu@email.com   # atribui ciclos antigos (sem dono) ao seu usuário
```
