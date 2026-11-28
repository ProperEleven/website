/* Services page: the build in the hero and the pictures beside each kind of work tilt with the pointer, and their pieces
   drift with the scroll at their own depth ([data-depth]). The drift goes into each piece's `translate` through --dy,
   so it adds to the piece's own CSS transform instead of replacing it. The ember line on "How a project works" draws
   with the scroll, across on wide screens and down on narrow ones. Everything is in place from the first paint;
   without GSAP, or with reduced motion, it stays still and the line is simply there. */
(function () {
  "use strict";
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || reduce) return;
  if (ST) gsap.registerPlugin(ST);

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function tilt(el, x, y) {
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
  }

  function depthOf(el) {
    return parseFloat(el.getAttribute("data-depth")) || 0.5;
  }

  // The hero starts where it is, then its pieces drift apart as it scrolls away.
  var build = document.querySelector("[data-build]");
  if (build) {
    tilt(build, 8, 6);
    if (ST) {
      var hero = build.closest("section") || build;
      build.querySelectorAll("[data-depth]").forEach(function (el) {
        gsap.to(el, {
          "--dy": -90 * depthOf(el) + "px",
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      });
    }
  }

  // The steps' line draws as the steps come up: across above 900px, down below it, as the page's CSS lays the rail.
  // matchMedia undoes each branch's tween when the screen crosses that width.
  var timeline = document.querySelector("[data-timeline]");
  var fill = timeline ? timeline.querySelector(".v-timeline__fill") : null;
  if (fill && ST && gsap.matchMedia) {
    var drawWith = function (prop) {
      return function () {
        var from = {};
        var to = { ease: "none", scrollTrigger: { trigger: timeline, start: "top 85%", end: "bottom 60%", scrub: 0.6 } };
        from[prop] = 0;
        to[prop] = 1;
        gsap.fromTo(fill, from, to);
      };
    };
    var mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", drawWith("scaleX"));
    mm.add("(max-width: 900px)", drawWith("scaleY"));
  }

  // Further down, each picture's pieces pass at their own depth.
  document.querySelectorAll("[data-media]").forEach(function (stage) {
    tilt(stage, 8, 6);
    if (!ST) return;
    stage.querySelectorAll("[data-depth]").forEach(function (el) {
      var depth = depthOf(el);
      gsap.fromTo(
        el,
        { "--dy": 70 * depth + "px" },
        {
          "--dy": -70 * depth + "px",
          ease: "none",
          scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 0.8 },
        }
      );
    });
  });
})();
