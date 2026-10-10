# CLAUDE.md — Matrix3D · handoff de Mattera Systems

Lee este archivo y `HANDOFF.md` antes de tocar código.

## Autonomía
Tienes autonomía total: edita, prueba, crea el repo, haz commits/push y configura GitHub Pages sin pedir permiso en cada paso. Pregunta solo por datos del negocio, por la cuenta de GitHub (una vez) o antes de algo irreversible y ambiguo.

## Contexto
- Cliente: Matrix3D, Guadalajara. Diseño 3D, impresión 3D y productos virales (llaves de permiso escolares, llaves de baño, porta papel lápiz, llaveros NFC para mascotas y redes, figuras por encargo).
- Agencia: Mattera Systems (Samuel). SEO + GEO es el sello: no se sacrifica rendimiento ni datos estructurados.
- El sistema de perfiles NFC de mascotas es externo; aquí solo se enlaza.

## Stack (el de siempre en Mattera)
HTML + CSS + JS sin build. GSAP 3.12.5 + ScrollTrigger desde cdnjs, Lenis 1.1.13 desde jsDelivr (scroll suave solo en escritorio; en táctil se usa el nativo). Fuentes de Google Fonts (Archivo con eje de ancho, JetBrains Mono solo para la consola G-code).

## Logo: SIEMPRE el original
- Usa solo los archivos `assets/img/logo-*` (recorte sin fondo del render original del cliente) y los íconos generados de él.
- No dibujes ni vectorices el logo a mano. Si una animación necesita el logo, se construye con la imagen original (recortes, máscaras, clip), como el hero y el cierre.
- El logo tiene sombra y transparencias suaves: úsalo sobre fondos blancos o `--paper-2`, no sobre negro.

## Dirección visual (decidida por el cliente, no revertir)
- Blanco, negro tinta y los colores del logo. **Sin brillos, glows ni degradados decorativos.**
- Profundidad por geometría: cajas con cara frontal, superior y lateral (perspectiva oblicua), extrusiones en capas (`--ex-1`, `--ex-2`) y pedestales en tres tonos: `--violet-hi`, `--violet`, `--violet-lo`.
- Muchos elementos animados, todos ligados al tema de impresión 3D.
- Marcas de terceros (figura kaiju, íconos de redes en llaveros): se muestran como pedido personalizado; nunca nombres de marcas en texto, alt, schema ni keywords.

## Mapa
```
index.html        contenido + SEO + JSON-LD (@graph)
css/styles.css    tokens y componentes
js/config.js      WhatsApp y mensajes (data-wa="clave")
js/main.js        1 WhatsApp · 2 header · 3 hero (imprime el logo original) · 4 cinta · 5 losas · 5b piezas que suben · 9a escena boceto→modelo · 6 galería · 8 NFC · 9b escena chat WhatsApp (proceso) · 9c escena envíos · 10 bobinas · 11 cierre (logo por capas) · scroll suave
assets/img        logo original (logo-matrix3d-*, logo-print-*, logo-mark-160), productos WebP transparentes (480/900), og-matrix3d.jpg
assets/icons      favicon y app icons (PNG generados del logo original)
build-preview.py  genera preview/ con CSS/JS en línea
```

## Reglas de motion
- Escenas largas (hero, diseño, NFC, chat/proceso, envíos) = sección alta + contenedor `position: sticky`. Nunca pin de JS en móvil (iOS da saltos). Altura de sección = distancia de scroll: más corta en móvil para que cada swipe avance.
- Hero: ScrollTrigger + `gsap.quickTo`. Escenas ilustradas (diseño, NFC, chat, envíos): timeline en pausa movido por `registrarEscena()` en `main.js`, que calcula el progreso en cada cuadro con `getBoundingClientRect()` de la sección. No las regreses a `scrollTrigger` con start/end fijos: se desfasaban y el cliente las veía quietas.
- Solo transform, opacity y atributos SVG.
- Todo debe verse completo sin JS y con `prefers-reduced-motion` (ya hay fallbacks: no los rompas).
- La galería horizontal fija (pin) es solo escritorio vía `gsap.matchMedia`; en móvil es scroll nativo con snap.

## Verificación antes de entregar cambios
- Sin errores de consola; sin scroll horizontal a 390 px; revisar 390 y 1440 px.
- JSON-LD válido (parsea y pasa Rich Results Test).
- Lighthouse móvil ≥ 95 en las 4 categorías.
- Si tienes skills de diseño (ui-ux-pro-max, web-design-guidelines, frontend-design), úsalas para cambios visuales.

## Decisiones del cliente (9 oct 2026)
- La animación del hero debe ser corta (sección de 165svh en móvil y 190svh en escritorio). No la alargues.
- Se quitó la escena animada del tablero de permisos; la sección Escuelas usa la foto real.
- El scroll debe sentirse fluido: no agregues pins nuevos ni escenas largas sin probar en móvil.
- La escena NFC se queda como está (260svh): al cliente le gustó. Las escenas nuevas siguen el mismo lenguaje: ilustración SVG con contorno tinta, sombra sólida desplazada, tonos de marca, desplazamiento leve del arte (sin transformaciones 3D sobre el SVG), pasos de texto que se activan con el avance y un detalle en bucle (vaivén, puntos de "escribiendo").
- Matrix3D NO ofrece vista previa del producto: no la menciones en textos, escenas ni schema.
- Escenas ilustradas: el HTML trae el estado final (se ve completo sin JS) y el JS pone el estado inicial dentro del timeline.
- Sin animación en las imágenes de productos (galería y escuelas): las fotos de las llaves y demás piezas quedan fijas sobre su pedestal.
