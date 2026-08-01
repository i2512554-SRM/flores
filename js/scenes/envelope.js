/* ============================================================
   scenes/envelope.js — El sobre
   ------------------------------------------------------------
   Secuencia:
     1. Se escribe "Hay unas últimas palabras para ti..." mientras
        el sobre sube desde la parte inferior.
     2. El sello pulsa suavemente invitando a abrir.
     3. Al hacer clic:
        a. La tapa se abre y el sello salta.
        b. La carta asoma un poco (pausa breve).
        c. La carta termina de salir del sobre.
        d. El sobre se retira y se pasa a la carta desplegada.

   Expone sobre `Flores.scenes.envelope`.
============================================================ */

(function () {
  "use strict";

  var dom = window.Flores.utils.dom;
  var anim = window.Flores.utils.animations;
  var typing = window.Flores.fx.typing;

  var root = null;
  var cancelled = false;
  var opened = false;
  var clickHandler = null;

  var MESSAGE = "Hay unas últimas palabras para ti...";

  /* ---------- Ciclo de vida ---------- */

  function init(container, done) {
    root = container;
    root.classList.remove("is-fading");
    cancelled = false;
    opened = false;
    reset();
    bindClick();
    runIntro();
    if (typeof done === "function") done();
  }

  function destroy() {
    cancelled = true;
    var wrap = dom.$(".envelope__wrap", root);
    if (wrap && clickHandler) wrap.removeEventListener("click", clickHandler);
    clickHandler = null;
    root = null;
  }

  function reset() {
    dom.$$(".envelope__wrap, .envelope__message", root).forEach(function (el) {
      Array.prototype.slice.call(el.classList).forEach(function (c) {
        if (c.indexOf("is-") === 0) el.classList.remove(c);
      });
    });
    var text = dom.$(".envelope__message-text", root);
    if (text) text.textContent = "";
  }

  // El sobre (botón real) es el único punto interactivo.
  function bindClick() {
    var wrap = dom.$(".envelope__wrap", root);
    if (!wrap) return;
    if (clickHandler) wrap.removeEventListener("click", clickHandler);
    clickHandler = function () { openEnvelope(); };
    wrap.addEventListener("click", clickHandler);
  }

  /* ---------- Secuencia de entrada ---------- */

  async function runIntro() {
    var msg = dom.$(".envelope__message", root);
    var text = dom.$(".envelope__message-text", root);
    var wrap = dom.$(".envelope__wrap", root);

    // El sobre aparece desde la parte inferior.
    wrap.classList.add("is-visible");

    // Mensaje escrito con naturalidad.
    msg.classList.add("is-visible");
    await typing.type(text, MESSAGE, { min: 46, max: 100 });
    if (cancelled) return;

    await pause(500);
    if (cancelled) return;

    // Invitación: el sello comienza a pulsar.
    wrap.classList.add("is-ready");
  }

  /* ---------- Apertura ---------- */

  async function openEnvelope() {
    if (opened) return;
    opened = true;

    var wrap = dom.$(".envelope__wrap", root);
    var letter = dom.$(".envelope__letter", root);
    var msg = dom.$(".envelope__message", root);

    wrap.classList.remove("is-ready");

    // a. La tapa se abre y el sello salta.
    wrap.classList.add("is-opening");
    await pause(1050);
    if (cancelled) return;

    // b. La carta asoma un poco.
    letter.classList.add("is-peeking");
    await pause(850);
    if (cancelled) return;

    // c. La carta termina de salir.
    letter.classList.add("is-emerging");
    await pause(1400);
    if (cancelled) return;

    // d. El sobre se retira; la escena se disuelve y la carta se
    // desplegará en la siguiente escena.
    wrap.classList.add("is-fading");
    msg.classList.add("is-hiding");
    root.classList.add("is-fading");
    await pause(1000);
    if (cancelled) return;

    window.Flores.goTo("letter");
  }

  /* ---------- Helpers ---------- */

  async function pause(ms) {
    if (anim.prefersReducedMotion()) return;
    await anim.wait(ms);
  }

  window.Flores = window.Flores || {};
  window.Flores.scenes = window.Flores.scenes || {};
  window.Flores.scenes.envelope = { init: init, destroy: destroy };
})();
