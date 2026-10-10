# Matrix3D — sitio web

Landing page estática de una página para Matrix3D, taller de diseño e impresión 3D en Guadalajara. Sin build step: se abre `index.html` y funciona.

## Poner en marcha
1. Cambia el WhatsApp en `js/config.js`.
2. Reemplaza los placeholders (lista en `HANDOFF.md`).
3. Sube la carpeta a GitHub Pages (workflow incluido), Vercel o Netlify.

## Estructura
- `index.html` — marcado, SEO y datos estructurados (JSON-LD)
- `css/styles.css` — sistema visual en tokens (blanco, negro y los tres tonos del isotipo)
- `js/config.js` — WhatsApp y mensajes precargados
- `js/main.js` — motion design con GSAP + ScrollTrigger y scroll suave con Lenis (CDN)
- `assets/` — imágenes (WebP con fondo transparente), íconos, imagen OG
- `llms.txt`, `robots.txt`, `sitemap.xml` — SEO y GEO

## Vista previa en un solo archivo
```bash
python3 build-preview.py   # genera preview/index.html + preview/assets
```

Construido por Mattera Systems.
