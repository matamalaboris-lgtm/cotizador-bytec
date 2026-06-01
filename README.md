# Bytec Cotizador

Software de cotizaciones profesionales para **Bytec Security SpA** — CCTV, alarmas, control de acceso y redes.
App web (un solo proyecto estático) con cotizaciones, catálogo, clientes, seguimiento de estados y generación de PDF tamaño Carta con tu marca.

- **Sin base de datos** → funciona en **modo local** (los datos se guardan en el navegador).
- **Con Supabase** → modo **nube**: los datos se sincronizan entre todos los equipos y usuarios.

---

## 1. Publicar en GitHub Pages (gratis)

1. Crea un repositorio nuevo en GitHub y sube el contenido de esta carpeta (`index.html` debe quedar en la raíz del repo).
   ```bash
   git init
   git add .
   git commit -m "Bytec Cotizador"
   git branch -M main
   git remote add origin https://github.com/USUARIO/REPO.git
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guarda.
3. En 1–2 minutos tu app estará en `https://USUARIO.github.io/REPO/`.

> Así ya funciona en **modo local**. Para sincronizar en la nube, sigue el paso 2.

---

## 2. Conectar Supabase (base de datos en la nube)

1. Crea un proyecto gratis en **https://supabase.com**.
2. Abre **SQL Editor → New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
3. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - clave **anon public**
4. Edita [`js/config.js`](js/config.js) y pega ambos valores:
   ```js
   window.BYTEC_CONFIG = {
     supabaseUrl: "https://xxxxxxxx.supabase.co",
     supabaseKey: "eyJhbGciOiJI..."   // clave anon (pública)
   };
   ```
5. Sube el cambio (`git commit` + `git push`). Al abrir la app verás **“Supabase conectado”** en la barra lateral; la primera vez sube los datos de ejemplo automáticamente.

---

## 3. Seguridad

- La clave **anon** es pública por diseño; la protección real son las **políticas RLS** de Supabase.
- El `schema.sql` trae una **Opción A** (acceso abierto con la clave anon) para partir rápido en una herramienta interna.
  - ⚠️ Si tu repositorio es **público**, cualquiera podría ver `config.js`. Para ese caso usa la **Opción B** (acceso solo a usuarios autenticados) y/o mantén el repo **privado**.
- Nunca uses la clave **service_role** en el navegador.

---

## 4. Estructura

```
index.html              app principal
assets/                 logos (azul para documentos, blanco para la app)
css/  tech.css app.css   tema "command center" + estilos de la app y del PDF
js/   config.js          credenciales de Supabase (editar)
      store.js           datos: modo local + sincronización Supabase
      doc.js             generación del documento/PDF Carta
      views-*.js         pantallas (dashboard, editor, clientes, catálogo, empresa)
      main.js            navegación, modales, arranque
supabase/schema.sql      tablas + políticas para Supabase
```

## 5. Uso

- **Cotizaciones**: crear, editar, cambiar estado (Borrador → Enviada → Vista → Aceptada/Rechazada/Facturada).
- **Editor**: cliente, ítems desde catálogo o línea libre, cantidad/precio/descuento; totales con IVA en vivo.
- **Generar PDF**: abre el documento con tu logo y datos → *Imprimir / Guardar como PDF*.
- **Catálogo / Clientes**: alta, edición y baja.
- **Mi empresa**: datos, banco y términos que aparecen en cada documento; estado de sincronización y respaldo (exportar/importar JSON).
