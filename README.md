# Portafolio de landings

Sitio estático (Astro + Tailwind CSS + GSAP) con tu portafolio y 3 demos de marcas ficticias para mostrar a clientes potenciales:

| Ruta | Demo | Qué muestra |
|------|------|-------------|
| `/` | Portafolio | Tus servicios, precios "desde", proceso y contacto por WhatsApp |
| `/dental` | Sonríe Clínica Dental | Comparador antes/después, tratamientos, reserva por WhatsApp |
| `/pasteleria` | Masa Madre Pastelería | Menú + carrito que arma el pedido y lo envía por WhatsApp |
| `/training` | Forja Training | Quiz de 4 preguntas, plan recomendado y captura de leads |

## Cómo correrlo

Requiere Node 22+ y [pnpm](https://pnpm.io).

```bash
pnpm install   # instalar dependencias
pnpm dev       # servidor local en http://localhost:4321
pnpm test      # tests de la lógica (WhatsApp, carrito, quiz)
pnpm build     # genera el sitio estático en dist/
```

## Personalizar

Todo lo que cambias seguido está en `src/config.ts`:

- `WHATSAPP_NUMBER`: tu número en formato internacional, solo dígitos (ej. `56912345678`). Se usa en todos los botones y mensajes.
- `LEAD_ENDPOINT`: URL del Google Apps Script que recibe los leads del quiz (ver más abajo). Vacío = el quiz abre WhatsApp.
- `DEVELOPER`: tu nombre, rol y dominio. Reemplaza `Tu Nombre`.
- `SERVICES`: servicios y precios "desde" (USD) de la página principal.
- `DEMOS`: tarjetas de las demos.

Los textos de cada demo están dentro de su página (`src/pages/dental.astro`, `pasteleria.astro`, `training.astro`): menú, precios, equipo, direcciones, etc. Para adaptar una demo a un cliente real, edita esos arrays al inicio del archivo, cambia las imágenes (URLs de Unsplash) y la paleta.

La lógica pura está en `src/lib/` con sus tests: `whatsapp.ts`, `cart.ts` y `quiz.ts`. Si cambias el nombre de la marca en los mensajes de pedido, edita `buildOrderMessage` (`cart.ts`) y `buildLeadMessage` (`quiz.ts`).

## Publicar gratis

El sitio es 100% estático: no necesita servidor.

### Cloudflare Pages

1. Sube el repositorio a GitHub/GitLab.
2. En el dashboard de Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Configura **Build command**: `pnpm build` y **Build output directory**: `dist`.
4. Deploy. Después puedes conectar tu dominio propio.

### Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Astro** (detectado automáticamente). **Build command**: `pnpm build`, **Output directory**: `dist`.
3. Deploy.

> Si algún dashboard no carga o está bloqueado en tu país, usa Cloudflare WARP (1.1.1.1) o una VPN mientras haces el deploy. Una vez publicado, el sitio funciona sin problema para tus clientes.

Antes de publicar, define `site` en `astro.config.mjs` (por ejemplo `site: 'https://tu-dominio.com'`) para activar las URLs canónicas.

## Leads del quiz en Google Sheets (gratis)

El formulario de `/training` envía un JSON a `LEAD_ENDPOINT`. Con Google Apps Script puedes guardar cada lead en una hoja de cálculo.

1. Crea una hoja de Google Sheets con la fila 1: `fecha | nombre | whatsapp | objetivo | nivel | dias | modalidad | plan`.
2. Ve a **Extensiones → Apps Script**, borra el contenido y pega:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name,
    data.whatsapp,
    data.goal,
    data.level,
    data.days,
    data.mode,
    data.plan,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Implementar → Nueva implementación → Tipo: Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier persona**.
4. Autoriza los permisos y copia la **URL de la aplicación web** (termina en `/exec`).
5. Pégala en `src/config.ts`:

```ts
export const LEAD_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXX/exec';
```

6. Vuelve a publicar el sitio. Si cambias el script, crea una **nueva implementación** para que los cambios apliquen.

El navegador envía el JSON como `text/plain` para evitar el preflight CORS (Apps Script no lo soporta), por eso el script lee `e.postData.contents`. Si el envío falla o `LEAD_ENDPOINT` está vacío, el quiz abre WhatsApp con el resumen del cliente como respaldo.

## Notas

- Todas las marcas de las demos son ficticias. Las fotos son de [Unsplash](https://unsplash.com) (enlazadas directamente).
- Las animaciones (GSAP) se desactivan si el usuario tiene activado "reducir movimiento".
