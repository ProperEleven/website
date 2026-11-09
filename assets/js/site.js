/* Proper Eleven Technologies: shared page behaviour.
   - The gate: page transitions where two dark halves close like doors, each carrying one bar of the mark.
   - Smooth scrolling (Lenis), the header that hides on the way down, and the small-screen menu.
   - Reveals: [data-split] headings rise line by line, [data-reveal] blocks fade up, [data-words] statements
     light up word by word as you scroll, [data-parallax] layers drift.
   Everything degrades: without the libraries, or with reduced motion, the page is simply there. */
(function () {
  "use strict";

  var d = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var Split = window.SplitText;
  var canAnimate = !!(gsap && ST) && !reduce;

  /* ---------- Opening: other scripts can wait for the page to be uncovered ---------- */

  var opened = false;
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
    document.dispatchEvent(new CustomEvent("pet:open"));
  }

  /* ---------- The gate ---------- */

  var gate = document.querySelector(".gate");
  var halves = gate ? gate.querySelectorAll(".gate__half") : [];
  var bars = gate ? gate.querySelectorAll(".gate__bar") : [];
  d.classList.add("gate-live");

  function openGate() {
    var closed = d.classList.contains("gate-closed");
    var intro = d.classList.contains("gate-intro");
    if (!gate || !closed || !canAnimate) {
      d.classList.remove("gate-closed", "gate-intro");
      markOpened();
      return;
    }
    gsap.set(halves, { xPercent: 0 });
    gsap.set(bars, { scaleY: intro ? 0 : 1, transformOrigin: "50% 50%" });
    d.classList.remove("gate-intro");
    var tl = gsap.timeline({
      onComplete: function () {
        d.classList.remove("gate-closed");
        gsap.set(halves, { clearProps: "transform" });
        gsap.set(bars, { clearProps: "transform" });
      },
    });
    if (intro) {
      tl.to(bars, { scaleY: 1, duration: 0.85, ease: "expo.out", stagger: 0.08 }, 0.08);
      try {
        sessionStorage.setItem("pet-intro", "1");
      } catch (e) {}
    }
    var at = intro ? 0.85 : 0.08;
    tl.to(halves[0], { xPercent: -101, duration: 1.15, ease: "expo.inOut" }, at);
    tl.to(halves[1], { xPercent: 101, duration: 1.15, ease: "expo.inOut" }, at);
    tl.call(markOpened, null, at + 0.45);
  }

  function closeGate(href) {
    if (!gate || !canAnimate) {
      window.location.href = href;
      return;
    }
    try {
      sessionStorage.setItem("pet-gate", "1");
    } catch (e) {}
    d.classList.add("gate-leaving");
    gate.style.pointerEvents = "auto";
    var tl = gsap.timeline({
      onComplete: function () {
        window.location.href = href;
      },
    });
    tl.fromTo(halves[0], { xPercent: -101 }, { xPercent: 0, duration: 0.8, ease: "expo.inOut" }, 0);
    tl.fromTo(halves[1], { xPercent: 101 }, { xPercent: 0, duration: 0.8, ease: "expo.inOut" }, 0);
    tl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: "expo.out", stagger: 0.06 }, 0.5);
  }

  // Coming back with the browser's back button can restore the page with the gate shut.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted || !gate) return;
    d.classList.remove("gate-closed", "gate-intro", "gate-leaving");
    gate.style.pointerEvents = "";
    if (gsap) {
      gsap.set(halves, { clearProps: "transform" });
      gsap.set(bars, { clearProps: "transform" });
    }
    markOpened();
  });

  /* ---------- Smooth scrolling ---------- */

  var lenis = null;
  if (!reduce && window.Lenis) {
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

  /* ---------- Links: same-page anchors scroll, other pages go through the gate ---------- */

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
    if (url.origin !== window.location.origin || url.protocol.indexOf("http") !== 0) return;
    var samePage = url.pathname.replace(/\/$/, "") === window.location.pathname.replace(/\/$/, "");
    if (samePage && url.hash) {
      var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) {
        e.preventDefault();
        if (menuOpen) setMenu(false);
        scrollToEl(target);
        if (window.history.replaceState) window.history.replaceState(null, "", url.hash);
      }
      return;
    }
    if (samePage) return;
    e.preventDefault();
    if (menuOpen) setMenu(false);
    closeGate(url.href);
  });

  /* ---------- Reveals ---------- */

  function fontsReady() {
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return Promise.race([ready, new Promise(function (r) { window.setTimeout(r, 1500); })]);
  }

  function setupReveals() {
    if (!canAnimate || !d.classList.contains("motion")) return;
    gsap.registerPlugin(ST);
    if (Split) gsap.registerPlugin(Split);
    d.classList.add("motion-live");

    document.querySelectorAll("[data-split]").forEach(function (el) {
      var delay = parseFloat(el.getAttribute("data-delay") || "0");
      var waitForGate = el.hasAttribute("data-split-open");
      gsap.set(el, { visibility: "visible" });
      if (!Split) {
        gsap.from(el, { opacity: 0, y: 40, duration: 1.2, ease: "expo.out", delay: delay, scrollTrigger: waitForGate ? null : { trigger: el, start: "top 88%", once: true } });
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
          if (waitForGate) whenOpen(run);
          else ST.create({ trigger: el, start: "top 88%", once: true, onEnter: run });
        },
      });
    });

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      var delay = parseFloat(el.getAttribute("data-delay") || "0");
      var tween = { opacity: 1, y: 0, duration: 1.3, ease: "expo.out", delay: delay };
      if (el.hasAttribute("data-reveal-open")) whenOpen(function () { gsap.to(el, tween); });
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
    if (!canAnimate || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
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

  openGate();
  fontsReady().then(function () {
    setupReveals();
    setupMagnetic();
  });
})();
