/* ============================================================
   main.js — Bootstrap y gestor de escenas
   ------------------------------------------------------------
   - Declara el namespace global `Flores`.
   - Indexa las escenas del HTML (una sola página).
   - goTo(name): alterna .is-active y gestiona init()/destroy()
     de cada escena.
   - Arranca la experiencia en la escena inicial (intro).
============================================================ */

(function () {
  "use strict";

  var scenes = window.Flores.scenes;
  var nodeById = {};   // cache: nombre de escena → nodo <section>
  var current = null;  // nombre de la escena activa

  // Orden narrativo de la experiencia (documenta el flujo).
  var ORDER = ["intro", "garden", "envelope", "letter"];

  // Punto de entrada.
  function boot() {
    buildSceneMap();
    bindAudio();
    goTo("intro");
  }

  // Indexa los <section class="scene" data-scene="..."> del documento.
  function buildSceneMap() {
    document.querySelectorAll(".scene").forEach(function (node) {
      nodeById[node.dataset.scene] = node;
    });
  }

  // Inicializa el control de audio global.
  function bindAudio() {
    if (window.Flores.audio) window.Flores.audio.init();
  }

  // Transiciona a la escena `name`.
  function goTo(name) {
    if (name === current) return;

    var next = nodeById[name];
    if (!next) {
      console.warn("Escena desconocida:", name);
      return;
    }

    var prev = current ? nodeById[current] : null;
    var nextModule = scenes[name];
    var prevModule = current ? scenes[current] : null;

    // 1. Salida: la escena anterior limpia sus recursos.
    if (prevModule && prevModule.destroy) prevModule.destroy();
    if (prev) prev.classList.remove("is-active");

    // 2. Entrada: se muestra la nueva escena y se inicializa.
    next.classList.add("is-active");
    if (nextModule && nextModule.init) {
      // init recibe el nodo y un callback "done" para encadenar
      // secuencias asíncronas dentro de la propia escena.
      nextModule.init(next, function () { current = name; });
    } else {
      current = name;
    }
  }

  // API pública.
  window.Flores.goTo = goTo;
  window.Flores.ORDER = ORDER;

  // Arranque cuando el DOM esté listo.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
