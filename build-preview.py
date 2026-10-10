#!/usr/bin/env python3
"""Genera preview/index.html: la página con CSS y JS en línea.
Úsalo para previsualizar o publicar como artifact (las imágenes se
publican junto a él, en assets/). El sitio real usa los archivos
separados de la raíz del proyecto."""
import pathlib, shutil
raiz = pathlib.Path(__file__).parent
doc  = (raiz / "index.html").read_text(encoding="utf-8")
css  = (raiz / "css/styles.css").read_text(encoding="utf-8")
cfg  = (raiz / "js/config.js").read_text(encoding="utf-8")
main = (raiz / "js/main.js").read_text(encoding="utf-8")

doc = doc.replace('<link rel="stylesheet" href="css/styles.css">', "<style>\n" + css + "\n</style>")
doc = doc.replace('<script src="js/config.js" defer></script>', "<script>\n" + cfg + "\n</script>")
doc = doc.replace('<script src="js/main.js" defer></script>', "<script>\n" + main + "\n</script>")
for lib in ("gsap.min.js", "ScrollTrigger.min.js"):
    doc = doc.replace(f'<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/{lib}" defer></script>',
                      f'<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/{lib}"></script>')
# Las librerías deben cargarse antes del código en línea
libs = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n'
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>\n')
doc = doc.replace(libs, "")
doc = doc.replace("<script>\n" + cfg, libs + "<script>\n" + cfg, 1)
doc = doc.replace('<link rel="manifest" href="site.webmanifest">', "")

salida = raiz / "preview"
salida.mkdir(exist_ok=True)
(salida / "index.html").write_text(doc, encoding="utf-8")
if (salida / "assets").exists():
    shutil.rmtree(salida / "assets")
shutil.copytree(raiz / "assets", salida / "assets")
print("preview/index.html", len(doc), "bytes")
