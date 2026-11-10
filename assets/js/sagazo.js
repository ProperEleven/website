/* Sagazo page: the phones tilt with the pointer and drift as the hero scrolls away, and the ₹700 ledger counts up
   when it comes into view. The hero itself is in place from the first paint. */
(function () {
  "use strict";
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || reduce) return;
  if (ST) gsap.registerPlugin(ST);

  var stage = document.querySelector("[data-phones]");
  if (stage) {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      gsap.set(stage, { transformPerspective: 1600 });
      var rx = gsap.quickTo(stage, "rotationX", { duration: 1.2, ease: "power3" });
      var ry = gsap.quickTo(stage, "rotationY", { duration: 1.2, ease: "power3" });
      stage.addEventListener("pointermove", function (e) {
        var r = stage.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      });
      stage.addEventListener("pointerleave", function () {
        rx(0);
        ry(0);
      });
    }

    if (ST) {
      gsap.to(stage, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: stage, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    }
  }

  // The ledger counts up from nothing to ₹700.
  var nf = new Intl.NumberFormat("en-IN");
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var state = { v: 0 };
    el.textContent = "₹0";
    var run = function () {
      gsap.to(state, {
        v: target,
        duration: 1.6,
        ease: "power3.out",
        onUpdate: function () {
          el.textContent = "₹" + nf.format(Math.round(state.v));
        },
      });
    };
    if (ST) ST.create({ trigger: el, start: "top 85%", once: true, onEnter: run });
    else run();
  });
})();
