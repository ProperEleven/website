/* Brings Stoppy's layered world to life: the islands rise into place, the paint trail draws itself,
   Stoppy flies in along it, and the layers drift with the pointer and the scroll at their own depths. */
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
    var islands = scene.querySelectorAll("[data-rise]");
    var trail = scene.querySelector("[data-trail]");
    var stoppy = scene.querySelector("[data-stoppy]");
    var prickle = scene.querySelector("[data-prickle]");
    var copy = scene.querySelectorAll("[data-scene-copy]");

    gsap.set(islands, { yPercent: 30, opacity: 0 });
    if (trail) gsap.set(trail, { scaleX: 0, transformOrigin: "0% 50%" });
    if (stoppy) gsap.set(stoppy, { xPercent: -170, yPercent: 120, rotation: -40, scale: 0.6, opacity: 0 });
    if (prickle) gsap.set(prickle, { scale: 0, rotation: -90 });
    gsap.set(copy, { y: 40, opacity: 0 });

    var tl = gsap.timeline({ paused: true });
    tl.to(islands, { yPercent: 0, opacity: 1, duration: 1.6, ease: "expo.out", stagger: { each: 0.09, from: "center" } }, 0);
    if (trail) tl.to(trail, { scaleX: 1, duration: 1.0, ease: "power3.inOut" }, 0.45);
    if (stoppy) tl.to(stoppy, { xPercent: 0, yPercent: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.25, ease: "back.out(1.4)" }, 0.55);
    if (prickle) tl.to(prickle, { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(2.2)" }, 1.15);
    tl.to(copy, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.08 }, 0.7);

    var play = function () {
      tl.play();
    };
    var start = function () {
      if (ST && !scene.hasAttribute("data-scene-now")) ST.create({ trigger: scene, start: "top 75%", once: true, onEnter: play });
      else play();
    };
    if (window.PET && window.PET.whenOpen) window.PET.whenOpen(start);
    else start();

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
