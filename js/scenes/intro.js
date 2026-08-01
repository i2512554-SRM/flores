/* ============================================================
   scenes/intro.js — Escena de introducción
   ------------------------------------------------------------
   Secuencia cinematográfica de bienvenida:
     1. Genera un cielo estrellado (3 capas de profundidad).
     2. Muestra la cabecera "Para ti".
     3. Escribe las frases una a una con pausas naturales.
     4. Revela el único botón "Comenzar" → jardín.

   Expone sobre `Flores.scenes.intro`.
============================================================ */

(function () {
  "use strict";

  var dom = window.Flores.utils.dom;
  var anim = window.Flores.utils.animations;
  var typing = window.Flores.fx.typing;

  var root = null;
  var startHandler = null;
  var cancelled = false;

  // Frases de la introducción, en orden narrativo.
  var LINES = [
    "Hola...",
    "Antes de seguir...",
    "Quiero mostrarte algo que preparé con mucho cariño."
  ];

  // Pausa extra (ms) tras terminar cada frase.
  var PAUSES = [0, 900, 1500];

  // Punto de entrada de la escena.
  function init(container, done) {
    root = container;
    root.classList.remove("is-fading");
    cancelled = false;
    buildStars();
    bindStartButton();
    runSequence();
    if (typeof done === "function") done();
  }

  // Genera las estrellas como box-shadows (una sola capa de pintura
  // por elemento → muy barato; solo la opacidad se anima en GPU).
  function buildStars() {
    var layers = dom.$$(".intro__stars-layer", root);
    var counts = [90, 50, 22];          // más pequeñas, más abundantes
    var width = window.innerWidth;
    var height = window.innerHeight;

    layers.forEach(function (layer, idx) {
      var shadows = [];
      for (var i = 0; i < counts[idx]; i++) {
        var x = Math.round(Math.random() * width);
        var y = Math.round(Math.random() * height);
        var spread = idx === 2 ? 1 : 0; // las grandes con leve halo
        var alpha = idx === 0 ? 0.5 : idx === 1 ? 0.65 : 0.9;
        shadows.push(
          x + "px " + y + "px 0 " + spread + "px rgba(245,238,247," + alpha + ")"
        );
      }
      layer.style.boxShadow = shadows.join(",");
    });
  }

  // Encadena la secuencia visual completa.
  async function runSequence() {
    var eyebrow = dom.$(".intro__eyebrow", root);
    var lines = dom.$$(".intro__line", root);
    var startBtn = dom.$(".intro__start", root);

    // Respiración inicial antes de empezar.
    await pause(500);
    if (cancelled) return;

    // 1. Cabecera "Para ti".
    eyebrow.classList.add("is-visible");
    await pause(1000);
    if (cancelled) return;

    // 2. Frases escritas con cursor y pausas entre ellas.
    for (var i = 0; i < LINES.length; i++) {
      var textNode = dom.$(".intro__line-text", lines[i]);
      lines[i].classList.add("is-visible", "is-typing");
      await typing.type(textNode, LINES[i], { min: 50, max: 110 });
      lines[i].classList.remove("is-typing");
      await pause(PAUSES[i]);
      if (cancelled) return;
    }

    // 3. Botón "Comenzar".
    startBtn.classList.add("is-visible");
  }

  // "Comenzar" → escena del jardín.
  function bindStartButton() {
    var startBtn = dom.$(".intro__start", root);
    if (!startBtn) return;
    if (startHandler) startBtn.removeEventListener("click", startHandler);
    startHandler = function () {
      // Salida cinematográfica: la intro se disuelve lentamente mientras
      // el jardín aparece (crossfade suave, sin cortes bruscos).
      root.classList.add("is-fading");
      window.Flores.goTo("garden");
    };
    startBtn.addEventListener("click", startHandler);
  }

  // Pausa respetuosa con prefers-reduced-motion.
  async function pause(ms) {
    if (anim.prefersReducedMotion()) return;
    await anim.wait(ms);
  }

  // Limpia al salir de la escena (cancelando secuencias pendientes).
  function destroy() {
    cancelled = true;
    root = null;
  }

  window.Flores = window.Flores || {};
  window.Flores.scenes = window.Flores.scenes || {};
  window.Flores.scenes.intro = { init: init, destroy: destroy };
})();
