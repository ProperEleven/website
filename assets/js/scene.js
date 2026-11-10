/* Stoppy's layered world, in place from the first paint. The layers drift at their own depths as the scene scrolls
   past, and against the pointer where there's a mouse. */
(function () {
  "use strict";
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var scenes = document.querySelectorAll("[data-scene]");
  if (!scenes.length || !gsap || reduce) return;
  if (ST) gsap.registerPlugin(ST);
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  scenes.forEach(function (scene) {
    var layers = scene.querySelectorAll("[data-depth]");

    // Scroll: deeper layers travel further as the scene leaves the screen.
    if (ST) {
      layers.forEach(function (el) {
        var depth = parseFloat(el.getAttribute("data-depth")) || 0.5;
        gsap.to(el, {
          yPercent: -18 * depth,
          ease: "none",
          scrollTrigger: { trigger: scene, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      });
    }

    // Pointer: layers shift against the pointer by their depth.
    if (fine) {
      var movers = Array.prototype.map.call(layers, function (el) {
        var target = el.querySelector(".scene__drift") || el;
        return {
          x: gsap.quickTo(target, "x", { duration: 1.3, ease: "power3" }),
          y: gsap.quickTo(target, "y", { duration: 1.3, ease: "power3" }),
          d: parseFloat(el.getAttribute("data-depth")) || 0.5,
        };
      });
      scene.addEventListener("pointermove", function (e) {
        var r = scene.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        movers.forEach(function (m) {
          m.x(-nx * 40 * m.d);
          m.y(-ny * 26 * m.d);
        });
      });
      scene.addEventListener("pointerleave", function () {
        movers.forEach(function (m) {
          m.x(0);
          m.y(0);
        });
      });
    }
  });
})();
