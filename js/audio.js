/* ============================================================
   audio.js — Música ambiental con botón de play/pausa
   ------------------------------------------------------------
   Lazy-loading: el reproductor se crea en el primer toque del
   botón (los navegadores bloquean el autoplay con sonido).
   El estado se refleja visualmente en el botón:
     - .is-playing  → brillo dorado + latido del icono (música activa)
     - sin clase    → estilo neutro (música pausada)
   Si el archivo no existe aún, el botón se oculta sin romper
   la experiencia.
   Expone sobre `Flores.audio`.
============================================================ */

(function () {
  "use strict";

  var toggle = null;
  var player = null;
  var started = false;

  var SRC = "assets/audio/ambient.mp3"; // sustituir por el tema final

  // Vincula el botón global.
  function init() {
    var dom = window.Flores.utils.dom;
    toggle = dom.$("#audio-toggle");
    if (!toggle) return;

    dom.on(toggle, "click", function () {
      if (!started) return start();
      if (player.paused) playTrack();
      else player.pause();
    });
  }

  // Crea el reproductor en la primera interacción.
  function start() {
    var audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = 0.5;

    // Si el archivo no existe, ocultamos el botón silenciosamente.
    audio.addEventListener("error", function () {
      toggle.hidden = true;
      started = true;
    });

    // El estado del botón siempre refleja al reproductor.
    audio.addEventListener("play", function () { setState(true); });
    audio.addEventListener("pause", function () { setState(false); });

    player = audio;
    started = true;
    playTrack();
  }

  // Reproduce; si el navegador lo bloquea, se reintentará en el
  // siguiente toque del botón (sin errores en consola).
  function playTrack() {
    if (!player) return;
    var attempt = player.play();
    if (attempt && attempt.catch) attempt.catch(function () { /* noop */ });
  }

  // Refleja el estado en el botón: clase visual + accesibilidad.
  function setState(active) {
    toggle.classList.toggle("is-playing", active);
    toggle.setAttribute("aria-pressed", String(active));
    toggle.setAttribute("aria-label", active ? "Pausar música" : "Activar música");
  }

  window.Flores = window.Flores || {};
  window.Flores.audio = { init: init };
})();
