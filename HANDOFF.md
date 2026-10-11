# HANDOFF — Matrix3D (sitio estático)

Proyecto de **Mattera Systems** (Samuel) para su cliente **Matrix3D**. Lo construimos en Claude (chat) y aquí pasa a Claude Code para seguir el desarrollo y publicarlo.

Lee también `CLAUDE.md`: tiene las reglas fijas del proyecto (logo, estilo y motion).

---

## 1. Qué es Matrix3D
- Taller de **diseño 3D, impresión 3D y venta de productos virales de TikTok**, en Guadalajara, Jalisco. Envía a todo México.
- Productos reales (fotos en `assets/img/`):
  - Llaves de permiso para salón (baño, salida y emergencia).
  - Llaves de baño niño y niña.
  - Porta papel higiénico en forma de lápiz.
  - Llaveros NFC: huellas para mascotas e íconos de redes sociales.
  - Figura por encargo de un cliente (un kaiju).
- El llavero NFC de mascotas abre un perfil con los datos del dueño. **Ese sistema ya existe y es externo**: aquí solo se enlaza.
- Ventas: **todo se cotiza y pide por WhatsApp**. No hay carrito ni precios publicados.
- **No ofrecen vista previa del producto.** El flujo es: idea → cotización → confirmación → modelado/impresión → envío.

## 2. Objetivo de Mattera
SEO local + GEO (que el negocio aparezca en ChatGPT, Perplexity, Gemini y AI Overviews) es el sello de la agencia. No se sacrifica rendimiento, accesibilidad ni datos estructurados por efectos visuales.

## 3. Estado actual (10 oct 2026)
- **Página única, sin build:** `index.html`, `css/styles.css`, `js/config.js` y `js/main.js`.
- **Librerías por CDN:** GSAP 3.12.5 + ScrollTrigger (cdnjs) y Lenis 1.1.13 (jsDelivr).
- **Fuentes:** Archivo con eje de ancho; JetBrains Mono solo en la consola de G-code.
- **Secciones, en orden:**
  1. Hero: una impresora imprime el **logo original**, capa por capa.
  2. Cinta de servicios.
  3. Servicios.
  4. Escena "del boceto al modelo 3D".
  5. Galería horizontal de trabajos.
  6. Escuelas, con la foto real.
  7. Escena NFC.
  8. Escena del pedido por WhatsApp (proceso).
  9. Materiales.
  10. Escena de envíos a todo México.
  11. Preguntas frecuentes.
  12. Cierre, con el logo armándose por capas.
- **Datos estructurados (JSON-LD):** LocalBusiness + WebSite + WebPage + 2 Service + OfferCatalog (5 Product) + HowTo + FAQPage.
- **Archivos para buscadores e IA:** `llms.txt`, `robots.txt` (permite crawlers de IA), `sitemap.xml` con imágenes, `site.webmanifest` y `404.html`.
- **Ya verificado** en Chromium a 1600 px y 390 px, con scroll de rueda y táctil: las 4 escenas ilustradas avanzan, no hay errores de consola ni scroll horizontal, y la página se ve completa sin JS y con "reducir movimiento". También se revisó en el Chrome real de Samuel: NFC y envíos funcionan.

### Publicado y verificado (10 oct 2026)
- Repo: `samuelalexsanche/matrix3d`. URL de preview: **https://samuelalexsanche.github.io/matrix3d/** (con `noindex`, como marca la sección 5).
- Verificado en la URL publicada con Chromium (1440 y 390 px) y con WebKit real, escritorio y perfil iPhone 14 Pro: las 4 escenas avanzan con el scroll, sin errores de consola y sin scroll horizontal. **No se probó en la app Safari ni en un iPhone físico** (esta Mac no tiene Xcode ni simulador): queda para Samuel.
- Cambios de ese día:
  - Escenas más cortas a pedido de Samuel: `.story` 260 → 190svh y `.story--md` 220 → 170svh (175/160svh en táctil), y el suavizado responde más rápido (`k` 0.16 → 0.24 en escritorio, 0.3 → 0.42 en táctil). No se tocó la coreografía de ninguna escena.
  - Cada alto en `svh` lleva su fallback en `vh`. Sin él, un navegador sin `svh` (Safari anterior a 15.4) deja las secciones a su alto natural, el recorrido se vuelve 0 y **las escenas se ven congeladas en su estado final**: es la causa más probable de lo que reportó Samuel.
  - Las escenas también avanzan con el evento `scroll`, por si el navegador pausa `requestAnimationFrame`.
  - La tarjeta del perfil NFC ya no nace con `opacity="0"` en el HTML: sin JS o con movimiento reducido el celular se veía vacío. Con JS la animación es idéntica.
- **Lighthouse móvil en la URL de preview:** Accesibilidad 100, Buenas prácticas 100, SEO 66, Rendimiento 81. El SEO 66 es solo el `noindex` del preview (sube a 100 con dominio propio y `PUBLIC_NOINDEX=false`). El 81 de rendimiento es la hoja de Google Fonts, que bloquea el render (~0.9 s en móvil simulado) más 122 KB de fuentes: se arregla cargándola sin bloquear o alojando las fuentes en el repo. Nada de esto viene de las escenas.

## 4. Decisiones del cliente (no revertir)
- **Logo:** siempre el original (`assets/img/logo-*`). Nunca redibujado ni vectorizado. Las animaciones usan la imagen original con recortes, clip o máscaras.
- **Estilo:** blanco, negro tinta y los colores del logo. Sin brillos, glows ni degradados decorativos. La profundidad sale de sombras sólidas, extrusiones y pedestales de tres tonos.
- **Hero corto:** 165svh en móvil y 190svh en escritorio.
- **Escena NFC:** se queda como está, porque al cliente le gustó. Las escenas nuevas siguen su mismo lenguaje.
- **Sin animación en las fotos de productos:** las llaves y demás piezas quedan fijas sobre su pedestal. Tampoco hay escena animada del tablero de permisos.
- **Scroll fluido:** Lenis solo en escritorio; nativo en táctil. Nada de pins de JS en móvil.
- **Marcas de terceros:** la figura kaiju y los íconos de redes en llaveros se muestran como "pedido personalizado". Nunca uses nombres de marcas en texto, alt, schema ni keywords.

## 5. Despliegue en GitHub Pages
El workflow `.github/workflows/deploy.yml` publica la carpeta tal cual. Mientras sea preview, marca `noindex` y bloquea robots para no competir con el dominio final.

> Ya hecho el 10 oct 2026 en la cuenta `samuelalexsanche`. Los pasos quedan por si hay que repetirlo en otra cuenta.

1. Revisa la sesión: `gh auth status`. Si no hay sesión, `gh auth login`.
2. **Pregunta a Samuel una sola vez en qué cuenta u organización publicar.**
3. Inicializa el repo y súbelo:
   ```bash
   cd matrix3d
   git init -b main
   git add -A
   git commit -m "Sitio Matrix3D: versión para revisión del cliente"
   gh repo create <cuenta>/matrix3d --public --source=. --remote=origin --push
   gh api -X POST repos/<cuenta>/matrix3d/pages -f build_type=workflow
   #  (si responde que Pages ya existe: gh api -X PUT repos/<cuenta>/matrix3d/pages -f build_type=workflow)
   gh run watch
   ```
4. La URL queda en `https://<cuenta>.github.io/matrix3d/`. Las rutas del index son relativas, así que funciona en subcarpeta.
5. Entrega la URL a Samuel. El repo es público; si prefiere privado, Pages requiere plan de pago.

### El dominio, y lo que vive en él (11 oct 2026)
- `matrix3d.com.mx` (raíz y `www`) → este sitio, en GitHub Pages. En Cloudflare son dos CNAME a `samuelalexsanche.github.io` en **DNS only (nube gris)**: con la nube naranja GitHub no puede emitir el certificado.
- `tag.matrix3d.com.mx` → **Matrix3D TAG**, el sistema de perfiles NFC, que corre en un Raspberry Pi por un túnel de Cloudflare (`matrix3d-rpi`). Antes vivía en la raíz; se movió con autorización del cliente para liberarla.
- `calculadora.matrix3d.com.mx` → otra app interna del mismo túnel, detrás de Cloudflare Access. No se toca.
- **Pendiente:** los llaveros NFC ya entregados pueden traer grabada la URL vieja de la raíz. Para rescatarlos hace falta una Redirect Rule en Cloudflare hacia `tag.`, y para eso la raíz tendría que pasar a nube naranja con SSL en **Full (strict)**. Falta que el cliente diga qué URL traen los chips.

### Cuando haya dominio propio
- Pon un `CNAME` en la raíz con el dominio y apunta el DNS a GitHub Pages.
- Corre `gh variable set PUBLIC_NOINDEX --body false -R <cuenta>/matrix3d` y vuelve a desplegar.
- `404.html` usa rutas absolutas (`/`), que solo son correctas con dominio propio.
- Da de alta el sitio en Search Console y en Bing Webmaster y envía `sitemap.xml`.

## 6. Verificación en la URL publicada (obligatoria)
1. Consola sin errores. Confirma que cargan GSAP, ScrollTrigger y Lenis desde los CDN.
2. Haz scroll por toda la página en **Chrome y Safari de escritorio** y en un **iPhone** (o simulador). Confirma que el hero imprime el logo y que las escenas diseño, NFC, chat y envíos avanzan con el scroll. Si alguna se queda quieta:
   - Las escenas usan `registrarEscena()` en `main.js`: el progreso se calcula en cada cuadro con `getBoundingClientRect()` de la sección.
   - Revisa `prefers-reduced-motion` (con movimiento reducido se desactivan a propósito) y `pointer: coarse`.
   - No vuelvas a usar transformaciones 3D sobre los SVG (Safari no los repinta bien).
3. Sin scroll horizontal a 390 px.
4. Lighthouse móvil ≥ 95 en Performance, Accessibility, Best Practices y SEO.
5. Rich Results Test sin errores.

## 7. Placeholders (buscar y reemplazar en todo el proyecto)
| Dato | Valor actual | Dónde |
|---|---|---|
| ~~WhatsApp~~ | **Ya puesto:** `523115920483` / `+52 311 592 0483` | — |
| ~~Correo~~ | **Ya puesto:** `matrix3d.contacto@gmail.com` | — |
| ~~Dominio~~ | **Ya publicado** en `https://matrix3d.com.mx` (11 oct 2026): DNS en Cloudflare, archivo `CNAME`, `PUBLIC_NOINDEX=false` | — |
| Coordenadas | `20.6597, -103.3496` (centro de GDL) | `index.html` |
| Horario | L–V 10–19, S 10–14 | `index.html`, `llms.txt` |
| Tiempo de entrega | 2 a 5 días hábiles | FAQ y JSON-LD en `index.html`, chat de la escena de proceso, `llms.txt` |
| Redes | Instagram ya es el real (`matrix3d.oficial`). **Faltan TikTok y Facebook**: se quitaron del pie y del `sameAs` para no dejar enlaces rotos | `index.html` |
| Perfil NFC de ejemplo | `https://example.com/mascota` | `index.html` (sección NFC) |
| Precios | "a cotizar" | Si el cliente da precios, agrega `offers` a cada Product del JSON-LD |
| Crédito Mattera | `https://matterasystems.com` | pie de `index.html` |

## 8. Checklist antes de lanzar como sitio oficial
- [ ] Placeholders reemplazados.
- [ ] NAP idéntico en el sitio, Google Business, Facebook e Instagram.
- [x] Dominio, `CNAME` y `PUBLIC_NOINDEX=false`.
- [ ] Search Console y Bing con el sitemap enviado.
- [ ] Lighthouse y Rich Results en verde.

## 9. Siguientes ideas (solo si Samuel las pide)
- Páginas por servicio para posicionar más búsquedas: `/impresion-3d-guadalajara/`, `/llaves-de-permiso-escolares/`, `/llavero-nfc-mascotas/`.
- Más fotos reales, con el mismo tratamiento: WebP transparente sobre pedestal.
- Videos de TikTok con carga diferida (facade).

## 10. Herramientas locales
- `python3 build-preview.py` genera `preview/` con CSS y JS en línea, para publicar como artifact de Claude. `preview/` está en `.gitignore`.
- Para probar en local: `python3 -m http.server 8080` y abre `http://localhost:8080`.
