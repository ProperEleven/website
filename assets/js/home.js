/* Home page motion that only this page needs: the Sagazo phone and its floating cards,
   and the window into the game worlds that opens to the full screen as you scroll. */
(function () {
  "use strict";
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || !ST || reduce) return;
  gsap.registerPlugin(ST);

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Sagazo: the phone straightens as it passes, the cards drift at different depths. */
  var stage = document.querySelector("[data-stage]");
  var device = document.querySelector("[data-device]");
  if (stage && device) {
    gsap.fromTo(
      device,
      { rotationY: -28, rotationX: 14, rotationZ: 5, y: 90 },
      {
        rotationY: -8,
        rotationX: 3,
        rotationZ: 1,
        y: -50,
        ease: "none",
        scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 0.8 },
      }
    );
    stage.querySelectorAll("[data-depth]").forEach(function (el) {
      var depth = parseFloat(el.getAttribute("data-depth")) || 0.5;
      gsap.fromTo(
        el,
        { y: 160 * depth },
        { y: -140 * depth, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 0.8 } }
      );
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, ease: "power2.out", scrollTrigger: { trigger: stage, start: "top 85%", end: "top 35%", scrub: 0.8 } }
      );
    });
    if (fine) {
      var tiltX = gsap.quickTo(stage, "rotationY", { duration: 1.2, ease: "power3" });
      var tiltY = gsap.quickTo(stage, "rotationX", { duration: 1.2, ease: "power3" });
      gsap.set(stage, { transformPerspective: 1600 });
      stage.addEventListener("pointermove", function (e) {
        var r = stage.getBoundingClientRect();
        tiltX(((e.clientX - r.left) / r.width - 0.5) * 8);
        tiltY(-((e.clientY - r.top) / r.height - 0.5) * 6);
      });
      stage.addEventListener("pointerleave", function () {
        tiltX(0);
        tiltY(0);
      });
    }
  }

  /* Games: the window opens to the full screen, and the islands rise past at their own speeds. */
  var track = document.querySelector("[data-portal-track]");
  var portal = document.querySelector("[data-portal]");
  if (track && portal) {
    var small = window.matchMedia("(max-width: 900px)").matches;
    var from = small ? "inset(6% 5% round 28px)" : "inset(10% 8% round 40px)";
    gsap.fromTo(
      portal,
      { clipPath: from },
      {
        clipPath: "inset(0% 0% round 0px)",
        ease: "none",
        scrollTrigger: { trigger: track, start: "top 85%", end: "top top", scrub: 0.6 },
      }
    );
    portal.querySelectorAll("[data-island]").forEach(function (el) {
      var k = parseFloat(el.getAttribute("data-island")) || 0.5;
      gsap.fromTo(
        el,
        { yPercent: 40 * k, scale: 0.92 },
        {
          yPercent: -55 * k,
          scale: 1.04,
          ease: "none",
          scrollTrigger: { trigger: track, start: "top bottom", end: "bottom top", scrub: 0.8 },
        }
      );
    });
    if (fine) {
      var islands = portal.querySelectorAll("[data-island] .island__drift");
      var movers = Array.prototype.map.call(islands, function (img) {
        var k = parseFloat(img.parentNode.getAttribute("data-island")) || 0.5;
        return { x: gsap.quickTo(img, "x", { duration: 1.4, ease: "power3" }), y: gsap.quickTo(img, "y", { duration: 1.4, ease: "power3" }), k: k };
      });
      portal.addEventListener("pointermove", function (e) {
        var nx = e.clientX / window.innerWidth - 0.5;
        var ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach(function (m) {
          m.x(-nx * 46 * m.k);
          m.y(-ny * 30 * m.k);
        });
      });
    }
  }
})();
