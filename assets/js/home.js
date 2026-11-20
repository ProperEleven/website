/* Home page motion that only this page needs: the Sagazo and Anatomy phones and their floating cards. */
(function () {
  "use strict";
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || !ST || reduce) return;
  gsap.registerPlugin(ST);

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Sagazo and Anatomy of the Human Body: each phone straightens as it passes, and its cards drift at different
     depths. Anatomy's stage (data-mirror) stands on the left, so its phone turns the other way. */
  document.querySelectorAll("[data-stage]").forEach(function (stage) {
    var device = stage.querySelector("[data-device]");
    if (!device) return;
    var flip = stage.hasAttribute("data-mirror") ? -1 : 1;
    gsap.fromTo(
      device,
      { rotationY: -28 * flip, rotationX: 14, rotationZ: 5 * flip, y: 90 },
      {
        rotationY: -8 * flip,
        rotationX: 3,
        rotationZ: 1 * flip,
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
  });
})();
