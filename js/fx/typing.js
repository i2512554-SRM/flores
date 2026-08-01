/* ============================================================
   fx/typing.js — Efecto de texto "máquina de escribir"
   ------------------------------------------------------------
   Escribe un texto carácter a carácter con una cadencia
   "natural": cada letra tarda un tiempo aleatorio (min..max)
   y los signos de puntuación añaden una pausa más larga.

   Uso:
     Flores.fx.typing.type(nodo, "Hola", { min: 45, max: 100 })
       .then(function () { ... });

   Con prefers-reduced-motion se escribe el texto de golpe.

   Expone sobre `Flores.fx.typing`.
============================================================ */

(function () {
  "use strict";

  var api = {};

  var DEFAULT_MIN = 45;   // ms por carácter (rápido)
  var DEFAULT_MAX = 100;  // ms por carácter (lento)

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  // Puntuación que ralentiza el ritmo (como al escribir a mano).
  function isPauseChar(ch) {
    return ch === "." || ch === "," || ch === "…";
  }

  // Escribe `text` dentro de `node`.
  // Devuelve una Promise que se resuelve al terminar.
  api.type = function (node, text, options) {
    options = options || {};
    var min = options.min || DEFAULT_MIN;
    var max = options.max || DEFAULT_MAX;
    var reduced = window.Flores.utils.animations.prefersReducedMotion();

    return new Promise(function (resolve) {
      // Accesibilidad: mostrar el texto completo de inmediato.
      if (reduced) {
        node.textContent = text;
        resolve();
        return;
      }

      var i = 0;

      // Iteramos por code points (no por unidades de 16 bits) para que
      // los emojis se escriban completos, sin partirse a la mitad.
      var chars = Array.from(text);

      function tick() {
        if (i >= chars.length) {
          resolve();
          return;
        }
        node.textContent = chars.slice(0, i + 1).join("");
        var ch = chars[i];
        i += 1;

        // Pausa natural tras la puntuación.
        var delay = isPauseChar(ch) ? rand(min, max) * 3.2 : rand(min, max);
        setTimeout(tick, delay);
      }
      tick();
    });
  };

  window.Flores = window.Flores || {};
  window.Flores.fx = window.Flores.fx || {};
  window.Flores.fx.typing = api;
})();
