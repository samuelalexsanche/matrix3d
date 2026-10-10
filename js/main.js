/* ============================================================
   Matrix3D — interacción y motion
   Requiere GSAP 3.12.5 + ScrollTrigger (cdnjs) y Lenis 1.1.13 (jsDelivr).

   Fluidez en móvil:
   - Las escenas largas (hero y NFC) usan position: sticky
     nativo, no "pin" de JS: no hay saltos en iOS/Android.
   - El progreso del scroll se suaviza con gsap.quickTo, así la
     inercia del dedo mueve la animación de forma continua.
   - Secciones más cortas en móvil: cada swipe avanza la escena.
   - Solo se animan transform, opacity y atributos SVG.
   Sin JS o con "reducir movimiento": todo se ve completo y quieto.
   ============================================================ */
(function () {
  "use strict";

  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tactil = window.matchMedia("(pointer: coarse)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var f = function (n) { return n.toFixed(2); };

  /* ---------- 1. WhatsApp ---------- */
  function armarWhatsApp() {
    var cfg = window.MATRIX3D;
    if (!cfg || !cfg.whatsapp) return;
    $$("[data-wa]").forEach(function (a) {
      var clave = a.getAttribute("data-wa");
      var texto = (cfg.mensajes && cfg.mensajes[clave]) || cfg.mensajes.general || "";
      if (cfg.firmaOrigen) texto += cfg.firmaOrigen;
      a.href = "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(texto);
    });
  }

  /* ---------- 2. Header y menú ---------- */
  function header() {
    var top = $("[data-top]"), btn = $("[data-menu-btn]"), menu = $("[data-menu]");
    var ultimo = 0;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      top.classList.toggle("is-scrolled", y > 8);
      var abierto = btn && btn.getAttribute("aria-expanded") === "true";
      top.classList.toggle("is-hidden", !abierto && y > 400 && y > ultimo + 4);
      if (y < ultimo - 4) top.classList.remove("is-hidden");
      ultimo = y;
    }, { passive: true });
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      var abre = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(abre));
      menu.hidden = !abre;
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { btn.setAttribute("aria-expanded", "false"); menu.hidden = true; });
    });
  }

  /* ============================================================
     3. HERO — la impresora imprime el logo ORIGINAL de Matrix3D
     El logo es la imagen original (sin fondo); la impresora la
     descubre capa por capa de abajo hacia arriba. Vista frontal
     con profundidad oblicua (caras superior y lateral).
     ============================================================ */
  var DX = 16, DY = -12;                         // dirección de la profundidad
  var LOGO = { x: 113.5, y: 142, w: 173, h: 210 }; // imagen del logo sobre la cama
  var CAPAS = 48, LHPX = LOGO.h / CAPAS;
  var X0 = 122, X1 = 278;                        // recorrido de la boquilla
  var C = { ink: "#0e0b14", paper: "#ffffff", lilac: "#efe8fc", violet: "#6a22d0", hi: "#9461ee", grey: "#8f86a3" };

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  /* Caja con cara frontal, superior y lateral (profundidad oblicua) */
  function caja(g, x, y, w, h, frente, arriba, lado) {
    var grupo = el("g", { "stroke": C.ink, "stroke-width": "2", "stroke-linejoin": "round" }, g);
    var pT = el("polygon", { fill: arriba }, grupo), pS = el("polygon", { fill: lado }, grupo), pF = el("rect", { fill: frente, rx: "2" }, grupo);
    function mover(nx, ny) {
      pT.setAttribute("points", nx + "," + ny + " " + (nx + DX) + "," + (ny + DY) + " " + (nx + w + DX) + "," + (ny + DY) + " " + (nx + w) + "," + ny);
      pS.setAttribute("points", (nx + w) + "," + ny + " " + (nx + w + DX) + "," + (ny + DY) + " " + (nx + w + DX) + "," + (ny + h + DY) + " " + (nx + w) + "," + (ny + h));
      pF.setAttribute("x", nx); pF.setAttribute("y", ny); pF.setAttribute("width", w); pF.setAttribute("height", h);
    }
    mover(x, y);
    return { g: grupo, mover: mover };
  }

  function construirImpresora(host, src) {
    var fallback = host.querySelector("img");
    var svg = el("svg", { viewBox: "0 -52 400 470", role: "img", "aria-labelledby": "imp-t" });
    el("title", { id: "imp-t" }, svg).textContent = "Impresora 3D imprimiendo el logo de Matrix3D capa por capa";
    var defs = el("defs", {}, svg);
    var mk = el("mask", { id: "imp-logo", maskUnits: "userSpaceOnUse", x: "0", y: "-60", width: "400", height: "480", style: "mask-type:alpha" }, defs);
    el("image", { href: src, x: LOGO.x, y: LOGO.y, width: LOGO.w, height: LOGO.h, preserveAspectRatio: "xMidYMid meet" }, mk);
    var cp = el("clipPath", { id: "imp-hecho" }, defs);
    var clip = el("rect", { x: "0", y: "0", width: "400", height: "420" }, cp);
    var pat = el("pattern", { id: "imp-capas", width: "8", height: LHPX, patternUnits: "userSpaceOnUse", y: String(LOGO.y + LOGO.h) }, defs);
    el("rect", { width: "8", height: ".9", fill: C.ink, "fill-opacity": ".22" }, pat);
    // Respaldo blanco con la silueta del logo: el logo se ve igual que sobre su fondo original
    var fl = el("filter", { id: "imp-blanco", x: "0", y: "0", width: "1", height: "1" }, defs);
    el("feColorMatrix", { type: "matrix", values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 3 -0.6" }, fl);

    // Estructura fija
    caja(svg, 24, 392, 352, 18, C.paper, C.lilac, C.ink);
    [70, 330].forEach(function (x) { el("line", { x1: x, y1: 48, x2: x, y2: 392, stroke: C.grey, "stroke-width": "1.6", "stroke-dasharray": "3 3" }, svg); });
    caja(svg, 44, 46, 18, 346, C.paper, C.lilac, C.ink);
    caja(svg, 338, 46, 18, 346, C.paper, C.lilac, C.ink);
    caja(svg, 44, 30, 312, 16, C.paper, C.lilac, C.ink);
    // Bobina
    el("line", { x1: 300, y1: 30, x2: 300, y2: -10, stroke: C.ink, "stroke-width": "4", "stroke-linecap": "round" }, svg);
    el("circle", { cx: 300 + DX / 2, cy: -12 + DY / 2, r: 32, fill: C.ink }, svg);
    el("circle", { cx: 300, cy: -12, r: 32, fill: C.paper, stroke: C.ink, "stroke-width": "2.4" }, svg);
    var gira = el("g", { transform: "translate(300 -12)" }, svg);
    el("circle", { r: 24, fill: C.violet }, gira);
    el("circle", { r: 18, fill: "none", stroke: C.paper, "stroke-width": "1.6", "stroke-dasharray": "4 6" }, gira);
    el("path", { d: "M0 -8V8M-8 0H8", stroke: C.paper, "stroke-width": "3", "stroke-linecap": "round" }, gira);
    el("circle", { cx: 300, cy: -12, r: 5, fill: C.ink }, svg);
    // Cama
    caja(svg, 140, 362, 14, 30, C.paper, C.lilac, C.ink);
    caja(svg, 246, 362, 14, 30, C.paper, C.lilac, C.ink);
    caja(svg, 92, 348, 216, 14, C.paper, C.lilac, C.ink);
    var rej = "";
    for (var i = 1; i < 9; i++) { var x = 92 + i * 24; rej += "M" + x + " 348L" + (x + DX) + " " + (348 + DY); }
    el("path", { d: rej, stroke: C.violet, "stroke-opacity": ".35", "stroke-width": "1" }, svg);

    // Pieza: silueta tenue + parte impresa + líneas de capa + capa en curso
    el("image", { href: src, x: LOGO.x, y: LOGO.y, width: LOGO.w, height: LOGO.h, opacity: ".07" }, svg);
    var hecho = el("g", { "clip-path": "url(#imp-hecho)" }, svg);
    el("image", { href: src, x: LOGO.x, y: LOGO.y, width: LOGO.w, height: LOGO.h, filter: "url(#imp-blanco)" }, hecho);
    el("image", { href: src, x: LOGO.x, y: LOGO.y, width: LOGO.w, height: LOGO.h }, hecho);
    var capas = el("rect", { x: LOGO.x, y: LOGO.y, width: LOGO.w, height: LOGO.h, fill: "url(#imp-capas)", mask: "url(#imp-logo)" }, hecho);
    var gCurso = el("g", { mask: "url(#imp-logo)" }, svg);
    var curso = el("rect", { fill: C.hi, height: LHPX }, gCurso);

    // Eje X (sube con la impresión), carro y boquilla
    var gEje = el("g", {}, svg);
    var patinI = caja(gEje, 38, 0, 30, 22, C.paper, C.lilac, C.ink);
    var patinD = caja(gEje, 332, 0, 30, 22, C.paper, C.lilac, C.ink);
    var riel = caja(gEje, 62, 0, 276, 9, C.ink, "#3a3446", C.ink);
    var filamento = el("path", { fill: "none", stroke: C.violet, "stroke-width": "2.4", "stroke-linecap": "round" }, svg);
    var gCarro = el("g", {}, svg);
    var carro = caja(gCarro, 0, 0, 40, 32, C.paper, C.lilac, C.ink);
    var franja = el("rect", { width: 28, height: 5, rx: 2, fill: C.violet }, gCarro);
    var led = el("circle", { r: 3, fill: C.hi }, gCarro);
    var boquilla = el("polygon", { fill: C.ink }, gCarro);
    var calor = el("circle", { r: 3.2, fill: C.violet }, gCarro);

    host.insertBefore(svg, fallback);
    if (fallback) fallback.remove();
    return { clip: clip, capas: capas, curso: curso, patinI: patinI, patinD: patinD, riel: riel, carro: carro, franja: franja, led: led, boquilla: boquilla, calor: calor, filamento: filamento, gira: gira };
  }

  function hero() {
    var root = $("[data-hero]"), host = $("[data-printer]");
    if (!root || !host || quieto || !window.gsap) return;
    var src = host.getAttribute("data-src");
    var m = construirImpresora(host, src);
    var pct = $("[data-c-pct]"), bar = $("[data-c-bar]"), log = $("[data-c-log]"), capaEl = $("[data-c-layer]"), estado = $("[data-c-status]"), hint = $("[data-hint]");
    var FIN = 0.86, INICIO = 0.1;
    var BASE = LOGO.y + LOGO.h;
    var ultimaCapa = -1, ultimoPct = -1, ultimoEstado = "", ultimaPasada = -1, e = 0;

    function linea(txt) {
      var li = document.createElement("li"); li.textContent = txt; log.appendChild(li);
      while (log.children.length > 3) log.removeChild(log.firstChild);
    }

    function render(p) {
      var pp = clamp(p / FIN, 0, 1), park = clamp((p - FIN) / (1 - FIN), 0, 1);
      var listo = pp >= 1;
      var cf = pp * CAPAS, capa = Math.min(CAPAS - 1, Math.floor(cf)), t = listo ? 1 : cf - capa;
      var yHecho = listo ? LOGO.y - 2 : BASE - capa * LHPX;          // borde de lo ya impreso
      var yCapa = yHecho - LHPX;                                       // capa en curso
      var der = capa % 2 === 0;
      var nx = der ? lerp(X0, X1, t) : lerp(X1, X0, t);

      m.clip.setAttribute("y", f(yHecho));
      m.clip.setAttribute("height", f(420 - yHecho));
      m.capas.setAttribute("opacity", f(1 - park));
      if (!listo && p > 0.001) {
        m.curso.setAttribute("y", f(yCapa)); m.curso.setAttribute("x", f(der ? X0 - 10 : nx));
        m.curso.setAttribute("width", f(Math.max(0, der ? nx - X0 + 10 : X1 + 10 - nx)));
        m.curso.setAttribute("opacity", "1");
      } else { m.curso.setAttribute("opacity", "0"); }

      // Boquilla: imprime sobre la capa en curso; al terminar sube y se estaciona
      var bx = listo ? lerp(nx, 300, park) : nx;
      var by = listo ? lerp(yCapa, 96, park) : yCapa;
      var yr = by - 40;
      m.riel.mover(62, yr); m.patinI.mover(38, yr - 6); m.patinD.mover(332, yr - 6);
      m.carro.mover(bx - 20, yr - 18);
      m.franja.setAttribute("x", f(bx - 14)); m.franja.setAttribute("y", f(yr - 12));
      m.led.setAttribute("cx", f(bx + 12)); m.led.setAttribute("cy", f(yr + 2));
      m.boquilla.setAttribute("points", f(bx - 8) + "," + f(yr + 14) + " " + f(bx + 8) + "," + f(yr + 14) + " " + f(bx + 2.5) + "," + f(by - 1) + " " + f(bx - 2.5) + "," + f(by - 1));
      m.calor.setAttribute("cx", f(bx)); m.calor.setAttribute("cy", f(by)); m.calor.setAttribute("opacity", listo ? "0" : "1");
      m.filamento.setAttribute("d", "M300 -12Q" + f((300 + bx) / 2) + " " + f(Math.min(-12, yr - 18) - 30) + " " + f(bx + 4) + " " + f(yr - 18 + DY / 2));
      m.gira.setAttribute("transform", "translate(300 -12) rotate(" + f(pp * 540) + ")");

      // Consola
      var porcentaje = Math.round(pp * 100);
      if (porcentaje !== ultimoPct) { pct.textContent = porcentaje + "%"; bar.style.transform = "scaleX(" + pp + ")"; ultimoPct = porcentaje; }
      var capaMostrada = p < 0.001 ? 0 : (listo ? CAPAS : capa + 1);
      if (capaMostrada !== ultimaCapa) {
        capaEl.textContent = capaMostrada;
        if (capaMostrada > 0 && !listo) linea(";LAYER:" + capaMostrada + "  G1 Z" + (capaMostrada * 0.2).toFixed(2));
        ultimaCapa = capaMostrada;
      }
      var pasada = Math.floor(t * 3);
      if (!listo && pasada !== ultimaPasada) { e += 0.38; linea("G1 X" + (nx * 0.6).toFixed(2) + " Y" + (yCapa * 0.4).toFixed(2) + " E" + e.toFixed(2)); ultimaPasada = pasada; }
      var est = listo ? "Pieza terminada" : p < 0.001 ? "Calentando" : "Imprimiendo";
      if (est !== ultimoEstado) { estado.textContent = est; ultimoEstado = est; }
      if (hint) hint.style.opacity = String(clamp(1 - (p - INICIO) * 10, 0, 1));
    }

    var estadoP = { p: 0 };
    var ir = gsap.quickTo(estadoP, "p", { duration: tactil ? 0.3 : 0.45, ease: "power3.out", onUpdate: function () { render(estadoP.p); } });
    render(0);
    log.innerHTML = "<li>; matrix3d.gcode</li><li>G28 ; home</li><li>M104 S210 ; boquilla 210 °C</li>";
    var intro = true;
    var st = ScrollTrigger.create({
      trigger: root, start: "top top+=68", end: "bottom bottom",
      onUpdate: function (self) { if (intro && self.progress < 0.01) return; intro = false; ir(INICIO + (1 - INICIO) * self.progress); }
    });
    gsap.to(estadoP, { p: INICIO, duration: 1.2, delay: 0.2, ease: "power2.out", onUpdate: function () { render(estadoP.p); }, onComplete: function () { intro = false; st.update(); } });
  }

  /* ---------- 4. Cinta: se desplaza con el scroll ---------- */
  function cinta() {
    var row = $("[data-tape]");
    if (!row) return;
    row.innerHTML += row.innerHTML;          // contenido doble para que nunca se vea el final
    if (quieto || !window.gsap) return;
    gsap.fromTo(row, { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.6 } });
  }

  /* ---------- 5. Losas de servicios: se "imprimen" al entrar + inclinación 3D ---------- */
  function losas() {
    var slabs = $$("[data-slab]");
    if (!slabs.length || quieto || !window.gsap) return;
    $$("[data-draw] path:not([stroke-dasharray]), [data-draw] rect").forEach(function (p) {
      p.setAttribute("pathLength", "1"); p.style.strokeDasharray = "1";
    });
    slabs.forEach(function (s, i) {
      var trazos = $$("path:not([stroke-dasharray]), rect", s.querySelector("[data-draw]"));
      gsap.set(trazos, { strokeDashoffset: 1 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: s, start: "top 85%", once: true } });
      tl.fromTo(s, { clipPath: "inset(100% -20px -20px -20px)", y: 40 }, { clipPath: "inset(0% -20px -20px -20px)", y: 0, duration: 0.9, ease: "steps(12)", delay: i * 0.12 })
        .to(trazos, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12, ease: "power2.inOut" }, "-=0.3");
      if (!tactil) {
        var rx = gsap.quickTo(s, "rotationX", { duration: 0.5, ease: "power3.out" });
        var ry = gsap.quickTo(s, "rotationY", { duration: 0.5, ease: "power3.out" });
        gsap.set(s, { transformPerspective: 900 });
        s.addEventListener("pointermove", function (ev) {
          var b = s.getBoundingClientRect();
          ry(((ev.clientX - b.left) / b.width - 0.5) * 10);
          rx(-((ev.clientY - b.top) / b.height - 0.5) * 10);
        });
        s.addEventListener("pointerleave", function () { rx(0); ry(0); });
      }
    });
  }

  /* ---------- 5b. Piezas que "salen de la cama" al entrar ---------- */
  function subir() {
    if (quieto || !window.gsap) return;
    $$("[data-rise]").forEach(function (box) {
      var img = $("img", box), base = $(".plinth", box);
      var tl = gsap.timeline({ scrollTrigger: { trigger: box, start: "top 80%", once: true } });
      tl.from(base, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.5, ease: "power2.out" })
        .fromTo(img, { clipPath: "inset(100% 0 0 0)", y: 30 }, { clipPath: "inset(0% 0 0 0)", y: 0, duration: 1.1, ease: "steps(14)" }, "-=0.1");
    });
  }

  /* ---------- 6. Trabajos: carrusel horizontal con profundidad ---------- */
  function trabajos() {
    var sec = $("[data-works]"), vp = $("[data-works-viewport]"), track = $("[data-works-track]"), bar = $("[data-works-bar]");
    if (!sec || !track) return;
    var piezas = $$(".piece", track);
    // Móvil: deslizamiento nativo; la barra sigue el scroll horizontal
    vp.addEventListener("scroll", function () {
      var max = vp.scrollWidth - vp.clientWidth;
      if (max > 0 && window.innerWidth < 900) bar.style.transform = "scaleX(" + Math.max(0.12, vp.scrollLeft / max) + ")";
    }, { passive: true });
    if (quieto || !window.gsap) return;

    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      var distancia = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, {
        x: function () { return -distancia(); }, ease: "none",
        scrollTrigger: {
          trigger: sec, pin: ".works__pin", start: "top top", end: function () { return "+=" + distancia(); },
          scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (self) { bar.style.transform = "scaleX(" + Math.max(0.12, self.progress) + ")"; }
        }
      });
    });
  }

  /* ---------- 8. NFC: el celular lee el llavero ---------- */
  function nfc() {
    var sec = $("[data-nfc]");
    if (!sec || quieto || !window.gsap) return;
    var tag = $("[data-tag]", sec), ondas = $$("[data-waves] path", sec), tarjeta = $("[data-phone-card]", sec), tel = $("[data-phone]", sec), arte = $(".nfc", sec);
    ondas.forEach(function (o) { o.setAttribute("pathLength", "1"); o.style.strokeDasharray = "1"; o.style.strokeDashoffset = "1"; });
    // Vaivén del llavero (en su cuerpo, no en el grupo que mueve el scroll)
    gsap.to($(".tag__body", tag), { rotation: 4, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1, svgOrigin: "96 120" });
    var tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
    registrarEscena(sec, tl, null);
    tl.fromTo(arte, { x: -10, rotation: -1.5, transformOrigin: "50% 50%" }, { x: 6, rotation: 1, transformOrigin: "50% 50%", duration: 4, ease: "none" }, 0)
      .fromTo(tag, { x: -30, y: 30 }, { x: 64, y: -6, duration: 1.4 }, 0.2)
      .to(ondas, { strokeDashoffset: 0, duration: 0.5, stagger: 0.18 }, 1.4)
      .fromTo(tel, { y: 0 }, { y: -6, duration: 0.3, yoyo: true, repeat: 1, svgOrigin: "304 192" }, 1.5)
      .fromTo(tarjeta, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: "back.out(1.6)" }, 2)
      .to(ondas, { opacity: 0.25, duration: 0.6 }, 2.6)
      .to({}, { duration: 1 });
  }

  /* ---------- Motor de escenas ilustradas ----------
     El progreso se calcula en cada cuadro desde la posición real de la sección
     (getBoundingClientRect), no desde posiciones guardadas: no se desfasa si
     cambian alturas (fuentes, imágenes, galería fija) y funciona igual con
     Lenis, con scroll nativo y dentro de un iframe. */
  var escenas = [];
  function registrarEscena(sec, tl, alAvanzar) {
    tl.pause(0);
    escenas.push({ sec: sec, tl: tl, cb: alAvanzar, p: -1 });
  }
  function moverEscenas() {
    var vh = window.innerHeight, k = tactil ? 0.3 : 0.16;
    for (var i = 0; i < escenas.length; i++) {
      var e = escenas[i], r = e.sec.getBoundingClientRect();
      var recorrido = Math.max(1, r.height - vh);
      var meta = clamp(-r.top / recorrido, 0, 1);
      if (e.p < 0) e.p = meta;
      else if (Math.abs(meta - e.p) < 0.0005) { if (e.p === meta) continue; e.p = meta; }
      else e.p += (meta - e.p) * k;
      e.tl.progress(e.p);
      if (e.cb) e.cb(e.p);
    }
  }

  /* ---------- Utilidades para escenas ilustradas ---------- */
  function marcarPasos(sec, umbrales) {
    var pasos = $$("[data-scene-steps] li", sec);
    return function (p) {
      var activo = 0;
      umbrales.forEach(function (u, i) { if (p >= u) activo = i; });
      pasos.forEach(function (li, i) { li.classList.toggle("is-on", i === activo); });
    };
  }
  function lineaDibujable(el) { var L = el.getTotalLength(); el.style.strokeDasharray = L; el.style.strokeDashoffset = L; return L; }
  function escena(sec, umbrales) {
    var tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
    registrarEscena(sec, tl, marcarPasos(sec, umbrales));
    return tl;
  }

  /* ---------- 9a. Del boceto a la pieza ---------- */
  function disenio() {
    var sec = $("[data-design]");
    if (!sec || quieto || !window.gsap) return;
    var boceto = $("[data-sketch]", sec), lapiz = $("[data-pencil]", sec), cota = $("[data-dim]", sec),
        hoja = $("[data-paper]", sec), monitor = $("[data-monitor]", sec), alambre = $$("[data-wire] path", sec),
        cortes = $("[data-slices-scan]", sec), solidos = $$("[data-solid]", sec), ok = $("[data-ok]", sec), arte = $(".scene", sec);
    var L = lineaDibujable(boceto);
    var largos = alambre.map(lineaDibujable);
    var o = { t: 0 };
    function lapizEn() {
      var pt = boceto.getPointAtLength(L * o.t);
      lapiz.setAttribute("transform", "translate(" + f(pt.x) + " " + f(pt.y) + ")");
      boceto.style.strokeDashoffset = L * (1 - o.t);
    }
    // Vaivén del lápiz mientras dibuja
    gsap.to(lapiz.firstElementChild, { rotation: 6, svgOrigin: "0 0", duration: 0.35, yoyo: true, repeat: -1, ease: "sine.inOut" });
    var tl = escena(sec, [0, 0.42, 0.78]);
    tl.fromTo(arte, { x: -10, y: 6 }, { x: 6, y: -6, duration: 6, ease: "none" }, 0)
      .fromTo(monitor, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, 0)
      .to(o, { t: 1, duration: 1.8, ease: "none", onUpdate: lapizEn }, 0.2)
      .fromTo(cota, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 }, 2)
      .to(lapiz, { opacity: 0, duration: 0.3 }, 2.1)
      .to(hoja, { x: -18, y: 26, rotation: -3, svgOrigin: "150 230", duration: 0.8 }, 2.3)
      .to(alambre, { strokeDashoffset: 0, duration: 1.2, stagger: 0.25 }, 2.5)
      .fromTo(cortes, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.9, ease: "steps(12)" }, 3.9)
      .fromTo(solidos, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.1 }, 4.7)
      .to(cortes, { opacity: 0, duration: 0.3 }, 4.9)
      .fromTo(ok, { opacity: 0, scale: 0.6, svgOrigin: "362 161" }, { opacity: 1, scale: 1, svgOrigin: "362 161", duration: 0.5, ease: "back.out(2)" }, 5.3)
      .to({}, { duration: 0.6 });
    lapizEn();
  }

  /* ---------- 9b. Proceso: conversación de WhatsApp ---------- */
  function chat() {
    var sec = $("[data-chat-scene]");
    if (!sec || quieto || !window.gsap) return;
    var msgs = $$("[data-msg]", sec), feed = $("[data-chat-feed]", sec), esc = $$("[data-typing]", sec),
        barra = $("[data-chat-bar]", sec), pct = $("[data-chat-pct]", sec), tel = $("[data-chat-phone]", sec), arte = $(".scene", sec);
    // Puntos de "escribiendo" en bucle
    esc.forEach(function (g) {
      gsap.to($$("circle", g), { y: -4, duration: 0.35, stagger: 0.12, yoyo: true, repeat: -1, ease: "sine.inOut" });
    });
    var o = { v: 0 };
    var tl = escena(sec, [0, 0.3, 0.62, 0.86]);
    var entra = function (m) { return { opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" }; };
    tl.fromTo(arte, { x: 10, y: 6 }, { x: -6, y: -6, duration: 9, ease: "none" }, 0)
      .fromTo(msgs, { opacity: 0, y: 14 }, { opacity: 0, y: 14, duration: 0.01 }, 0)
      .to(msgs[0], entra(), 0.2)
      .to(msgs[1], entra(), 0.9)
      .to(esc[0], { opacity: 1, duration: 0.2 }, 1.5).to(esc[0], { opacity: 0, duration: 0.2 }, 2.2)
      .to(msgs[2], entra(), 2.3)
      .to(msgs[3], entra(), 2.9)
      .to(msgs[4], entra(), 3.8)
      .to(feed, { y: -112, duration: 0.8 }, 4.2)
      .to(esc[1], { opacity: 1, duration: 0.2 }, 4.7).to(esc[1], { opacity: 0, duration: 0.2 }, 5.2)
      .to(msgs[5], entra(), 5.3)
      .to(o, { v: 1, duration: 1.6, ease: "none", onUpdate: function () {
          barra.setAttribute("width", f(104 * o.v)); pct.textContent = Math.round(o.v * 100) + "%";
        } }, 5.6)
      .to(feed, { y: -160, duration: 0.6 }, 7.2)
      .to(msgs[6], entra(), 7.4)
      .fromTo(tel, { y: 0 }, { y: -6, duration: 0.25, yoyo: true, repeat: 1, svgOrigin: "210 230" }, 7.5)
      .to({}, { duration: 1 });
  }

  /* ---------- 9c. Envíos: se empaca la pieza y viaja por México ---------- */
  function envios() {
    var sec = $("[data-ship]");
    if (!sec || quieto || !window.gsap) return;
    var prod = $("[data-product]", sec), fF = $("[data-flap-front]", sec), fB = $("[data-flap-back]", sec), tapa = $("[data-lid]", sec),
        cinta = $("[data-tape-line]", sec), etiqueta = $("[data-label]", sec), ruta = $("[data-route]", sec), van = $("[data-van]", sec),
        pines = $$("[data-pin]", sec), caja = $("[data-box]", sec), arte = $(".scene", sec);
    var LR = lineaDibujable(ruta), LC = lineaDibujable(cinta);
    var o = { t: 0 };
    function vanEn() {
      var pt = ruta.getPointAtLength(LR * o.t);
      van.setAttribute("transform", "translate(" + f(pt.x) + " " + f(pt.y - 16) + ")");
      ruta.style.strokeDashoffset = LR * (1 - o.t);
      [0, 0.33, 0.68, 0.98].forEach(function (u, i) { pines[i].style.opacity = o.t >= u - 0.001 ? 1 : 0.25; });
    }
    gsap.to(caja, { y: -3, duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
    var tl = escena(sec, [0, 0.36, 0.6]);
    tl.fromTo(arte, { x: -10, y: 6 }, { x: 6, y: -6, duration: 7, ease: "none" }, 0)
      .fromTo([fF, fB], { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0)
      .fromTo(tapa, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0)
      .fromTo(etiqueta, { opacity: 0 }, { opacity: 0, duration: 0.01 }, 0)
      .fromTo(prod, { attr: { y: -40 }, rotation: -8, svgOrigin: "227 80" }, { attr: { y: 130 }, rotation: 0, svgOrigin: "227 180", duration: 1.4, ease: "bounce.out" }, 0.3)
      .to(fF, { scaleY: 0, svgOrigin: "225 150", duration: 0.6 }, 2)
      .to(fB, { scaleY: 0, svgOrigin: "265 126", duration: 0.6 }, 2.2)
      .to(tapa, { opacity: 1, duration: 0.2 }, 2.6)
      .to(cinta, { strokeDashoffset: 0, duration: 0.6 }, 2.8)
      .fromTo(etiqueta, { opacity: 0, scale: 1.4, svgOrigin: "225 207" }, { opacity: 1, scale: 1, svgOrigin: "225 207", duration: 0.5, ease: "back.out(2)" }, 3.4)
      .to(o, { t: 1, duration: 2.6, ease: "none", onUpdate: vanEn }, 4.2)
      .to({}, { duration: 0.6 });
    vanEn();
  }

  /* ---------- 10. Bobinas: giran y aceleran con la velocidad del scroll ---------- */
  function bobinas() {
    var spools = $$("[data-spool]");
    if (!spools.length || quieto || !window.gsap) return;
    var giros = spools.map(function (s, i) {
      return gsap.to(s, { rotation: i % 2 ? -360 : 360, transformOrigin: "50% 50%", duration: 10 + i * 2, ease: "none", repeat: -1 });
    });
    ScrollTrigger.create({ trigger: ".materials", start: "top bottom", end: "bottom top",
      onUpdate: function (self) {
        var v = clamp(Math.abs(self.getVelocity()) / 300, 0, 8);
        giros.forEach(function (g) { gsap.to(g, { timeScale: 1 + v, duration: 0.3, overwrite: true }); });
      } });
  }

  /* ---------- 11. Cierre: el logo original se arma desde sus capas ---------- */
  function cierre() {
    var caja = $("[data-slices]");
    if (!caja) return;
    var src = caja.getAttribute("data-src"), N = 7, cortes = [];
    for (var i = 0; i < N; i++) {
      var im = document.createElement("img");
      im.src = src; im.alt = ""; im.decoding = "async"; im.loading = "lazy";
      im.style.clipPath = "inset(" + Math.max(0, 100 * i / N - 0.4) + "% 0 " + Math.max(0, 100 - 100 * (i + 1) / N - 0.4) + "% 0)"; // solape mínimo: sin líneas entre capas
      caja.appendChild(im); cortes.push(im);
    }
    var base = caja.querySelector("[data-slice-base]");
    if (base) base.remove();
    if (quieto || !window.gsap) return;
    var tl = gsap.timeline({ scrollTrigger: { trigger: caja, start: "top 90%", end: "center 55%", scrub: 0.5 } });
    cortes.forEach(function (im, i) {
      var k = (i - (N - 1) / 2);
      tl.fromTo(im, { y: k * 26, x: (i % 2 ? 1 : -1) * 18 }, { y: 0, x: 0, ease: "power2.out", duration: 1 }, 0);
    });
  }

  /* ---------- Scroll suave (Lenis) en escritorio; en táctil se usa el scroll nativo ---------- */
  function scrollSuave() {
    if (quieto || tactil || !window.Lenis || !window.gsap) return;
    var lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var dest = $(id);
        if (!dest) return;
        ev.preventDefault();
        lenis.scrollTo(dest, { offset: -72, duration: 1.1 });
      });
    });
  }

  /* ---------- Inicio ---------- */
  function iniciar() {
    armarWhatsApp();
    header();
    var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
    }
    if (window.gsap) gsap.ticker.add(moverEscenas);
    scrollSuave(); hero(); cinta(); losas(); disenio(); trabajos(); nfc(); chat(); envios(); bobinas(); cierre();
    if (window.ScrollTrigger) {
      window.addEventListener("load", function () { ScrollTrigger.refresh(); });
      // Las fuentes cambian alturas: recalcula posiciones cuando terminen de cargar
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
