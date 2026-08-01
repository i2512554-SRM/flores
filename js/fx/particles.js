/* ============================================================
   fx/particles.js — Motor de partículas sobre Canvas 2D
   ------------------------------------------------------------
   Pétalos luminosos que caen y brotan alrededor de las flores.
   Implementación completa en la Fase 2.
   Expone sobre `Flores.fx.particles`.
============================================================ */

(function () {
  "use strict";

  var api = {};

  // Inicia el motor sobre el lienzo indicado.
  api.start = function (canvas, options) {
    options = options || {};
    // TODO (Fase 2):
    //  - pool de partículas reutilizables (pétalos brillantes),
    //  - gravedad + brisa + giro del pétalo,
    //  - reacción al toque (brotar / dispersar),
    //  - respetar prefers-reduced-motion,
    //  - gestionar redimensionado y devolver una función stop().
  };

  // Detiene el bucle y libera recursos.
  api.stop = function () {
    // TODO (Fase 2): cancelar el requestAnimationFrame y limpiar.
  };

  window.Flores = window.Flores || {};
  window.Flores.fx = window.Flores.fx || {};
  window.Flores.fx.particles = api;
})();
