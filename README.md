# PAR Los Charrúas

Sitio web propio del **Peronismo Amplio Renovador** en Los Charrúas (departamento Concordia, Entre Ríos).
Es una web independiente (su propia base de datos, su propio panel y su propio dominio). Comparte con la web
provincial solo la identidad visual del PAR y la tecnología (Next.js 16 + Prisma 7 + PostgreSQL + Tailwind 4).

## Secciones públicas

| Ruta | Qué muestra |
|---|---|
| `/` | Inicio: presentación, cómo viene la construcción, candidatos, propuestas, noticias, fiscalización y formulario "Sumate" |
| `/construccion` | Números del armado (con metas y barras de avance) y la hoja de ruta paso a paso |
| `/noticias` | Noticias con filtros: noticia, avance de la construcción, actividad, en los medios, comunicado |
| `/candidatos` | Candidatos agrupados por cargo (el primero destacado) |
| `/propuestas` | Propuestas por eje, con sus medidas concretas |
| `/fiscalizacion` | Cómo funciona la fiscalización y formulario "Quiero ser fiscal" |

## Panel de administración (`/login`)

Se entra con la contraseña `ADMIN_PASSWORD`. Desde ahí se carga todo el contenido (noticias, candidatos,
propuestas, construcción), se ven los voluntarios que se anotaron (con descarga en planilla) y se maneja la fiscalización.

## Fiscalización

**Antes de la elección (panel → Fiscalización):**
1. *Escuelas y mesas*: cargarlas una por una o pegarlas desde una planilla (`Escuela; Dirección; Mesa; Electores`).
2. *Listas y cargos*: todas las listas que compiten (marcar la nuestra) y los cargos a fiscalizar.
3. *Fiscales*: al crear cada uno se genera una **clave de 6 números** que se muestra una sola vez. El usuario es su DNI.
   - **Fiscal de mesa**: opera solo sus mesas asignadas.
   - **Fiscal general**: opera todas las mesas de su escuela.
   - Los vecinos que se ofrecieron como fiscales desde el sitio aparecen con un botón "Hacer fiscal".

**El día de la elección, el fiscal (desde el celular, en `/fiscal`):**
avisa apertura y cierre, informa cuántos votaron durante el día, carga el escrutinio
(con control automático de sumas contra votantes y electores), saca la foto del acta y reporta incidencias.

**El comando central** ve el *Tablero en vivo* (se actualiza solo cada 30 s): cobertura, participación, resultados por cargo,
estado de cada mesa e incidencias. Puede corregir cualquier mesa, compararla con la foto del acta y **verificarla**
(una vez verificada, el fiscal ya no la puede modificar). Los resultados se descargan en planilla.

**Seguridad:** las claves se guardan cifradas (PBKDF2), el acceso se bloquea 15 minutos tras 5 intentos fallidos,
generar una clave nueva cierra las sesiones abiertas del fiscal, cada acción verifica permisos sobre la mesa en el servidor
y las fotos de actas solo las ven el comando y el fiscal de esa mesa.

## Puesta en marcha

```bash
npm install
cp .env.example .env      # y completar los valores
npm run db:push           # crea las tablas en la base
npm run sembrar           # (opcional) contenido inicial de ejemplo para editar
npm run dev               # http://localhost:3000
```

`npm run sembrar -- --fiscalizacion` además carga escuelas, mesas, listas y un fiscal **de prueba**
(DNI 11111111, clave 123456) para practicar. Borralos desde el panel antes de la elección.

Para publicarla sirve cualquier servicio que corra Next.js (Netlify, Vercel, un servidor propio con `npm run build && npm start`),
más una base PostgreSQL propia (Neon, Supabase, Prisma Postgres, etc.). Se cargan las variables de `.env.example`
y se corre una vez `npm run db:push` contra esa base.

## Dónde cambiar textos fijos

- `lib/sitio.ts`: nombre de la localidad, lema, bajada del inicio, historia, referente, pilares, menú, redes.
- `public/fotos/`: foto del referente y foto del equipo (se reemplazan por archivos con el mismo nombre).
- `lib/contenido.ts`: ejes de propuestas y cargos sugeridos.
- `lib/fiscalizacion.ts`: tipos de incidencia y estados de mesa.
