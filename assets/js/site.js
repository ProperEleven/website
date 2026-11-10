/* Proper Eleven Technologies: shared page behaviour.
   - Pages show at once. The home page's intro (the gate, CSS in index.html) plays once per visit, and the hero's
     [data-split-open] and [data-reveal-open] rise as it opens. whenOpen() lets other scripts wait for it.
   - Smooth wheel scrolling (Lenis) for mice and trackpads, the header that hides on the way down, and the
     small-screen menu. Touch screens keep the browser's own scrolling.
   - Reveals: [data-split] headings rise line by line, [data-reveal] blocks fade up, [data-words] statements
     light up word by word as you scroll, [data-parallax] layers drift. Anything already on screen when the page
     opens is simply there.
   Everything degrades: without the libraries, or with reduced motion, the page is simply there. */
(function () {
  "use strict";

  var d = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var Split = window.SplitText;
  var canAnimate = !!(gsap && ST) && !reduce;

  // Without the animation libraries, nothing waits to be revealed.
  if (!canAnimate) d.classList.remove("motion");

  /* ---------- The home page's intro ---------- */

  // The doors are about 40% open 1.3 s into the CSS animation. That's when the hero starts to rise.
  var OPEN_AT = 1300;
  var intro = d.classList.contains("gate-intro");
  var introOver = !intro;
  var opened = !intro;
  var openQueue = [];

  function whenOpen(fn) {
    if (opened) fn();
    else openQueue.push(fn);
  }

  function markOpened() {
    if (opened) return;
    opened = true;
    openQueue.splice(0).forEach(function (fn) {
      fn();
    });
  }

  if (intro) {
    var gate = document.querySelector(".gate");
    var doors = gate ? gate.querySelector(".gate__half") : null;
    var doorsAnim = doors && doors.getAnimations ? doors.getAnimations()[0] : null;
    var endIntro = function () {
      if (introOver) return;
      introOver = true;
      markOpened();
      d.classList.remove("gate-intro");
      if (gate) gate.remove();
    };
    if (doorsAnim) {
      var elapsed = typeof doorsAnim.currentTime === "number" ? doorsAnim.currentTime : 0;
      window.setTimeout(markOpened, Math.max(0, OPEN_AT - elapsed));
      doorsAnim.finished.then(endIntro, endIntro);
    } else {
      markOpened();
      window.setTimeout(endIntro, 2100);
    }
  }

  /* ---------- Smooth scrolling, for mice and trackpads ---------- */

  // Touch screens keep native scrolling: Lenis doesn't smooth touch, and its touch listeners would make every swipe
  // wait for the page's scripts.
  var lenis = null;
  if (!reduce && finePointer && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    window.__lenis = lenis;
    if (gsap && ST) {
      lenis.on("scroll", ST.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) {
        lenis.raf(t);
        window.requestAnimationFrame(raf);
      };
      window.requestAnimationFrame(raf);
    }
  }

  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); } });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  /* ---------- Header ---------- */

  var header = document.querySelector("[data-header]");
  var lastY = window.scrollY;
  var menuOpen = false;
  function onScroll(y) {
    if (!header) return;
    header.classList.toggle("is-scrolled", y > 40);
    if (menuOpen) return;
    if (y > 200 && y > lastY + 3) header.classList.add("is-hidden");
    else if (y < lastY - 3 || y <= 200) header.classList.remove("is-hidden");
    lastY = y;
  }
  if (lenis) {
    lenis.on("scroll", function (l) {
      onScroll(l.scroll);
    });
  } else {
    window.addEventListener(
      "scroll",
      function () {
        onScroll(window.scrollY);
      },
      { passive: true }
    );
  }
  onScroll(window.scrollY);

  /* ---------- Small-screen menu ---------- */

  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("site-menu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    menuOpen = open;
    toggle.setAttribute("aria-expanded", String(open));
    var label = toggle.querySelector(".menu-toggle__label");
    if (label) label.textContent = open ? "Close" : "Menu";
    menu.classList.toggle("is-open", open);
    if (open) menu.removeAttribute("inert");
    else menu.setAttribute("inert", "");
    if (header) header.classList.remove("is-hidden");
    if (lenis) {
      if (open) lenis.stop();
      else lenis.start();
    }
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      var first = menu.querySelector("a");
      if (first) window.setTimeout(function () { first.focus({ preventScroll: true }); }, 300);
    }
  }
  if (toggle && menu) {
    menu.setAttribute("inert", "");
    toggle.addEventListener("click", function () {
      setMenu(!menuOpen);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Links: same-page anchors scroll smoothly, other pages load straight away ---------- */

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    var url;
    try {
      url = new URL(a.getAttribute("href"), window.location.href);
    } catch (err) {
      return;
    }
    var samePage =
      url.origin === window.location.origin && url.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "");
    var target = samePage && url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
    if (menuOpen) setMenu(false);
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
    if (window.history.replaceState) window.history.replaceState(null, "", url.hash);
  });

  /* ---------- Reveals ---------- */

  // Anything on screen when the page opens is shown as it is, so the first screen never waits for a reveal.
  function showWhatsOnScreen() {
    if (!d.classList.contains("motion")) return;
    document.querySelectorAll("[data-reveal]:not([data-reveal-open]), [data-split]:not([data-split-open])").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.removeAttribute("data-reveal");
        el.removeAttribute("data-split");
      }
    });
  }

  function fontsReady() {
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return Promise.race([ready, new Promise(function (r) { window.setTimeout(r, 1500); })]);
  }

  function setupReveals() {
    if (!canAnimate || !d.classList.contains("motion")) return;
    gsap.registerPlugin(ST);
    if (Split) gsap.registerPlugin(Split);
    d.classList.add("motion-live");
    // The home hero rises with the intro. Once the intro is over, or without one, it's simply there.
    var heroRises = !introOver;

    document.querySelectorAll("[data-split]").forEach(function (el) {
      var atOpen = el.hasAttribute("data-split-open");
      if (atOpen && !heroRises) return;
      var delay = parseFloat(el.getAttribute("data-delay") || "0");
      gsap.set(el, { visibility: "visible" });
      if (!Split) {
        var from = { opacity: 0, y: 40 };
        var to = { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", delay: delay };
        if (atOpen) {
          gsap.set(el, from);
          whenOpen(function () { gsap.to(el, to); });
        } else gsap.fromTo(el, from, Object.assign(to, { scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
        return;
      }
      var played = false;
      Split.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: function (self) {
          if (played) return;
          gsap.set(self.lines, { yPercent: 110 });
          var run = function () {
            played = true;
            gsap.to(self.lines, { yPercent: 0, duration: 1.35, ease: "expo.out", stagger: 0.1, delay: delay });
          };
          if (atOpen) whenOpen(run);
          else ST.create({ trigger: el, start: "top 88%", once: true, onEnter: run });
        },
      });
    });

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      var atOpen = el.hasAttribute("data-reveal-open");
      if (atOpen && !heroRises) return;
      var delay = parseFloat(el.getAttribute("data-delay") || "0");
      var tween = { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", delay: delay };
      if (atOpen) whenOpen(function () { gsap.to(el, tween); });
      else gsap.to(el, Object.assign(tween, { scrollTrigger: { trigger: el, start: "top 92%", once: true } }));
    });

    document.querySelectorAll("[data-words]").forEach(function (el) {
      if (!Split) return;
      var split = Split.create(el, { type: "words", wordsClass: "word" });
      gsap.fromTo(
        split.words,
        { opacity: 0.24 },
        { opacity: 1, ease: "none", stagger: 0.12, scrollTrigger: { trigger: el, start: "top 88%", end: "bottom 58%", scrub: 0.5 } }
      );
    });

    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      var amount = parseFloat(el.getAttribute("data-parallax")) || 0.12;
      var root = el.closest("[data-parallax-root]") || el;
      gsap.fromTo(
        el,
        { yPercent: amount * 100 },
        { yPercent: -amount * 100, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } }
      );
    });

    window.addEventListener("load", function () {
      ST.refresh();
    });
  }

  /* ---------- Magnetic buttons ---------- */

  function setupMagnetic() {
    if (!canAnimate || !finePointer) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28);
        yTo((e.clientY - r.top - r.height / 2) * 0.38);
      });
      el.addEventListener("pointerleave", function () {
        xTo(0);
        yTo(0);
      });
    });
  }

  window.PET = { whenOpen: whenOpen, lenis: lenis, reduce: reduce, canAnimate: canAnimate };

  showWhatsOnScreen();
  fontsReady().then(function () {
    setupReveals();
    setupMagnetic();
  });
})();
