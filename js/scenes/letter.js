/* ============================================================
   scenes/letter.js — La carta
   ------------------------------------------------------------
   Tras el sobre, el papel se despliega con una entrada elegante
   y el mensaje definitivo se escribe línea a línea, como si
   alguien lo estuviera redactando en ese momento.

   Cierre: al terminar el mensaje, el cursor parpadea un instante,
   se desvanece lentamente, caen pétalos sobre la carta y, tras un
   breve respiro, se revela el mensaje final. La experiencia termina
   aquí, en calma.

   Expone sobre `Flores.scenes.letter`.
============================================================ */

(function () {
  "use strict";

  var dom = window.Flores.utils.dom;
  var anim = window.Flores.utils.animations;
  var typing = window.Flores.fx.typing;

  var root = null;
  var cancelled = false;

  // Mensaje definitivo de la carta (sin firma).
  var LINES = [
    "Si llegaste hasta aquí... primero tengo que felicitarte, porque sobreviviste a todas las animaciones que preparé. 😄",
    "Quería aprovechar este pequeño detalle para desearte un Feliz Día de las Flores. Espero que hoy recibas muchas sonrisas, buenos momentos y, por supuesto, alguna que otra flor.",
    "Dicen que las flores alegran cualquier lugar, pero creo que también existen personas que tienen ese mismo efecto sin darse cuenta.",
    "Me alegra haber podido compartir este pequeño detalle contigo. Espero que este pequeño jardín digital haya logrado sacarte una sonrisa, aunque sea por un momento.",
    "Y si algún día vuelves a abrir este enlace... no te preocupes, las flores volverán a florecer para darte la bienvenida. 🌸",
    "Después de todo... algunas personas también hacen florecer sonrisas sin darse cuenta."
  ];

  // Colores de los pétalos que caen sobre la carta al cierre.
  var PETAL_COLORS = [
    "linear-gradient(160deg, #ffe0ec, #ff7eb6 70%)",
    "linear-gradient(160deg, #e6d9ff, #a66bff 70%)",
    "linear-gradient(160deg, #fff3d0, #f6c453 70%)",
    "linear-gradient(160deg, #ffffff, #ffd3e0 70%)"
  ];

  /* ---------- Ciclo de vida ---------- */

  function init(container, done) {
    root = container;
    cancelled = false;
    reset();
    runSequence();
    if (typeof done === "function") done();
  }

  function destroy() {
    cancelled = true;
    root = null;
  }

  function reset() {
    dom.$$(".letter__eyebrow, .letter__line, .letter__petals, .letter__ending, .letter__paper", root).forEach(function (el) {
      Array.prototype.slice.call(el.classList).forEach(function (c) {
        if (c.indexOf("is-") === 0) el.classList.remove(c);
      });
    });
    dom.$$(".letter__line-text", root).forEach(function (t) { t.textContent = ""; });
    dom.$$(".letter__petal", root).forEach(function (p) {
      if (p.parentNode) p.parentNode.removeChild(p);
    });
  }

  /* ---------- Secuencia de escritura ---------- */

  async function runSequence() {
    var eyebrow = dom.$(".letter__eyebrow", root);
    var lines = dom.$$(".letter__line", root);

    // Espera a que el papel termine de desplegarse y lo deja
    // "asentarse" con un suave flotar mientras se lee.
    await pause(1400);
    if (cancelled) return;

    dom.$(".letter__paper", root).classList.add("is-settled");

    eyebrow.classList.add("is-visible");
    await pause(650);
    if (cancelled) return;

    // Se escribe párrafo a párrafo, con pausas de quien escribe.
    for (var i = 0; i < LINES.length; i++) {
      var line = lines[i];
      var textNode = dom.$(".letter__line-text", line);
      line.classList.add("is-visible", "is-typing");
      await typing.type(textNode, LINES[i], { min: 40, max: 95 });
      if (i < LINES.length - 1) {
        line.classList.remove("is-typing");
        await pause(800);
      }
      if (cancelled) return;
    }

    // Cierre: cursor que se desvanece, pétalos y mensaje final.
    await closeScene(lines);
  }

  /* ---------- Cierre de la escena ---------- */

  // Tras el mensaje: el cursor parpadea un instante, se desvanece
  // lentamente, caen pétalos y se cierra con un mensaje final.
  async function closeScene(lines) {
    var lastLine = lines[lines.length - 1];

    // El cursor de la última línea sigue parpadeando un momento...
    lastLine.classList.add("is-finished");
    await pause(1300);
    if (cancelled) return;

    // ...y se desvanece lentamente.
    lastLine.classList.add("is-faded");
    await pause(750);
    if (cancelled) return;

    // Caen pétalos sobre la carta durante unos segundos.
    releasePetals();
    await pause(3200);
    if (cancelled) return;

    // Cierre tranquilo y emotivo: el mensaje final se revela.
    showEnding();
  }

  // Revela el mensaje de despedida al final de la carta.
  function showEnding() {
    var ending = dom.$(".letter__ending", root);
    if (ending) ending.classList.add("is-visible");
  }

  // Genera los pétalos que caen sobre la carta.
  function releasePetals() {
    var petals = dom.$(".letter__petals", root);
    if (!petals) return;

    for (var i = 0; i < 14; i++) {
      var petal = dom.el("span", { class: "letter__petal" });
      petal.style.left = (Math.random() * 100).toFixed(1) + "%";
      petal.style.background = PETAL_COLORS[i % PETAL_COLORS.length];
      petal.style.setProperty("--petal-dur", (4 + Math.random() * 4).toFixed(2) + "s");
      petal.style.setProperty("--petal-delay", (Math.random() * 3).toFixed(2) + "s");
      petals.appendChild(petal);
    }
    petals.classList.add("is-falling");
  }

  /* ---------- Helpers ---------- */

  async function pause(ms) {
    if (anim.prefersReducedMotion()) return;
    await anim.wait(ms);
  }

  window.Flores = window.Flores || {};
  window.Flores.scenes = window.Flores.scenes || {};
  window.Flores.scenes.letter = { init: init, destroy: destroy };
})();
