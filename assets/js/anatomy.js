/* Anatomy of the Human Body page: the depth dial's buttons hold one layer of the body (the layers otherwise take turns,
   in CSS), and the phones tilt with the pointer and drift as the hero scrolls away. The hero is in place from the first
   paint. */
(function () {
  "use strict";

  /* The layers: a tap on a layer's name holds it, and a second tap lets them take turns again. Works without GSAP and
     with reduced motion. */
  document.querySelectorAll("[data-peel]").forEach(function (peel) {
    var layers = peel.querySelectorAll(".a-peel__layer");
    var buttons = peel.querySelectorAll("[data-layer]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var held = button.getAttribute("aria-pressed") === "true";
        var n = Number(button.getAttribute("data-layer"));
        buttons.forEach(function (b) {
          b.setAttribute("aria-pressed", String(!held && b === button));
        });
        layers.forEach(function (layer, i) {
          layer.classList.toggle("is-on", held ? i === 0 : i === n);
        });
        if (held) peel.removeAttribute("data-held");
        else peel.setAttribute("data-held", "");
      });
    });
  });

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || reduce) return;
  if (ST) gsap.registerPlugin(ST);

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var tilt = function (el, x, y) {
    if (!fine) return;
    gsap.set(el, { transformPerspective: 1600 });
    var rx = gsap.quickTo(el, "rotationX", { duration: 1.2, ease: "power3" });
    var ry = gsap.quickTo(el, "rotationY", { duration: 1.2, ease: "power3" });
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * x);
      rx(-((e.clientY - r.top) / r.height - 0.5) * y);
    });
    el.addEventListener("pointerleave", function () {
      rx(0);
      ry(0);
    });
  };

  var stage = document.querySelector("[data-phones]");
  if (stage) {
    tilt(stage, 10, 8);
    if (ST) {
      gsap.to(stage, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: stage, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    }
  }

  /* The single phone beside "Tap any part" straightens as it passes. */
  document.querySelectorAll("[data-tilt]").forEach(function (phone) {
    if (!ST) return;
    gsap.fromTo(
      phone,
      { rotation: -8, y: 60 },
      { rotation: -2, y: -40, ease: "none", scrollTrigger: { trigger: phone, start: "top bottom", end: "bottom top", scrub: 0.8 } }
    );
  });
})();
