/* ============================================================
   scenes/garden.js — El jardín (historia de la semilla)
   ------------------------------------------------------------
   Secuencia narrativa:
     A. Intro: se escribe "Todo comienza con un pequeño gesto..."
     B. Un destello cae y, al tocar el suelo, nace la semilla.
        Debajo aparece "Tócala."
     C. Al tocar la semilla comienza una única animación continua:
        semilla → raíz → brote → hojas → tallo → capullo → flor → brillo.
     D. "Y, de pronto... / ...todo empezó a florecer." y una ola de
        60–100 flores generadas dinámicamente inunda el jardín desde
        la flor principal hacia los bordes.
     E. El jardín permanece unos segundos y pasa al sobre.

   Rendimiento: animaciones con transform/opacity (GPU); el destello
   que cae se anima con requestAnimationFrame; el campo de flores se
   construye una sola vez reutilizando pocos modelos (JS).

   Expone sobre `Flores.scenes.garden`.
============================================================ */

(function () {
  "use strict";

  var dom = window.Flores.utils.dom;
  var anim = window.Flores.utils.animations;
  var typing = window.Flores.fx.typing;

  var root = null;
  var cancelled = false;
  var tapped = false;
  var fallCancel = null;
  var tapHandler = null;

  var SPARK_MSG = "Todo comienza con un pequeño gesto...";
  var FALL_MS = 1700;

  // Modelos de flor (pétalos y radio) reutilizables por el campo.
  var FIELD_MODELS = [
    { w: 5, v: { petals: 6, radius: 15 } },
    { w: 4, v: { petals: 5, radius: 13 } },
    { w: 3, v: { petals: 4, radius: 12 } },
    { w: 2, v: { petals: 8, radius: 12 } }
  ];

  // Paletas de color del campo (peso = frecuencia de aparición).
  var FIELD_PALETTES = [
    { w: 5, v: { petal: "linear-gradient(165deg, #ffe0ec, #ff7eb6 70%)" } },
    { w: 3, v: { petal: "linear-gradient(165deg, #e6d9ff, #a66bff 70%)" } },
    { w: 3, v: { petal: "linear-gradient(165deg, #fff3d0, #f6c453 70%)" } },
    { w: 2, v: { petal: "linear-gradient(165deg, #ffffff, #ffd3e0 70%)" } },
    { w: 1, v: { petal: "linear-gradient(165deg, #d5fff0, #6fce9f 70%)" } }
  ];

  /* ---------- Ciclo de vida ---------- */

  function init(container, done) {
    root = container;
    root.classList.remove("is-fading");
    cancelled = false;
    tapped = false;
    reset();
    bindTap();
    runIntro();
    if (typeof done === "function") done();
  }

  function destroy() {
    cancelled = true;
    if (fallCancel) { fallCancel(); fallCancel = null; }
    root = null;
  }

  /* ---------- Preparación ---------- */

  // Deja la escena en su estado inicial (re-entradas limpias).
  function reset() {
    var selectors = [
      ".garden__world *", ".garden__world",
      ".garden__intro", ".garden__hint",
      ".garden__phrases", ".garden__bloom-text", ".garden__bloom-line"
    ];
    dom.$$(selectors.join(", "), root).forEach(function (el) {
      Array.prototype.slice.call(el.classList).forEach(function (c) {
        if (c.indexOf("is-") === 0) el.classList.remove(c);
      });
    });

    var text = dom.$(".garden__intro-text", root);
    if (text) text.textContent = "";

    var spark = dom.$(".garden__spark", root);
    if (spark) spark.style.transform = "";

    var field = dom.$(".garden__field", root);
    if (field && field.parentNode) field.parentNode.removeChild(field);
  }

  // La semilla es el único punto interactivo de la escena.
  function bindTap() {
    var seed = dom.$(".garden__seed", root);
    if (!seed) return;
    if (tapHandler) seed.removeEventListener("pointerdown", tapHandler);
    tapHandler = function () { startGrowth(); };
    seed.addEventListener("pointerdown", tapHandler);
  }

  /* ---------- Introducción ---------- */

  async function runIntro() {
    var introEl = dom.$(".garden__intro", root);
    var introText = dom.$(".garden__intro-text", root);

    // Pantalla casi vacía: pequeño respiro antes de escribir.
    await pause(500);
    if (cancelled) return;

    introEl.classList.add("is-visible");
    await typing.type(introText, SPARK_MSG, { min: 42, max: 90 });
    if (cancelled) return;

    await pause(750);
    if (cancelled) return;

    await fallSpark();
    if (cancelled) return;

    // La semilla nace al aterrizar el destello.
    showSeed();
    await pause(650);
    if (cancelled) return;

    dom.$(".garden__hint", root).classList.add("is-visible");
  }

  // Destello que cae desde la parte superior hasta la semilla.
  async function fallSpark() {
    var spark = dom.$(".garden__spark", root);
    var seed = dom.$(".garden__seed", root);

    var sceneRect = root.getBoundingClientRect();
    var seedRect = seed.getBoundingClientRect();

    var fromY = sceneRect.height * 0.12;                       // top: 12%
    var toY = seedRect.top + seedRect.height / 2 - sceneRect.top;

    spark.classList.add("is-visible");

    if (anim.prefersReducedMotion()) {
      spark.style.transform = "translateY(" + (toY - fromY) + "px)";
      await anim.wait(60);
      spark.classList.add("is-landed");
      return;
    }

    await new Promise(function (resolve) {
      var start = performance.now();
      fallCancel = anim.loop(function (now) {
        var t = Math.min((now - start) / FALL_MS, 1);
        spark.style.transform = "translateY(" + (fromY + easeInQuad(t) * (toY - fromY)) + "px)";
        if (t >= 1) {
          if (fallCancel) { fallCancel(); fallCancel = null; }
          spark.classList.add("is-landed");
          resolve();
        }
      });
    });
  }

  // Nace la semilla: el suelo aparece junto a ella.
  function showSeed() {
    dom.$(".garden__soil", root).classList.add("is-visible");
    dom.$(".garden__seed", root).classList.add("is-born");
  }

  /* ---------- Crecimiento ---------- */

  function startGrowth() {
    if (tapped) return;
    tapped = true;

    var seed = dom.$(".garden__seed", root);
    seed.classList.add("is-tapped");
    hideTexts();
    runGrowth();
  }

  // Oculta los textos de preparación al comenzar a crecer.
  function hideTexts() {
    dom.$(".garden__intro", root).classList.add("is-hiding");
    dom.$(".garden__hint", root).classList.add("is-hiding");
  }

  // La animación continua: semilla → raíz → brote → hojas → tallo
  // → capullo → flor → brillo → ola de flores.
  async function runGrowth() {
    var w = function (sel) { return dom.$(sel, root); };

    // 1. Semilla
    w(".garden__seed").classList.add("is-seeded");
    await pause(550);
    if (cancelled) return;

    // 2. Raíz
    w(".garden__root").classList.add("is-drawn");
    await pause(700);
    if (cancelled) return;

    // 3. Brote (tallo corto + cotiledones) · frase 1
    w(".garden__stem").classList.add("is-grown--half");
    await pause(450);
    w(".garden__cotyledon--1").classList.add("is-visible");
    w(".garden__cotyledon--2").classList.add("is-visible");
    showPhrase(0);
    await pause(950);
    if (cancelled) return;

    // 4. Hojas
    w(".garden__leaf--l1").classList.add("is-visible");
    w(".garden__leaf--r1").classList.add("is-visible");
    await pause(800);
    if (cancelled) return;

    // 5. Tallo crece a plena altura · hojas superiores
    w(".garden__stem").classList.remove("is-grown--half");
    w(".garden__stem").classList.add("is-grown");
    await pause(750);
    w(".garden__leaf--l2").classList.add("is-visible");
    w(".garden__leaf--r2").classList.add("is-visible");
    await pause(600);
    if (cancelled) return;

    // 6. Capullo · frase 2
    w(".garden__bud").classList.add("is-visible");
    showPhrase(1);
    await pause(1150);
    if (cancelled) return;

    // 7. Flor (los pétalos se abren en cascada) · frase 3
    w(".garden__bud").classList.add("is-hiding");
    w(".garden__flower").classList.add("is-bloomed");
    showPhrase(2);
    await pause(1400);
    if (cancelled) return;

    // 8. Brillo
    w(".garden__shine").classList.add("is-active");
    await pause(1100);
    if (cancelled) return;

    // 9. "Y, de pronto..." · "...todo empezó a florecer."
    var bloomText = dom.$(".garden__bloom-text", root);
    var bloomLines = dom.$$(".garden__bloom-line", root);
    bloomLines[0].classList.add("is-visible");
    await pause(1500);
    if (cancelled) return;
    bloomLines[1].classList.add("is-visible");
    await pause(1900);
    if (cancelled) return;

    // 10. Ola de flores por todo el jardín (con pétalos ambiente).
    w(".garden__world").classList.add("is-living");
    var waveMs = createField();
    await pause(waveMs + 700);
    if (cancelled) return;

    // El texto se retira y el jardín florecido permanece unos segundos
    // con los pétalos ambiente cayendo.
    bloomText.classList.add("is-hiding");
    await pause(1800);
    if (cancelled) return;

    await pause(4500);
    if (cancelled) return;

    // Transición lenta: el jardín se desvanece hacia el sobre.
    root.classList.add("is-fading");
    await pause(1900);
    if (cancelled) return;

    window.Flores.goTo("envelope");
  }

  // Revela la frase poética i-ésima.
  function showPhrase(i) {
    var phrases = dom.$$(".garden__phrase", root);
    if (phrases[i]) phrases[i].classList.add("is-visible");
  }

  /* ---------- Campo de flores ---------- */

  // Construye 60–100 flores con una ola radial desde la flor principal.
  // Devuelve los milisegundos hasta que la ola termina.
  function createField() {
    var world = dom.$(".garden__world", root);
    var existing = dom.$(".garden__field", root);
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var field = dom.el("div", { class: "garden__field" });
    var count = 60 + Math.round(Math.random() * 40);          // 60–100 flores

    // Centro de la ola: la flor principal (en % del mundo).
    var GROUND = 20;
    var plantHpx = parseFloat(getComputedStyle(world).getPropertyValue("--plant-h")) || 220;
    var worldH = world.clientHeight || window.innerHeight;
    var cx = 50;
    var cy = GROUND + (plantHpx / worldH) * 100;
    var maxDist = Math.sqrt(Math.pow(cx, 2) + Math.pow(100 - cy, 2));
    var MAX_DELAY = 3200;

    for (var i = 0; i < count; i++) {
      var left = 3 + Math.random() * 94;
      var bottom = 16 + Math.random() * 46;

      // Perspectiva: las flores más lejanas (arriba) son más pequeñas.
      var perspective = 1 - ((bottom - 16) / 46) * 0.35;
      var scale = (0.42 + Math.random() * 0.85) * perspective;
      var rot = -24 + Math.random() * 48;
      var model = pickWeighted(FIELD_MODELS);
      var palette = pickWeighted(FIELD_PALETTES);

      // Retardo radial: más cerca de la flor principal → aparece antes.
      var dx = left - cx;
      var dy = bottom - cy;
      var dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
      var delay = Math.pow(dist, 1.15) * MAX_DELAY + Math.random() * 220;

      var flower = dom.el("div", { class: "field-flower" });
      flower.style.left = left + "%";
      flower.style.bottom = bottom + "%";
      flower.style.setProperty("--fl-scale", scale.toFixed(3));
      flower.style.setProperty("--fl-rot", rot.toFixed(1) + "deg");
      flower.style.setProperty("--fl-delay", Math.round(delay) + "ms");

      // Un subconjunto se balancea suavemente con el viento.
      if (Math.random() < 0.35) {
        flower.classList.add("is-sway");
        flower.style.setProperty("--fl-sway", (4 + Math.random() * 5).toFixed(1) + "s");
        flower.style.setProperty("--fl-sway-delay", (Math.random() * 6).toFixed(1) + "s");
      }

      flower.appendChild(buildFlowerEl(model, palette));
      field.appendChild(flower);
    }

    world.appendChild(field);

    // Dispara la ola: cada flor aparece tras su propio retardo.
    requestAnimationFrame(function () {
      dom.$$(".field-flower", field).forEach(function (f) {
        f.classList.add("is-blown");
      });
    });

    return MAX_DELAY + 900;
  }

  // Crea el interior de una flor (pétalos + centro) según el modelo.
  function buildFlowerEl(model, palette) {
    var inner = dom.el("div", { class: "field-flower-inner" });
    for (var i = 0; i < model.petals; i++) {
      var petal = dom.el("span", { class: "field-flower-petal" });
      petal.style.background = palette.petal;
      petal.style.transform =
        "rotate(" + (i * 360 / model.petals) + "deg) translateY(-" + model.radius + "px)";
      inner.appendChild(petal);
    }
    inner.appendChild(dom.el("span", { class: "field-flower-center" }));
    return inner;
  }

  // Selección aleatoria con pesos (modelo o paleta).
  function pickWeighted(list) {
    var total = 0;
    list.forEach(function (item) { total += item.w; });
    var roll = Math.random() * total;
    var acc = 0;
    for (var i = 0; i < list.length; i++) {
      acc += list[i].w;
      if (roll < acc) return list[i].v;
    }
    return list[list.length - 1].v;
  }

  /* ---------- Helpers ---------- */

  function easeInQuad(t) { return t * t; }

  // Pausa que se salta con prefers-reduced-motion.
  async function pause(ms) {
    if (anim.prefersReducedMotion()) return;
    await anim.wait(ms);
  }

  window.Flores = window.Flores || {};
  window.Flores.scenes = window.Flores.scenes || {};
  window.Flores.scenes.garden = { init: init, destroy: destroy };
})();
