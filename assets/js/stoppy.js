/* Stoppy page: the gameplay video's pause button, and the phone that turns to face you as it scrolls in. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The video loops on its own; the button pauses it, and it never starts for people who ask for less motion.
  var video = document.querySelector(".phone video");
  var button = document.querySelector(".phone__toggle");
  if (video && button) {
    var label = function () {
      button.textContent = video.paused ? "Play video" : "Pause video";
    };
    if (reduce) {
      video.removeAttribute("autoplay");
      video.pause();
    }
    button.hidden = false;
    button.addEventListener("click", function () {
      if (video.paused) video.play();
      else video.pause();
    });
    video.addEventListener("play", label);
    video.addEventListener("pause", label);
    label();
  }

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var phone = document.querySelector("[data-phone]");
  if (!gsap || !ST || reduce || !phone) return;
  gsap.registerPlugin(ST);
  gsap.fromTo(
    phone,
    { rotationY: -24, rotationX: 10, rotationZ: -4, y: 30, transformPerspective: 1400 },
    {
      rotationY: 6,
      rotationX: -2,
      rotationZ: 1,
      y: -30,
      ease: "none",
      scrollTrigger: { trigger: phone, start: "top bottom", end: "bottom top", scrub: 0.8 },
    }
  );
})();
