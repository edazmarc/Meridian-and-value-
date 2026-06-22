// Sterlington & Roe — interactions
// Lightweight, dependency-free, and respectful of reduced-motion preferences.

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky header shadow on scroll ---- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* ---- Scroll-reveal + count-up + ledger via IntersectionObserver ---- */
  const reveals = document.querySelectorAll(".reveal");
  // Index siblings so grids can stagger their entrance.
  document.querySelectorAll(".cards, .team").forEach((grid) => {
    grid.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--i", i));
  });

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const dur = 1600;
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.round(target * eased);
      el.textContent = prefix + val.toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("in-view");
          if (el.classList.contains("ledger")) el.classList.add("in-view");
          el.querySelectorAll && el.querySelectorAll(".stat-num").forEach(animateCount);
          if (el.classList.contains("stat-num")) animateCount(el);
          obs.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach((el) => io.observe(el));
    document.querySelectorAll(".stat-num").forEach((el) => io.observe(el));
    const ledger = document.querySelector(".ledger");
    if (ledger) io.observe(ledger);
  } else {
    // Fallback: show everything immediately.
    reveals.forEach((el) => el.classList.add("in-view"));
    document.querySelectorAll(".ledger").forEach((el) => el.classList.add("in-view"));
    document.querySelectorAll(".stat-num").forEach((el) => {
      el.textContent = (el.dataset.prefix || "") + (parseFloat(el.dataset.count) || 0).toLocaleString() + (el.dataset.suffix || "");
    });
  }

  /* ---- Contact form (client-side demo validation) ---- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (form) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements.name;
      const email = form.elements.email;
      let ok = true;

      [name, email].forEach((f) => f.classList.remove("invalid"));
      if (!name.value.trim()) { name.classList.add("invalid"); ok = false; }
      if (!emailRe.test(email.value.trim())) { email.classList.add("invalid"); ok = false; }

      if (!ok) {
        status.textContent = "Please add your name and a valid email.";
        status.className = "form-status err";
        return;
      }
      status.textContent = "Thank you — a partner will reach out within one business day.";
      status.className = "form-status ok";
      form.reset();
    });
  }
})();
