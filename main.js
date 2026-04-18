(function () {
  const yearEl = document.getElementById("y");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = document.querySelector(".menu-btn");
  const mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", () => {
      const open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      if (open) mobileNav.setAttribute("hidden", "");
      else mobileNav.removeAttribute("hidden");
      document.body.style.overflow = open ? "" : "hidden";
    });
    mobileNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menuBtn.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("hidden", "");
        document.body.style.overflow = "";
      });
    });
  }

  const reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduced) {
    document.querySelectorAll(".reveal").forEach((el) => {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  const canvas = document.getElementById("bg-canvas");
  if (!canvas || reduced) return;

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let raf = 0;
  const nodes = [];

  function resize() {
    w = canvas.width = Math.floor(window.innerWidth * window.devicePixelRatio);
    h = canvas.height = Math.floor(window.innerHeight * window.devicePixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const area = window.innerWidth * window.innerHeight;
    const cap = window.innerWidth < 640 ? 32 : 55;
    const count = Math.min(cap, Math.floor(area / 22000));
    nodes.length = 0;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.4,
      });
    }
  }

  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    const linkDist = Math.min(w, h) * 0.09;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx * window.devicePixelRatio;
      n.y += n.vy * window.devicePixelRatio;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dx = n.x - m.x;
        const dy = n.y - m.y;
        const d = Math.hypot(dx, dy);
        if (d < linkDist) {
          const a = (1 - d / linkDist) * 0.11;
          ctx.strokeStyle = `rgba(52, 211, 153, ${a})`;
          ctx.lineWidth = 0.5 * window.devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }

      const pulse = 0.32 + 0.14 * Math.sin(t * 0.001 + i);
      ctx.fillStyle = `rgba(167, 243, 208, ${pulse})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    resize();
    raf = requestAnimationFrame(tick);
  });
  raf = requestAnimationFrame(tick);
})();
