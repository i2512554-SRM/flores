/* ============================================================
   utils/dom.js — Helpers de manipulación del DOM
   ------------------------------------------------------------
   Selectores, creación de nodos y eventos con delegación.
   Expone sobre `Flores.utils.dom`.
============================================================ */

(function () {
  "use strict";

  var api = {};

  // Selector simple (querySelector).
  api.$ = function (selector, context) {
    return (context || document).querySelector(selector);
  };

  // Selector múltiple → devuelve un Array (más cómodo que NodeList).
  api.$$ = function (selector, context) {
    return Array.prototype.slice.call(
      (context || document).querySelectorAll(selector)
    );
  };

  // Crea un elemento con atributos y contenido opcionales.
  //   el("button", { class: "btn", type: "button" }, "Texto")
  api.el = function (tag, attrs, content) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "text") node.textContent = attrs[key];
        else if (key === "html") node.innerHTML = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    if (content !== undefined && content !== null) {
      if (typeof content === "string") node.textContent = content;
      else node.appendChild(content);
    }
    return node;
  };

  // Escucha eventos con delegación opcional sobre un selector hijo.
  //   on(node, "click", ".boton", handler)
  //   on(node, "click", handler)
  api.on = function (node, event, selector, handler) {
    if (typeof selector === "function") {
      handler = selector;
      selector = null;
    }
    node.addEventListener(event, function (e) {
      if (!selector) return handler(e);
      var target = e.target.closest(selector);
      if (target) handler.call(target, e);
    });
    return node;
  };

  // Expone el módulo en el namespace global.
  window.Flores = window.Flores || {};
  window.Flores.utils = window.Flores.utils || {};
  window.Flores.utils.dom = api;
})();
