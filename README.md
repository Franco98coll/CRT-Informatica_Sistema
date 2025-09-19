# CRT-Informatica-sistema

Monorepo con frontend (Vite + Vue 3 + Vuetify) y backend (Node.js + Express + MSSQL).

## Requisitos

- Node.js 18+
- SQL Server (local o remoto) y cadena de conexión

## Scripts

- `npm run install:all`: instala dependencias en client y server
- `npm run dev`: levanta client y server en paralelo
- `npm run build`: build de client y server

Configura variables en `server/.env` (ver `server/.env.example`).

## Base de datos CRT_informatica / "CRT informatica" / "CRT-informatica"

1. Crear DB y tablas (SSMS o sqlcmd):

Con SSMS: abre y ejecuta uno de los scripts según el nombre que prefieras:

- Sin espacio: `server/sql/01_create_crt_informatica.sql`
- Con espacio: `server/sql/02_create_CRT_informatica_space.sql`
- Con guion: `server/sql/03_create_CRT-informatica_dash.sql`

Con sqlcmd:

```
sqlcmd -S FRANCO-PC\SQLEXPRESS -U vibe_user -P "Fuerte_123!" -i server/sql/01_create_crt_informatica.sql
# o con espacio en el nombre
sqlcmd -S FRANCO-PC\SQLEXPRESS -U vibe_user -P "Fuerte_123!" -i server/sql/02_create_CRT_informatica_space.sql
# o con guion en el nombre
sqlcmd -S FRANCO-PC\SQLEXPRESS -U vibe_user -P "Fuerte_123!" -i server/sql/03_create_CRT-informatica_dash.sql
```

2. Apuntar backend a la nueva DB en `server/.env`:

```
DB_HOST=FRANCO-PC
DB_INSTANCE=SQLEXPRESS
DB_NAME=CRT_informatica
# o si usaste el script con espacio
# DB_NAME=CRT informatica
# o si usaste el script con guion
# DB_NAME=CRT-informatica
DB_USER=vibe_user
DB_PASSWORD=Fuerte_123!
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

3. Probar conexión:

```
curl http://localhost:3000/api/db/ping
curl http://localhost:3000/api/users
```
