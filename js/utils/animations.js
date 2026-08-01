/* ============================================================
   utils/animations.js — Easing y helpers de animación
   ------------------------------------------------------------
   Curvas de easing, detección de movimiento reducido y loop
   con requestAnimationFrame.
   Expone sobre `Flores.utils.animations`.
============================================================ */

(function () {
  "use strict";

  var api = {};

  // Curvas de easing (reciben t en [0,1], devuelven progreso [0,1]).
  api.easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };
  api.easeInOutQuad = function (t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };
  api.easeOutBack = function (t) {
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  // Accesibilidad: el usuario prefiere menos movimiento.
  api.prefersReducedMotion = function () {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  };

  // Bucle de animación. Devuelve una función para cancelarlo.
  api.loop = function (update) {
    var running = true;
    var raf = 0;

    function step(now) {
      if (!running) return;
      update(now);
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    return function cancel() {
      running = false;
      cancelAnimationFrame(raf);
    };
  };

  // Retardo en milisegundos como Promise (para encadenar secuencias).
  api.wait = function (ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  };

  window.Flores = window.Flores || {};
  window.Flores.utils = window.Flores.utils || {};
  window.Flores.utils.animations = api;
})();
