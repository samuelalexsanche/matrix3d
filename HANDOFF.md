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
- **Pendiente de confirmar:** Samuel reportó que las escenas **NFC** y **envíos** se le quedaban quietas. En su Chrome sí funcionan, así que puede ser caché o el navegador o panel donde las ve. Tras el deploy, **revísalo en la URL publicada en Chrome, Safari y en un iPhone** (sección 6).

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
| WhatsApp | `523300000000` / `+52 33 0000 0000` | `js/config.js`, `index.html` (JSON-LD, pie), `llms.txt` |
| Correo | `hola@matrix3d.mx` | `index.html`, `llms.txt` |
| Dominio | `https://matrix3d.mx` | `index.html` (canonical, OG, JSON-LD), `robots.txt`, `sitemap.xml`, `llms.txt` |
| Coordenadas | `20.6597, -103.3496` (centro de GDL) | `index.html` |
| Horario | L–V 10–19, S 10–14 | `index.html`, `llms.txt` |
| Tiempo de entrega | 2 a 5 días hábiles | FAQ y JSON-LD en `index.html`, chat de la escena de proceso, `llms.txt` |
| Redes | `@matrix3d` en TikTok, Instagram y Facebook | `index.html` |
| Perfil NFC de ejemplo | `https://example.com/mascota` | `index.html` (sección NFC) |
| Precios | "a cotizar" | Si el cliente da precios, agrega `offers` a cada Product del JSON-LD |
| Crédito Mattera | `https://matterasystems.com` | pie de `index.html` |

## 8. Checklist antes de lanzar como sitio oficial
- [ ] Placeholders reemplazados.
- [ ] NAP idéntico en el sitio, Google Business, Facebook e Instagram.
- [ ] Dominio, `CNAME` y `PUBLIC_NOINDEX=false`.
- [ ] Search Console y Bing con el sitemap enviado.
- [ ] Lighthouse y Rich Results en verde.

## 9. Siguientes ideas (solo si Samuel las pide)
- Páginas por servicio para posicionar más búsquedas: `/impresion-3d-guadalajara/`, `/llaves-de-permiso-escolares/`, `/llavero-nfc-mascotas/`.
- Más fotos reales, con el mismo tratamiento: WebP transparente sobre pedestal.
- Videos de TikTok con carga diferida (facade).

## 10. Herramientas locales
- `python3 build-preview.py` genera `preview/` con CSS y JS en línea, para publicar como artifact de Claude. `preview/` está en `.gitignore`.
- Para probar en local: `python3 -m http.server 8080` y abre `http://localhost:8080`.
