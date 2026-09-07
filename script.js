(() => {
  "use strict";

  /* =========================================================
     Device / capability profile
     ========================================================= */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(hover: none), (pointer: coarse)").matches || "ontouchstart" in window;
  const mqDesktop = matchMedia("(min-width: 900px)");
  const mqTablet = matchMedia("(min-width: 768px) and (max-width: 899px)");

  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  const lowPower = cores <= 4 || mem <= 4 || /Android|iPhone|iPad/i.test(navigator.userAgent);

  const quality = (() => {
    if (reduceMotion) return 0;
    if (!mqDesktop.matches) return isTouch ? 0.25 : 0.45;
    if (mqTablet.matches) return 0.6;
    if (lowPower) return 0.55;
    return 1;
  })();

  const canDesktopFX = () => mqDesktop.matches && !isTouch && !reduceMotion && quality > 0.4;

  const cleanups = [];
  const onCleanup = (fn) => cleanups.push(fn);

  /* =========================================================
     Nav — mobile menu
     ========================================================= */
  const barContainer = document.getElementById("barContainer");
  const nav = document.getElementById("nav");
  const overlay = document.getElementById("navOverlay");
  const header = document.querySelector(".site-header");
  const navProgress = document.getElementById("navProgress");

  const isMenuOpen = () => document.body.classList.contains("menu-open");

  const setMenuOpen = (open) => {
    if (!nav || !barContainer) return;
    if (mqDesktop.matches) open = false;

    document.body.classList.toggle("menu-open", open);
    nav.classList.toggle("showNav", open);
    barContainer.classList.toggle("is-open", open);
    barContainer.setAttribute("aria-expanded", String(open));
    barContainer.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    if (overlay) {
      overlay.classList.toggle("is-open", open);
      overlay.hidden = !open;
    }

    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.style.overflow = open ? "hidden" : "";

    if (!open && nav.contains(document.activeElement)) {
      barContainer.focus({ preventScroll: true });
    }
  };

  barContainer?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(!isMenuOpen());
  });
  overlay?.addEventListener("click", () => setMenuOpen(false));
  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (!mqDesktop.matches) setMenuOpen(false);
    });
  });
  const onEsc = (e) => {
    if (e.key === "Escape" && isMenuOpen()) setMenuOpen(false);
  };
  document.addEventListener("keydown", onEsc);
  onCleanup(() => document.removeEventListener("keydown", onEsc));

  const onNavMq = () => {
    if (mqDesktop.matches && isMenuOpen()) setMenuOpen(false);
  };
  mqDesktop.addEventListener?.("change", onNavMq);
  onCleanup(() => mqDesktop.removeEventListener?.("change", onNavMq));

  /* =========================================================
     Page transition (short)
     ========================================================= */
  const transition = document.getElementById("pageTransition");
  const transitionStatus = document.getElementById("transitionStatus");

  const runPageTransition = (href) => {
    if (!transition || reduceMotion) {
      window.location.href = href;
      return;
    }
    transition.classList.add("is-active");
    if (transitionStatus) transitionStatus.textContent = "ALGOARTISANS";
    const t1 = setTimeout(() => {
      if (transitionStatus) transitionStatus.textContent = "SYSTEM READY";
    }, 220);
    const t2 = setTimeout(() => {
      window.location.href = href;
    }, 560);
    onCleanup(() => {
      clearTimeout(t1);
      clearTimeout(t2);
    });
  };

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("http") || link.target === "_blank") return;
    if (href.includes(".html")) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        runPageTransition(href);
      });
    }
  });

  window.addEventListener("pageshow", () => transition?.classList.remove("is-active"));

  /* =========================================================
     Shared RAF bus (single loop)
     ========================================================= */
  const rafTasks = new Set();
  let rafId = 0;
  let pageVisible = document.visibilityState === "visible";

  const rafTick = (time) => {
    if (!pageVisible) {
      rafId = 0;
      return;
    }
    rafTasks.forEach((fn) => fn(time));
    rafId = requestAnimationFrame(rafTick);
  };

  const startRaf = () => {
    if (!rafId && rafTasks.size && pageVisible) rafId = requestAnimationFrame(rafTick);
  };

  const addRaf = (fn) => {
    rafTasks.add(fn);
    startRaf();
    return () => {
      rafTasks.delete(fn);
      if (!rafTasks.size && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
  };

  document.addEventListener("visibilitychange", () => {
    pageVisible = document.visibilityState === "visible";
    if (pageVisible) startRaf();
  });

  /* =========================================================
     Custom cursor — desktop only
     ========================================================= */
  const cursor = document.getElementById("cursor");
  if (cursor && canDesktopFX()) {
    document.body.classList.add("has-custom-cursor");
    const ring = cursor.querySelector(".cursor__ring");
    const dot = cursor.querySelector(".cursor__dot");
    const cursorLabel = cursor.querySelector(".cursor__label");
    let cursorX = 0;
    let cursorY = 0;
    let ringX = 0;
    let ringY = 0;

    const onMove = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (dot) {
        dot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }
      cursor.classList.add("is-ready");
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    onCleanup(() => window.removeEventListener("mousemove", onMove));

    const stopCursorRaf = addRaf(() => {
      ringX += (cursorX - ringX) * 0.2;
      ringY += (cursorY - ringY) * 0.2;
      const hover = cursor.classList.contains("is-hover");
      if (ring) {
        ring.style.opacity = hover ? "1" : "0";
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${hover ? 1 : 0.35})`;
      }
      if (cursorLabel) {
        cursorLabel.style.transform = `translate3d(${ringX}px, ${ringY + 28}px, 0) translateX(-50%)`;
      }
    });
    onCleanup(stopCursorRaf);

    document.querySelectorAll("[data-cursor], a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hover");
        if (cursorLabel) cursorLabel.textContent = el.getAttribute("data-cursor") || "OPEN";
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover");
        if (cursorLabel) cursorLabel.textContent = "";
      });
    });
  } else {
    cursor?.remove();
  }

  /* CTA hover label */
  document.querySelectorAll("[data-hover-label]").forEach((btn) => {
    const original = btn.textContent;
    const hover = btn.getAttribute("data-hover-label");
    btn.addEventListener("mouseenter", () => {
      btn.textContent = hover;
    });
    btn.addEventListener("mouseleave", () => {
      btn.textContent = original;
    });
  });

  /* =========================================================
     Services data
     ========================================================= */
  const services = [
    {
      num: "01",
      title: "Digital Systems",
      subtitle: "Full-Stack Software Engineering",
      desc: "We design and build complete digital systems—from business platforms and internal tools to customer-facing web applications.",
      caps: ["SaaS Platforms", "Business Management Systems", "Dashboards", "APIs & Backend Systems", "Database Architecture", "Authentication & Security", "Cloud Infrastructure", "Third-Party Integrations"],
      highlight: "",
      cta: "Build a System →",
    },
    {
      num: "02",
      title: "Applications",
      subtitle: "Web & Mobile Application Engineering",
      desc: "Turn your product idea into a production-ready application designed for real users, real businesses and real-world scale.",
      caps: ["Web Applications", "Mobile Applications", "Cross-Platform Apps", "Admin Platforms", "Payment Integrations", "API Integrations", "Cloud Deployment", "App Store Deployment"],
      highlight: "",
      cta: "Build an Application →",
    },
    {
      num: "03",
      title: "AI Workforce",
      subtitle: "AI Agent Deployment & Automation",
      desc: "Deploy intelligent AI agents that perform real business work—not just answer questions.",
      caps: ["Customer Service Agents", "Research Agents", "Sales Agents", "Internal Company Agents", "Workflow Automation", "Data Processing", "Knowledge Systems", "Multi-Agent Systems"],
      highlight: "Don't just add AI to your business. Give your business an AI workforce.",
      cta: "Deploy an AI Agent →",
    },
    {
      num: "04",
      title: "Intelligence",
      subtitle: "AI Research & Business Intelligence",
      desc: "Transform complex information into actionable intelligence using AI-assisted research, analysis and automation.",
      caps: ["Market Research", "Competitor Intelligence", "Technology Research", "Policy & Regulatory Research", "Data Analysis", "Business Intelligence"],
      highlight: "Research faster. Understand deeper. Decide smarter.",
      cta: "Start Research →",
    },
    {
      num: "05",
      title: "AI Systems",
      subtitle: "Custom AI Systems Engineering",
      desc: "For organizations that need more than a single AI agent, we architect complete AI-powered systems designed around their data, workflows and objectives.",
      caps: ["AI-Powered SaaS", "Multi-Agent Systems", "RAG Systems", "Custom LLM Applications", "AI Workflow Platforms", "Enterprise AI Integration"],
      highlight: "",
      cta: "Build an AI System →",
    },
  ];

  const agents = {
    atlas: {
      domain: "Project Intelligence",
      name: "Atlas",
      role: "AI Project Manager",
      desc: "Plans projects, organizes tasks, tracks deadlines, coordinates workflows and keeps execution moving.",
      caps: ["Planning", "Coordination", "Deadlines", "Execution"],
    },
    nova: {
      domain: "Systems Intelligence",
      name: "Nova",
      role: "AI Systems Architect",
      desc: "Designs technical architecture, evaluates solutions, reviews code and helps transform requirements into scalable systems.",
      caps: ["Architecture", "Evaluation", "Code Review", "Scalability"],
    },
    forge: {
      domain: "Product Engineering",
      name: "Forge",
      role: "AI Software Engineer",
      desc: "Supports frontend, backend, integrations, testing and deployment across our development workflow.",
      caps: ["Frontend", "Backend", "Integrations", "Deployment"],
    },
    vanta: {
      domain: "Growth Intelligence",
      name: "Vanta",
      role: "AI Sales & Marketing",
      desc: "Researches markets, identifies opportunities, manages leads, supports proposals and drives growth.",
      caps: ["Markets", "Leads", "Proposals", "Growth"],
    },
    finn: {
      domain: "Financial Intelligence",
      name: "Finn",
      role: "AI Finance & Operations",
      desc: "Supports financial tracking, quotations, invoicing, expense management and operational reporting.",
      caps: ["Tracking", "Quotations", "Invoicing", "Reporting"],
    },
  };

  const setEngineService = (index) => {
    const s = services[index];
    if (!s) return;
    const num = document.getElementById("engineNum");
    const title = document.getElementById("engineTitle");
    const subtitle = document.getElementById("engineSubtitle");
    const desc = document.getElementById("engineDesc");
    const caps = document.getElementById("engineCaps");
    const highlight = document.getElementById("engineHighlight");
    const cta = document.getElementById("engineCta");
    if (num) num.textContent = s.num;
    if (title) title.textContent = s.title;
    if (subtitle) subtitle.textContent = s.subtitle;
    if (desc) desc.textContent = s.desc;
    if (caps) caps.innerHTML = s.caps.map((c) => `<li>${c}</li>`).join("");
    if (highlight) {
      highlight.hidden = !s.highlight;
      highlight.textContent = s.highlight || "";
    }
    if (cta) cta.textContent = s.cta;
    document.querySelectorAll(".viz").forEach((v, i) => v.classList.toggle("is-active", i === index));
    document.querySelectorAll("#engineDots button").forEach((b, i) => b.classList.toggle("is-active", i === index));
    if (index === 2) {
      document.querySelectorAll(".mini-agent").forEach((a) => a.classList.add("is-on"));
    }
  };

  const dots = document.getElementById("engineDots");
  if (dots) {
    services.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Service ${i + 1}`);
      b.addEventListener("click", () => setEngineService(i));
      dots.appendChild(b);
    });
  }
  setEngineService(0);

  // Mobile stacked services (no scrubbing)
  const engineMobile = document.getElementById("engineMobile");
  if (engineMobile) {
    engineMobile.innerHTML = services
      .map(
        (s) => `
      <article class="engine-mobile-card">
        <span class="engine-num">${s.num}</span>
        <h3 class="engine-title">${s.title}</h3>
        <p class="engine-subtitle">${s.subtitle}</p>
        <p class="engine-desc">${s.desc}</p>
        <ul class="capability-list">${s.caps.map((c) => `<li>${c}</li>`).join("")}</ul>
        ${s.highlight ? `<p class="service-highlight">${s.highlight}</p>` : ""}
        <a class="text-link" href="./contact.html">${s.cta}</a>
      </article>`
      )
      .join("");
  }

  /* =========================================================
     Hero canvas — quality scaled, pause when offscreen
     ========================================================= */
  const canvas = document.getElementById("heroCanvas");
  const hero = document.getElementById("hero");
  let networkApi = null;

  const initHeroNetwork = () => {
    if (!canvas || quality === 0) {
      hero?.classList.add("is-booted");
      canvas?.remove();
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    let width = 0;
    let height = 0;
    let nodes = [];
    let mouse = { x: -9999, y: -9999 };
    let bootProgress = 0;
    let scrollFade = 1;
    let lastY = 0;
    let velocity = 0;
    let inView = true;
    let dpr = Math.min(window.devicePixelRatio || 1, quality >= 0.8 ? 2 : 1.25);

    const rebuild = () => {
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const base = (width * height) / 18000;
      const count = Math.floor(Math.max(12, Math.min(base, 70)) * quality);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.5,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    rebuild();
    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, quality >= 0.8 ? 2 : 1.25);
      rebuild();
    };
    window.addEventListener("resize", onResize, { passive: true });
    onCleanup(() => window.removeEventListener("resize", onResize));

    if (!isTouch) {
      const onMouse = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      };
      hero?.addEventListener("mousemove", onMouse, { passive: true });
      onCleanup(() => hero?.removeEventListener("mousemove", onMouse));
    }

    const boot = setInterval(() => {
      bootProgress = Math.min(1, bootProgress + 0.05);
      if (bootProgress >= 0.4) hero?.classList.add("is-booted");
      if (bootProgress >= 1) clearInterval(boot);
    }, 40);
    onCleanup(() => clearInterval(boot));

    const linkDist = 110 + 30 * quality;
    const stopDraw = addRaf(() => {
      if (!inView || !pageVisible) return;
      ctx.clearRect(0, 0, width, height);
      const activeCount = Math.floor(nodes.length * Math.min(1, bootProgress * 1.35));
      const stretch = 1 + Math.min(0.08, Math.abs(velocity) * 0.0015);

      for (let i = 0; i < activeCount; i++) {
        const n = nodes[i];
        n.x += n.vx * stretch;
        n.y += n.vy * stretch;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.pulse += 0.02;

        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const near = !isTouch && dist < 120;
        const alpha = (0.32 + Math.sin(n.pulse) * 0.12) * scrollFade * (near ? 1.4 : 1);

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (near ? 1 : 0), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(0.9, alpha)})`;
        ctx.fill();

        // Limit connection checks for perf
        const maxJ = Math.min(activeCount, i + 8);
        for (let j = i + 1; j < maxJ; j++) {
          const m = nodes[j];
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - d / linkDist) * 0.22 * scrollFade})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    });
    onCleanup(stopDraw);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(hero || canvas);
    onCleanup(() => io.disconnect());

    networkApi = {
      onScroll(y) {
        const dy = y - lastY;
        velocity += (dy - velocity) * 0.2;
        lastY = y;
        scrollFade = Math.max(0, 1 - y / (window.innerHeight * 0.9));
        canvas.style.opacity = String(0.15 + scrollFade * 0.7);
        canvas.style.transform = `translate3d(0, ${(-y * 0.08 * quality).toFixed(2)}px, 0)`;
        if (hero && canDesktopFX()) {
          const scale = 1 - Math.min(0.06, y / 5000);
          const copy = hero.querySelector(".hero-copy");
          if (copy) copy.style.transform = `translate3d(0,0,0) scale(${scale})`;
        }
      },
    };
  };

  /* =========================================================
     Central scroll progress (no per-component listeners)
     ========================================================= */
  const updateChrome = (scroll, limit) => {
    if (navProgress) {
      navProgress.style.width = `${limit > 0 ? (scroll / limit) * 100 : 0}%`;
    }
    header?.classList.toggle("is-scrolled", scroll > 12);
    networkApi?.onScroll(scroll);
  };

  /* =========================================================
     AI Office — living digital workplace
     ========================================================= */
  const initAiOffice = (ctx = {}) => {
    const section = document.getElementById("workforce");
    const office = document.getElementById("aiOffice");
    if (!section) return;

    const {
      ScrollTrigger: ST,
      canDesktopFX: desktopFX = () => false,
      reduceMotion: rm = false,
      agents: agentMap = agents,
      onCleanup: addClean = () => {},
      scrollTriggers: sts = [],
      quality: q = 1,
    } = ctx;

    const desks = [...section.querySelectorAll(".desk")];
    const mobileDesks = [...section.querySelectorAll(".office-mobile__desk")];
    const panel = document.getElementById("agentPanel");
    const toast = document.getElementById("packetToast");
    const packet = document.getElementById("netPacket");
    const forgeBadge = document.getElementById("forgeBadge");
    const metaAgents = document.getElementById("officeAgentsMeta");
    const metaProject = document.getElementById("officeProjectMeta");
    const metaSystem = document.getElementById("officeSystemMeta");
    const moment = document.getElementById("workforceMoment");
    const order = ["atlas", "nova", "forge", "vanta", "finn"];
    const cams = ["atlas", "nova", "forge", "vanta", "finn", "wide"];

    let activeCount = 0;
    let alive = false;
    let activityTimers = [];
    let packetIndex = 0;

    const packets = [
      { from: "atlas", to: "nova", msg: "TASK_ASSIGNED" },
      { from: "nova", to: "forge", msg: "ARCHITECTURE_READY" },
      { from: "forge", to: "atlas", msg: "BUILD_COMPLETE" },
      { from: "vanta", to: "atlas", msg: "MARKET_RESEARCH_READY" },
      { from: "finn", to: "atlas", msg: "OPERATIONS_UPDATED" },
    ];

    const setMeta = () => {
      if (metaAgents) metaAgents.textContent = `${activeCount} AGENTS ACTIVE`;
      if (metaProject) {
        metaProject.textContent =
          activeCount >= 3 ? "PROJECT STATUS: BUILDING" : activeCount > 0 ? "PROJECT STATUS: INITIALIZING" : "PROJECT STATUS: IDLE";
      }
      if (metaSystem) metaSystem.textContent = activeCount >= 5 ? "OPERATIONAL" : activeCount > 0 ? "BOOTING" : "STANDBY";
    };

    const wakeAgent = (key) => {
      const desk = section.querySelector(`.desk--${key}`);
      const mobile = section.querySelector(`.office-mobile__desk[data-agent="${key}"]`);
      if (desk && !desk.classList.contains("is-awake")) {
        desk.classList.add("is-awake");
        activeCount = Math.min(5, activeCount + 1);
        setMeta();
      }
      mobile?.classList.add("is-awake");
    };

    const setWorking = (key, on) => {
      section.querySelector(`.desk--${key}`)?.classList.toggle("is-working", on);
    };

    const showToast = (msg) => {
      if (!toast || rm || q < 0.3) return;
      toast.hidden = false;
      toast.textContent = msg;
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => {
        toast.hidden = true;
      }, 1400);
    };

    const sendPacket = () => {
      if (!alive || rm) return;
      const p = packets[packetIndex % packets.length];
      packetIndex += 1;
      showToast(`${p.from.toUpperCase()} → ${p.to.toUpperCase()}  ${p.msg}`);
      setWorking(p.from, true);
      setWorking(p.to, true);
      if (packet) {
        packet.style.opacity = "1";
        // simple CSS motion via SMIL-less path approximation
        packet.style.transition = "none";
        const path = document.querySelector(".office-net .net-line");
        if (path && path.getTotalLength) {
          const len = path.getTotalLength();
          let t = 0;
          const step = () => {
            t += 0.03;
            if (t > 1) {
              packet.style.opacity = "0";
              return;
            }
            const pt = path.getPointAtLength(len * t);
            packet.setAttribute("cx", pt.x);
            packet.setAttribute("cy", pt.y);
            requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      }
      if (p.msg.includes("BUILD") && forgeBadge) {
        forgeBadge.textContent = Math.random() > 0.5 ? "BUILD SUCCESS" : "TEST PASSED";
        forgeBadge.classList.add("is-on");
        setTimeout(() => forgeBadge.classList.remove("is-on"), 1600);
      }
      // move a board card
      const cards = [...section.querySelectorAll(".pb-card")];
      cards.forEach((c) => c.classList.remove("is-active"));
      if (cards.length) cards[packetIndex % cards.length].classList.add("is-active");
    };

    const clearActivity = () => {
      activityTimers.forEach(clearTimeout);
      activityTimers = [];
    };

    const scheduleActivity = () => {
      clearActivity();
      if (!alive || rm) return;
      const cycle = () => {
        if (!alive) return;
        const key = order[Math.floor(Math.random() * order.length)];
        setWorking(key, true);
        activityTimers.push(
          setTimeout(() => {
            setWorking(key, false);
          }, 1200 + Math.random() * 1600)
        );
        if (Math.random() > 0.45) sendPacket();
        activityTimers.push(setTimeout(cycle, 2200 + Math.random() * 2800));
      };
      activityTimers.push(setTimeout(cycle, 900));
    };

    const playMoment = () => {
      if (!moment) return;
      const steps = moment.querySelectorAll("[data-step]");
      let step = 0;
      const show = () => {
        steps.forEach((s, i) => s.classList.toggle("is-on", i === step));
        step += 1;
        if (step < steps.length) setTimeout(show, 900);
      };
      show();
    };

    const setPhase = (phase) => {
      section.dataset.officePhase = String(phase);
      if (phase >= 1) {
        section.classList.add("is-lit", "is-active");
        wakeAgent("atlas");
        section.dataset.cam = "atlas";
      }
      if (phase >= 2) {
        wakeAgent("nova");
        section.dataset.cam = "nova";
      }
      if (phase >= 3) {
        wakeAgent("forge");
        section.dataset.cam = "forge";
        setWorking("forge", true);
      }
      if (phase >= 4) {
        wakeAgent("vanta");
        section.dataset.cam = "vanta";
      }
      if (phase >= 5) {
        wakeAgent("finn");
        section.dataset.cam = "finn";
      }
      if (phase >= 6) {
        section.classList.add("is-networked");
        section.dataset.cam = "wide";
        alive = true;
        scheduleActivity();
      }
      if (phase >= 7) {
        playMoment();
      }
    };

    const openAgent = (key) => {
      const data = agentMap[key];
      if (!data || !panel) return;
      desks.forEach((d) => d.classList.toggle("is-focused", d.dataset.agent === key));
      mobileDesks.forEach((d) => d.classList.toggle("is-focused", d.dataset.agent === key));
      office?.classList.add("is-focusing");
      panel.hidden = false;
      document.getElementById("agentDomain").textContent = data.domain;
      document.getElementById("agentName").textContent = data.name;
      document.getElementById("agentRole").textContent = data.role;
      document.getElementById("agentDesc").textContent = data.desc;
      document.getElementById("agentCaps").innerHTML = data.caps.map((c) => `<li>${c}</li>`).join("");
    };

    const closeAgent = () => {
      desks.forEach((d) => d.classList.remove("is-focused"));
      mobileDesks.forEach((d) => d.classList.remove("is-focused"));
      office?.classList.remove("is-focusing");
      if (panel) panel.hidden = true;
    };

    desks.forEach((desk) => {
      desk.addEventListener("mouseenter", () => {
        if (desktopFX()) openAgent(desk.dataset.agent);
      });
      desk.addEventListener("mouseleave", () => {
        if (desktopFX()) closeAgent();
      });
      desk.addEventListener("click", () => {
        if (desk.classList.contains("is-focused")) closeAgent();
        else openAgent(desk.dataset.agent);
      });
    });

    mobileDesks.forEach((desk) => {
      desk.addEventListener("click", () => {
        if (desk.classList.contains("is-focused")) closeAgent();
        else openAgent(desk.dataset.agent);
      });
    });

    document.getElementById("closeAgentPanel")?.addEventListener("click", closeAgent);

    // Scroll phases
    if (ST && !rm) {
      order.forEach((key, i) => {
        const st = ST.create({
          trigger: section,
          start: `top+=${i * 90} 70%`,
          onEnter: () => setPhase(i + 1),
          onLeaveBack: () => {
            if (i === 0) {
              section.classList.remove("is-lit", "is-active", "is-networked");
              activeCount = 0;
              setMeta();
              desks.forEach((d) => d.classList.remove("is-awake", "is-working"));
              alive = false;
              clearActivity();
            }
          },
        });
        sts.push(st);
      });

      const netSt = ST.create({
        trigger: section,
        start: "center 55%",
        onEnter: () => setPhase(6),
      });
      sts.push(netSt);

      const climax = ST.create({
        trigger: section,
        start: "center 40%",
        once: true,
        onEnter: () => setPhase(7),
      });
      sts.push(climax);

      // Desktop subtle scrub camera across agents once lit
      if (desktopFX()) {
        const camSt = ST.create({
          trigger: section,
          start: "top 60%",
          end: "bottom 40%",
          scrub: true,
          onUpdate: (self) => {
            if (!section.classList.contains("is-lit")) return;
            const idx = Math.min(cams.length - 1, Math.floor(self.progress * cams.length));
            section.dataset.cam = cams[idx];
          },
        });
        sts.push(camSt);
      }
    } else {
      // Fallback / reduced motion: reveal all
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          section.classList.add("is-lit", "is-active", "is-networked");
          order.forEach(wakeAgent);
          section.dataset.cam = "wide";
          if (!rm) {
            alive = true;
            scheduleActivity();
          }
          playMoment();
          io.disconnect();
        },
        { threshold: 0.2 }
      );
      io.observe(section);
      addClean(() => io.disconnect());
    }

    // Pause activity when offscreen
    const vis = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          alive = false;
          clearActivity();
        } else if (section.classList.contains("is-networked") && !rm) {
          alive = true;
          scheduleActivity();
        }
      },
      { threshold: 0.15 }
    );
    vis.observe(section);
    addClean(() => {
      vis.disconnect();
      clearActivity();
    });

    setMeta();
  };

  /* =========================================================
     Meet Office — homepage interactive discovery
     ========================================================= */
  const meetAgents = {
    atlas: {
      name: "ATLAS",
      hello: "Hi, I'm ATLAS.",
      line: "I keep projects moving.",
      role: "AI Project Manager",
      body: "I handle planning, coordination, task management and execution across the AlgoArtisans workflow.",
      caps: ["PROJECT PLANNING", "TASK MANAGEMENT", "COORDINATION", "EXECUTION"],
    },
    nova: {
      name: "NOVA",
      hello: "Hi, I'm NOVA.",
      line: "I design the systems behind the ideas.",
      role: "AI Systems Architect",
      body: "I work on architecture, technical planning, system design and scalable engineering solutions.",
      caps: ["ARCHITECTURE", "SYSTEM DESIGN", "TECHNICAL PLANNING", "SCALABILITY"],
    },
    forge: {
      name: "FORGE",
      hello: "Hi, I'm FORGE.",
      line: "I turn architecture into working software.",
      role: "AI Software Engineer",
      body: "I work across development, testing, integrations and deployment.",
      caps: ["DEVELOPMENT", "TESTING", "INTEGRATIONS", "DEPLOYMENT"],
    },
    vanta: {
      name: "VANTA",
      hello: "Hi, I'm VANTA.",
      line: "I find opportunities and turn information into growth.",
      role: "AI Sales & Marketing",
      body: "I work across market research, leads, proposals, sales intelligence and marketing.",
      caps: ["MARKET RESEARCH", "LEADS", "PROPOSALS", "GROWTH"],
    },
    finn: {
      name: "FINN",
      hello: "Hi, I'm FINN.",
      line: "I keep the numbers and operations under control.",
      role: "AI Finance & Operations",
      body: "I support finance, invoices, expenses, reporting and operational workflows.",
      caps: ["FINANCE", "INVOICES", "EXPENSES", "OPERATIONS"],
    },
  };

  const initMeetOffice = (ctx = {}) => {
    const section = document.getElementById("about-office");
    if (!section) return;

    const {
      ScrollTrigger: ST,
      canDesktopFX: desktopFX = () => false,
      reduceMotion: rm = false,
      onCleanup: addClean = () => {},
      scrollTriggers: sts = [],
      quality: q = 1,
    } = ctx;

    const enterBtn = document.getElementById("meetEnter");
    const stage = document.getElementById("meetStage");
    const camera = document.getElementById("meetCamera");
    const room = document.getElementById("meetRoom");
    const viewport = document.getElementById("meetViewport");
    const dialog = document.getElementById("meetDialog");
    const packet = document.getElementById("meetPacket");
    const mobileNav = document.getElementById("meetMobileNav");
    const desks = [...section.querySelectorAll(".meet-desk")];
    const order = ["atlas", "nova", "forge", "vanta", "finn"];

    let inside = false;
    let alive = false;
    let selected = null;
    let typeTimer = null;
    let activityTimers = [];
    let packetIndex = 0;
    let parallaxRaf = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    const packets = [
      { from: "atlas", to: "forge", label: "TASK → FORGE" },
      { from: "forge", to: "atlas", label: "BUILD COMPLETE" },
      { from: "atlas", to: "nova", label: "TASK → NOVA" },
      { from: "vanta", to: "atlas", label: "LEADS READY" },
      { from: "finn", to: "atlas", label: "OPS UPDATED" },
    ];

    const clearActivity = () => {
      activityTimers.forEach(clearTimeout);
      activityTimers = [];
    };

    const setWorking = (key, on) => {
      section.querySelector(`.meet-desk[data-agent="${key}"]`)?.classList.toggle("is-working", on);
    };

    const showPacket = (label, fromKey, toKey) => {
      if (!packet || rm || q < 0.3 || !alive) return;
      const from = section.querySelector(`.meet-desk[data-agent="${fromKey}"]`);
      const to = section.querySelector(`.meet-desk[data-agent="${toKey}"]`);
      if (!from || !to || !room) return;
      const fr = from.getBoundingClientRect();
      const tr = to.getBoundingClientRect();
      const rr = room.getBoundingClientRect();
      const x0 = fr.left + fr.width / 2 - rr.left;
      const y0 = fr.top + fr.height / 2 - rr.top;
      const x1 = tr.left + tr.width / 2 - rr.left;
      const y1 = tr.top + tr.height / 2 - rr.top;
      packet.hidden = false;
      packet.textContent = label;
      packet.classList.add("is-on");
      packet.style.left = `${x0}px`;
      packet.style.top = `${y0}px`;
      packet.style.transition = "none";
      requestAnimationFrame(() => {
        packet.style.transition = "left 1.1s ease, top 1.1s ease, opacity 0.25s ease";
        packet.style.left = `${x1}px`;
        packet.style.top = `${y1}px`;
      });
      clearTimeout(showPacket._t);
      showPacket._t = setTimeout(() => {
        packet.classList.remove("is-on");
        packet.hidden = true;
      }, 1300);
    };

    const scheduleActivity = () => {
      clearActivity();
      if (!alive || rm || selected) return;
      const cycle = () => {
        if (!alive || selected) return;
        const key = order[Math.floor(Math.random() * order.length)];
        setWorking(key, true);
        // flicker screen lines
        const screen = section.querySelector(`.meet-desk[data-agent="${key}"] .meet-screen`);
        if (screen) {
          const spans = [...screen.querySelectorAll("span")];
          spans.forEach((s) => s.classList.remove("on"));
          const pick = spans[Math.floor(Math.random() * spans.length)];
          pick?.classList.add("on");
        }
        activityTimers.push(
          setTimeout(() => {
            if (!selected) setWorking(key, Math.random() > 0.35);
          }, 900 + Math.random() * 1400)
        );
        if (Math.random() > 0.55) {
          const p = packets[packetIndex % packets.length];
          packetIndex += 1;
          showPacket(p.label, p.from, p.to);
          setWorking(p.from, true);
          setWorking(p.to, true);
        }
        activityTimers.push(setTimeout(cycle, 2400 + Math.random() * 2600));
      };
      activityTimers.push(setTimeout(cycle, 700));
    };

    const applyCam = () => {
      if (!camera || !desktopFX() || rm) return;
      const focus = selected || "wide";
      const bases = {
        wide: { x: 0, y: 0, s: 1 },
        atlas: { x: 22, y: 6, s: 1.42 },
        nova: { x: 8, y: 4, s: 1.42 },
        forge: { x: -4, y: 2, s: 1.45 },
        vanta: { x: -18, y: 4, s: 1.42 },
        finn: { x: -30, y: 6, s: 1.42 },
      };
      const b = bases[focus] || bases.wide;
      const rx = py * (selected ? 0.4 : 1.2);
      const ry = px * (selected ? 0.6 : 2.2);
      section.style.setProperty(
        "--meet-cam",
        `translate3d(calc(${b.x}% + ${px * 6}px), calc(${b.y}% + ${py * 4}px), 0) rotateX(${rx}deg) rotateY(${ry}deg) scale(${b.s})`
      );
    };

    const tickParallax = () => {
      parallaxRaf = 0;
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      applyCam();
      if (Math.abs(tx - px) > 0.01 || Math.abs(ty - py) > 0.01) {
        parallaxRaf = requestAnimationFrame(tickParallax);
      }
    };

    const typeLine = (el, text, done) => {
      if (!el) {
        done?.();
        return;
      }
      clearTimeout(typeTimer);
      el.textContent = "";
      if (rm) {
        el.textContent = text;
        done?.();
        return;
      }
      let i = 0;
      const step = () => {
        i += 1;
        el.textContent = text.slice(0, i);
        if (i < text.length) typeTimer = setTimeout(step, 18);
        else done?.();
      };
      step();
    };

    const closeMeet = () => {
      selected = null;
      section.dataset.cam = "wide";
      section.dataset.meet = "inside";
      room?.classList.remove("is-dimmed");
      desks.forEach((d) => d.classList.remove("is-selected", "is-facing"));
      dialog?.classList.remove("is-open");
      section.querySelectorAll(".meet-a11y button").forEach((b) => b.classList.remove("is-active"));
      clearTimeout(typeTimer);
      applyCam();
      if (alive && !rm) scheduleActivity();
    };

    const openMeet = (key) => {
      const data = meetAgents[key];
      if (!data || !inside) return;
      selected = key;
      clearActivity();
      desks.forEach((d) => {
        const on = d.dataset.agent === key;
        d.classList.toggle("is-selected", on);
        d.classList.toggle("is-facing", on);
        d.classList.toggle("is-working", on ? false : d.classList.contains("is-working"));
      });
      room?.classList.add("is-dimmed");
      section.dataset.cam = key;
      section.dataset.meet = "focus";
      applyCam();

      // mobile focus
      desks.forEach((d) => d.classList.toggle("is-mobile-active", d.dataset.agent === key));
      mobileNav?.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.agent === key));
      section.querySelectorAll(".meet-a11y button").forEach((b) => b.classList.toggle("is-active", b.dataset.agent === key));

      if (dialog) {
        dialog.classList.add("is-open");
        const nameEl = document.getElementById("meetDialogName");
        const lineEl = document.getElementById("meetDialogLine");
        const roleEl = document.getElementById("meetDialogRole");
        const bodyEl = document.getElementById("meetDialogBody");
        const capsEl = document.getElementById("meetDialogCaps");
        if (nameEl) nameEl.textContent = data.name;
        if (roleEl) {
          roleEl.style.opacity = "0";
          roleEl.textContent = data.role;
        }
        if (bodyEl) {
          bodyEl.style.opacity = "0";
          bodyEl.textContent = data.body;
        }
        if (capsEl) {
          capsEl.style.opacity = "0";
          capsEl.innerHTML = data.caps.map((c) => `<span>${c}</span>`).join("");
        }
        typeLine(lineEl, data.hello, () => {
          setTimeout(() => {
            if (lineEl && selected === key) lineEl.textContent = `${data.hello} ${data.line}`;
            if (roleEl) roleEl.style.opacity = "";
            if (bodyEl) bodyEl.style.opacity = "";
            if (capsEl) capsEl.style.opacity = "";
          }, rm ? 0 : 280);
        });
      }
    };

    const enterOffice = () => {
      if (inside) return;
      inside = true;
      section.classList.add("is-inside");
      section.dataset.meet = "inside";
      section.dataset.cam = "wide";
      if (stage) stage.setAttribute("aria-hidden", "false");
      applyCam();
      // lazy “boot” activity once inside + visible
      const boot = () => {
        if (!inside || rm) return;
        alive = true;
        scheduleActivity();
        setTimeout(() => section.classList.add("is-connected"), 1800);
      };
      if (rm) {
        section.classList.add("is-connected");
      } else {
        setTimeout(boot, 500);
      }
    };

    enterBtn?.addEventListener("click", enterOffice);

    desks.forEach((desk) => {
      desk.addEventListener("mouseenter", () => desk.classList.add("is-hot"));
      desk.addEventListener("mouseleave", () => desk.classList.remove("is-hot"));
      desk.addEventListener("click", () => {
        if (!inside) enterOffice();
        const key = desk.dataset.agent;
        if (selected === key) closeMeet();
        else openMeet(key);
      });
    });

    document.getElementById("meetBack")?.addEventListener("click", closeMeet);

    section.querySelectorAll(".meet-a11y button").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!inside) enterOffice();
        openMeet(btn.dataset.agent);
      });
    });

    mobileNav?.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!inside) enterOffice();
        openMeet(btn.dataset.agent);
      });
    });

    // Desktop mouse parallax
    if (viewport && desktopFX()) {
      const onMove = (e) => {
        if (!inside || rm) return;
        const r = viewport.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!parallaxRaf) parallaxRaf = requestAnimationFrame(tickParallax);
      };
      const onLeave = () => {
        tx = 0;
        ty = 0;
        if (!parallaxRaf) parallaxRaf = requestAnimationFrame(tickParallax);
      };
      viewport.addEventListener("pointermove", onMove);
      viewport.addEventListener("pointerleave", onLeave);
      addClean(() => {
        viewport.removeEventListener("pointermove", onMove);
        viewport.removeEventListener("pointerleave", onLeave);
      });
    }

    // Scroll: enter office + closer reveal
    if (ST && !rm) {
      const enterSt = ST.create({
        trigger: section,
        start: "top 55%",
        onEnter: () => {
          if (!inside) enterOffice();
        },
      });
      sts.push(enterSt);

      const closeSt = ST.create({
        trigger: section,
        start: "bottom 75%",
        onEnter: () => section.classList.add("is-connected"),
      });
      sts.push(closeSt);
    } else {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          enterOffice();
          section.classList.add("is-connected");
          io.disconnect();
        },
        { threshold: 0.25 }
      );
      io.observe(section);
      addClean(() => io.disconnect());
    }

    // Pause when offscreen
    const vis = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          alive = false;
          clearActivity();
        } else if (inside && !selected && !rm) {
          alive = true;
          scheduleActivity();
        }
      },
      { threshold: 0.12 }
    );
    vis.observe(section);
    addClean(() => {
      vis.disconnect();
      clearActivity();
      clearTimeout(typeTimer);
      if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
    });

    section.dataset.cam = "wide";
  };

  /* =========================================================
     AI Workforce HQ — workforce.html only
     ========================================================= */
  const whqAgents = {
    atlas: {
      id: "AGENT_01",
      name: "ATLAS",
      hello: "Hi, I'm ATLAS.",
      line: "I keep projects moving.",
      role: "AI Project Manager",
      body: "I coordinate projects, manage workflows and keep the team moving.",
      caps: ["PLANNING", "COORDINATION", "TASK MANAGEMENT", "EXECUTION"],
    },
    nova: {
      id: "AGENT_02",
      name: "NOVA",
      hello: "Hi, I'm NOVA.",
      line: "I design the systems behind the ideas.",
      role: "AI Systems Architect",
      body: "I work on architecture, technical planning, system design and scalable engineering solutions.",
      caps: ["ARCHITECTURE", "SYSTEM DESIGN", "APIS", "SCALABILITY"],
    },
    forge: {
      id: "AGENT_03",
      name: "FORGE",
      hello: "Hi, I'm FORGE.",
      line: "I turn architecture into working software.",
      role: "AI Software Engineer",
      body: "I work across development, testing, integrations and deployment.",
      caps: ["CODE", "BUILD", "TEST", "DEPLOY"],
    },
    vanta: {
      id: "AGENT_04",
      name: "VANTA",
      hello: "Hi, I'm VANTA.",
      line: "I turn information into opportunities.",
      role: "AI Sales & Marketing",
      body: "I work across market research, leads, proposals, sales intelligence and growth.",
      caps: ["MARKETS", "LEADS", "ANALYTICS", "GROWTH"],
    },
    finn: {
      id: "AGENT_05",
      name: "FINN",
      hello: "Hi, I'm FINN.",
      line: "I keep operations running smoothly.",
      role: "AI Finance & Operations",
      body: "I support finance, invoices, expenses, reporting and operational workflows.",
      caps: ["FINANCE", "INVOICES", "REPORTS", "OPERATIONS"],
    },
  };

  const initWorkforceHQ = (ctx = {}) => {
    const section = document.getElementById("workforce-hq");
    if (!section) return;

    const {
      ScrollTrigger: ST,
      canDesktopFX: desktopFX = () => false,
      reduceMotion: rm = false,
      onCleanup: addClean = () => {},
      scrollTriggers: sts = [],
      quality: q = 1,
    } = ctx;

    const boot = document.getElementById("whqBoot");
    const viewport = document.getElementById("whqViewport");
    const space = document.getElementById("whqSpace");
    const panel = document.getElementById("whqPanel");
    const packet = document.getElementById("whqPacket");
    const forgeBadge = document.getElementById("whqForgeBadge");
    const mobileNav = document.getElementById("whqMobileNav");
    const zones = [...section.querySelectorAll(".whq-zone")];
    const order = ["atlas", "nova", "forge", "vanta", "finn"];

    let alive = false;
    let selected = null;
    let activityTimers = [];
    let typeTimer = null;
    let packetIndex = 0;
    let parallaxRaf = 0;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    const packets = [
      { from: "atlas", to: "nova", label: "TASK ASSIGNED" },
      { from: "nova", to: "forge", label: "ARCHITECTURE READY" },
      { from: "forge", to: "atlas", label: "BUILD COMPLETE" },
      { from: "vanta", to: "core", label: "MARKET INSIGHT" },
      { from: "finn", to: "core", label: "OPERATIONS UPDATED" },
      { from: "atlas", to: "forge", label: "TASK → FORGE" },
    ];

    // Entry boot — fast
    if (boot && !rm) {
      document.body.classList.add("whq-booting");
      const t1 = setTimeout(() => {
        const st = document.getElementById("whqBootStatus");
        if (st) st.textContent = "SYSTEM ONLINE";
      }, 120);
      const t2 = setTimeout(() => {
        boot.classList.add("is-done");
        document.body.classList.remove("whq-booting");
      }, 650);
      addClean(() => {
        clearTimeout(t1);
        clearTimeout(t2);
      });
    } else {
      boot?.classList.add("is-done");
    }

    const clearActivity = () => {
      activityTimers.forEach(clearTimeout);
      activityTimers = [];
    };

    const setWorking = (key, on) => {
      section.querySelector(`.whq-zone[data-agent="${key}"]`)?.classList.toggle("is-working", on);
    };

    const wake = (key) => {
      section.querySelector(`.whq-zone[data-agent="${key}"]`)?.classList.add("is-awake");
    };

    const bumpProject = (msg) => {
      const status = document.getElementById("whqProjectStatus");
      const pct = document.getElementById("whqProjectPct");
      const steps = [...section.querySelectorAll("#whqPipeline span")];
      if (status && msg.includes("BUILD")) status.textContent = "BUILDING";
      if (status && msg.includes("ARCHITECTURE")) status.textContent = "ARCHITECTING";
      if (status && msg.includes("MARKET")) status.textContent = "GROWING";
      if (status && msg.includes("OPERATIONS")) status.textContent = "OPERATING";
      if (pct) {
        const n = Math.min(96, 58 + ((packetIndex * 7) % 38));
        pct.textContent = `${n}%`;
      }
      if (steps.length) {
        const idx = Math.min(steps.length - 1, 2 + (packetIndex % 4));
        steps.forEach((s, i) => s.classList.toggle("is-on", i <= idx));
      }
    };

    const showPacket = (label, fromKey, toKey) => {
      if (!packet || rm || q < 0.3 || !alive || !space) return;
      const fromEl =
        fromKey === "core"
          ? document.getElementById("whqCore")
          : section.querySelector(`.whq-zone[data-agent="${fromKey}"]`);
      const toEl =
        toKey === "core"
          ? document.getElementById("whqCore")
          : section.querySelector(`.whq-zone[data-agent="${toKey}"]`);
      if (!fromEl || !toEl) return;
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      const sr = space.getBoundingClientRect();
      const x0 = fr.left + fr.width / 2 - sr.left;
      const y0 = fr.top + fr.height / 2 - sr.top;
      const x1 = tr.left + tr.width / 2 - sr.left;
      const y1 = tr.top + tr.height / 2 - sr.top;
      packet.hidden = false;
      packet.textContent = label;
      packet.classList.add("is-on");
      packet.style.left = `${x0}px`;
      packet.style.top = `${y0}px`;
      packet.style.transition = "none";
      requestAnimationFrame(() => {
        packet.style.transition = "left 1.15s ease, top 1.15s ease, opacity 0.25s ease";
        packet.style.left = `${x1}px`;
        packet.style.top = `${y1}px`;
      });
      clearTimeout(showPacket._t);
      showPacket._t = setTimeout(() => {
        packet.classList.remove("is-on");
        packet.hidden = true;
      }, 1350);
      bumpProject(label);
      if (label.includes("BUILD") && forgeBadge) {
        forgeBadge.textContent = Math.random() > 0.4 ? "BUILD SUCCESS" : "BUILDING...";
        forgeBadge.classList.add("is-on");
        setTimeout(() => {
          if (forgeBadge.textContent === "BUILDING...") forgeBadge.textContent = "BUILD SUCCESS";
        }, 700);
      }
    };

    const scheduleActivity = () => {
      clearActivity();
      if (!alive || rm || selected) return;
      const cycle = () => {
        if (!alive || selected) return;
        const key = order[Math.floor(Math.random() * order.length)];
        setWorking(key, true);
        activityTimers.push(
          setTimeout(() => {
            if (!selected) setWorking(key, Math.random() > 0.4);
          }, 1000 + Math.random() * 1500)
        );
        if (Math.random() > 0.5) {
          const p = packets[packetIndex % packets.length];
          packetIndex += 1;
          showPacket(p.label, p.from, p.to);
          setWorking(p.from === "core" ? "atlas" : p.from, true);
          if (p.to !== "core") setWorking(p.to, true);
        }
        activityTimers.push(setTimeout(cycle, 2400 + Math.random() * 2800));
      };
      activityTimers.push(setTimeout(cycle, 600));
    };

    const applyCam = () => {
      if (!desktopFX() || rm) return;
      const focus = selected || "wide";
      const bases = {
        wide: { x: 0, y: 0, s: 1 },
        atlas: { x: 0, y: 18, s: 1.38 },
        nova: { x: 22, y: 2, s: 1.4 },
        vanta: { x: -22, y: 2, s: 1.4 },
        forge: { x: 14, y: -16, s: 1.42 },
        finn: { x: -14, y: -18, s: 1.42 },
      };
      const b = bases[focus] || bases.wide;
      const rx = py * (selected ? 0.35 : 1.1);
      const ry = px * (selected ? 0.5 : 2);
      section.style.setProperty(
        "--whq-cam",
        `translate3d(calc(${b.x}% + ${px * 5}px), calc(${b.y}% + ${py * 4}px), 0) rotateX(${rx}deg) rotateY(${ry}deg) scale(${b.s})`
      );
    };

    const tickParallax = () => {
      parallaxRaf = 0;
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      applyCam();
      if (Math.abs(tx - px) > 0.01 || Math.abs(ty - py) > 0.01) {
        parallaxRaf = requestAnimationFrame(tickParallax);
      }
    };

    const typeLine = (el, text, done) => {
      if (!el) {
        done?.();
        return;
      }
      clearTimeout(typeTimer);
      el.textContent = "";
      if (rm) {
        el.textContent = text;
        done?.();
        return;
      }
      let i = 0;
      const step = () => {
        i += 1;
        el.textContent = text.slice(0, i);
        if (i < text.length) typeTimer = setTimeout(step, 16);
        else done?.();
      };
      step();
    };

    const closeAgent = () => {
      selected = null;
      section.dataset.cam = "wide";
      space?.classList.remove("is-dimmed");
      zones.forEach((z) => z.classList.remove("is-focused"));
      panel?.classList.remove("is-open");
      section.querySelectorAll(".whq-a11y button").forEach((b) => b.classList.remove("is-active"));
      clearTimeout(typeTimer);
      applyCam();
      if (alive && !rm) scheduleActivity();
    };

    const openAgent = (key) => {
      const data = whqAgents[key];
      if (!data) return;
      selected = key;
      clearActivity();
      zones.forEach((z) => {
        const on = z.dataset.agent === key;
        z.classList.toggle("is-focused", on);
        z.classList.toggle("is-mobile-active", on);
        if (on) z.classList.add("is-awake");
      });
      space?.classList.add("is-dimmed");
      section.dataset.cam = key;
      applyCam();
      mobileNav?.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.agent === key));
      section.querySelectorAll(".whq-a11y button").forEach((b) => b.classList.toggle("is-active", b.dataset.agent === key));

      if (!panel) return;
      panel.classList.add("is-open");
      const idEl = document.getElementById("whqPanelId");
      const nameEl = document.getElementById("whqPanelName");
      const helloEl = document.getElementById("whqPanelHello");
      const roleEl = document.getElementById("whqPanelRole");
      const bodyEl = document.getElementById("whqPanelBody");
      const capsEl = document.getElementById("whqPanelCaps");
      if (idEl) idEl.textContent = data.id;
      if (nameEl) nameEl.textContent = data.name;
      if (roleEl) roleEl.textContent = data.role;
      if (bodyEl) bodyEl.textContent = data.body;
      if (capsEl) capsEl.innerHTML = data.caps.map((c) => `<span>${c}</span>`).join("");
      typeLine(helloEl, data.hello, () => {
        setTimeout(() => {
          if (helloEl && selected === key) helloEl.textContent = `${data.hello} ${data.line}`;
        }, rm ? 0 : 220);
      });
    };

    const setPhase = (phase) => {
      section.dataset.whqPhase = String(phase);
      if (phase >= 1) {
        document.getElementById("whqCore")?.classList.add("is-on");
      }
      if (phase >= 2) wake("atlas");
      if (phase >= 3) wake("nova");
      if (phase >= 4) {
        wake("forge");
        setWorking("forge", true);
      }
      if (phase >= 5) wake("vanta");
      if (phase >= 6) wake("finn");
      if (phase >= 7) {
        section.classList.add("is-linked", "is-live");
        alive = true;
        if (!selected && !rm) scheduleActivity();
      }
      if (phase >= 8) section.classList.add("is-climax");
    };

    // Default mobile focus
    section.querySelector('.whq-zone[data-agent="atlas"]')?.classList.add("is-mobile-active");

    zones.forEach((zone) => {
      zone.addEventListener("mouseenter", () => zone.classList.add("is-hot"));
      zone.addEventListener("mouseleave", () => zone.classList.remove("is-hot"));
      zone.addEventListener("click", () => {
        const key = zone.dataset.agent;
        if (selected === key) closeAgent();
        else openAgent(key);
      });
    });

    document.getElementById("whqBack")?.addEventListener("click", closeAgent);

    section.querySelectorAll(".whq-a11y button").forEach((btn) => {
      btn.addEventListener("click", () => openAgent(btn.dataset.agent));
    });

    mobileNav?.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => openAgent(btn.dataset.agent));
    });

    if (viewport && desktopFX()) {
      const onMove = (e) => {
        if (rm) return;
        const r = viewport.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        if (!parallaxRaf) parallaxRaf = requestAnimationFrame(tickParallax);
      };
      const onLeave = () => {
        tx = 0;
        ty = 0;
        if (!parallaxRaf) parallaxRaf = requestAnimationFrame(tickParallax);
      };
      viewport.addEventListener("pointermove", onMove);
      viewport.addEventListener("pointerleave", onLeave);
      addClean(() => {
        viewport.removeEventListener("pointermove", onMove);
        viewport.removeEventListener("pointerleave", onLeave);
      });
    }

    if (ST && !rm) {
      order.forEach((_, i) => {
        const st = ST.create({
          trigger: section,
          start: `top+=${i * 70} 65%`,
          onEnter: () => setPhase(i + 2),
        });
        sts.push(st);
      });
      const coreSt = ST.create({
        trigger: section,
        start: "top 70%",
        onEnter: () => setPhase(1),
      });
      sts.push(coreSt);
      const linkSt = ST.create({
        trigger: section,
        start: "center 55%",
        onEnter: () => setPhase(7),
      });
      sts.push(linkSt);
      const climaxSt = ST.create({
        trigger: "#whqClimax",
        start: "top 80%",
        onEnter: () => setPhase(8),
      });
      sts.push(climaxSt);
    } else {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setPhase(8);
          order.forEach(wake);
          section.classList.add("is-linked", "is-live", "is-climax");
          if (!rm) {
            alive = true;
            scheduleActivity();
          }
          io.disconnect();
        },
        { threshold: 0.15 }
      );
      io.observe(section);
      addClean(() => io.disconnect());
    }

    const vis = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          alive = false;
          clearActivity();
        } else if (section.classList.contains("is-live") && !selected && !rm) {
          alive = true;
          scheduleActivity();
        }
      },
      { threshold: 0.12 }
    );
    vis.observe(section);
    addClean(() => {
      vis.disconnect();
      clearActivity();
      clearTimeout(typeTimer);
      if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
    });
  };

  /* =========================================================
     Motion system (Lenis desktop-only + GSAP)
     ========================================================= */
  let lenis = null;
  const scrollTriggers = [];

  const initMotion = () => {
    initHeroNetwork();

    // Touch / mobile: native scroll only
    const useLenis = canDesktopFX() && typeof Lenis !== "undefined";

    if (useLenis) {
      lenis = new Lenis({
        duration: 0.95,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        syncTouch: false,
      });
      document.documentElement.classList.add("lenis", "lenis-smooth");

      if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      } else {
        const stop = addRaf((time) => lenis.raf(time));
        onCleanup(stop);
      }

      lenis.on("scroll", ({ scroll, limit }) => updateChrome(scroll, limit));
      onCleanup(() => {
        lenis?.destroy();
        lenis = null;
      });
    } else {
      // Native scroll — single passive listener
      const onScroll = () => {
        const scroll = window.scrollY || document.documentElement.scrollTop;
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        updateChrome(scroll, limit);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onCleanup(() => window.removeEventListener("scroll", onScroll));
      onScroll();
      hero?.classList.add("is-booted");
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || reduceMotion) {
      document.querySelectorAll(".statement-word").forEach((w) => w.classList.add("is-aligned"));
      document.querySelectorAll(".pipeline-stage").forEach((s) => s.classList.add("is-active"));
      initAiOffice({
        reduceMotion,
        agents,
        onCleanup,
        quality,
        canDesktopFX,
      });
      initMeetOffice({
        reduceMotion,
        onCleanup,
        quality,
        canDesktopFX,
      });
      initWorkforceHQ({
        reduceMotion,
        onCleanup,
        quality,
        canDesktopFX,
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Statement words via ScrollTrigger (centralized)
    gsap.utils.toArray(".statement-word").forEach((word, i) => {
      const st = ScrollTrigger.create({
        trigger: ".cinematic-intro",
        start: `top+=${i * 36} 75%`,
        onEnter: () => word.classList.add("is-aligned"),
        onLeaveBack: () => word.classList.remove("is-aligned"),
      });
      scrollTriggers.push(st);
    });

    // Engine scrub — desktop only
    if (canDesktopFX() && document.querySelector(".engine-section")) {
      const st = ScrollTrigger.create({
        trigger: ".engine-section",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const idx = Math.min(services.length - 1, Math.floor(self.progress * services.length));
          setEngineService(idx);
          if (idx === 1) {
            const screens = ["Web", "Mobile", "Dashboard", "Product"];
            const screen = document.getElementById("deviceScreen");
            if (screen) screen.textContent = screens[Math.min(3, Math.floor((self.progress * 20) % 4))];
          }
          if (idx === 2) {
            const count = Math.min(5, Math.floor(((self.progress * services.length) % 1) * 6));
            document.querySelectorAll(".mini-agent").forEach((a, i) => a.classList.toggle("is-on", i < count));
          }
        },
      });
      scrollTriggers.push(st);
    }

    // Pipeline horizontal — desktop; vertical CSS on mobile
    const pipelineTrack = document.getElementById("pipelineTrack");
    const pipelineSignal = document.getElementById("pipelineSignal");
    const stages = gsap.utils.toArray(".pipeline-stage");
    if (pipelineTrack && canDesktopFX()) {
      const tween = gsap.to(pipelineTrack, {
        x: () => -(pipelineTrack.scrollWidth - window.innerWidth * 0.45),
        ease: "none",
        scrollTrigger: {
          trigger: ".pipeline-section",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => {
            if (pipelineSignal) {
              pipelineSignal.style.transform = `translate3d(${self.progress * 100}%, 0, 0)`;
            }
            const active = Math.min(stages.length - 1, Math.floor(self.progress * stages.length));
            stages.forEach((s, i) => s.classList.toggle("is-active", i === active));
          },
        },
      });
      scrollTriggers.push(tween.scrollTrigger);
    } else {
      stages.forEach((s) => s.classList.add("is-active"));
    }

    // AI Office
    initAiOffice({
      ScrollTrigger,
      canDesktopFX,
      reduceMotion,
      agents,
      onCleanup,
      scrollTriggers,
      quality,
    });

    // Meet Office (homepage About discovery)
    initMeetOffice({
      ScrollTrigger,
      canDesktopFX,
      reduceMotion,
      onCleanup,
      scrollTriggers,
      quality,
    });

    // AI Workforce HQ (workforce.html)
    initWorkforceHQ({
      ScrollTrigger,
      canDesktopFX,
      reduceMotion,
      onCleanup,
      scrollTriggers,
      quality,
    });

    const collabSt = ScrollTrigger.create({
      trigger: "#human-ai",
      start: "top 60%",
      onEnter: () => document.getElementById("collabSplit")?.classList.add("is-merged"),
      onLeaveBack: () => document.getElementById("collabSplit")?.classList.remove("is-merged"),
    });
    scrollTriggers.push(collabSt);

    const ctaSt = ScrollTrigger.create({
      trigger: "#cta",
      start: "top 75%",
      once: true,
      onEnter: () => {
        const el = document.getElementById("systemStatusText");
        if (!el) return;
        el.textContent = "READY";
        setTimeout(() => {
          el.textContent = "AWAITING INPUT";
        }, 1000);
      },
    });
    scrollTriggers.push(ctaSt);

    // Lazy reveal for generic .reveal
    document.querySelectorAll(".reveal").forEach((el) => {
      const io = new IntersectionObserver(
        ([entry], obs) => {
          if (!entry.isIntersecting) return;
          el.classList.add("is-visible");
          obs.unobserve(el);
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      io.observe(el);
      onCleanup(() => io.disconnect());
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMotion, { once: true });
  } else {
    initMotion();
  }

  /* =========================================================
     Contact / newsletter → algoartisans@gmail.com (FormSubmit)
     ========================================================= */
  const ENQUIRY_ENDPOINT = "https://formsubmit.co/ajax/algoartisans@gmail.com";

  const sendEnquiry = async (form) => {
    const data = new FormData(form);
    // Drop honeypot fields from payload noise
    data.delete("_gotcha");
    data.delete("_honey");
    const payload = Object.fromEntries(data.entries());
    const res = await fetch(ENQUIRY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Unable to send enquiry");
    }
    return res.json().catch(() => ({ ok: true }));
  };

  const contactForm = document.querySelector(".contactForm");
  const statusPanel = document.getElementById("projectStatus");
  if (contactForm) {
    const statusSteps = ["PROJECT INPUT", "ANALYZING REQUIREMENTS...", "BUILD STRATEGY", "READY FOR REVIEW"];
    const feedback = document.getElementById("formFeedback");
    const updateStatus = () => {
      if (!statusPanel) return;
      const fields = [...contactForm.querySelectorAll("input:not([type='hidden']):not(.sr-only), textarea, select")];
      const filled = fields.filter((f) => f.value && String(f.value).trim()).length;
      const step = Math.min(statusSteps.length - 1, Math.floor((filled / Math.max(1, fields.length)) * statusSteps.length));
      statusPanel.textContent = statusSteps[step];
    };
    contactForm.addEventListener("input", updateStatus);
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      // Honeypot — bots fill this
      const trap = contactForm.querySelector('[name="_gotcha"]');
      if (trap && trap.value) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const original = submitBtn?.textContent || "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      if (statusPanel) statusPanel.textContent = "TRANSMITTING…";
      if (feedback) {
        feedback.hidden = true;
        feedback.textContent = "";
        feedback.classList.remove("is-error", "is-success");
      }

      try {
        await sendEnquiry(contactForm);
        if (statusPanel) statusPanel.textContent = "ENQUIRY RECEIVED";
        if (feedback) {
          feedback.hidden = false;
          feedback.classList.add("is-success");
          feedback.textContent = "Thanks — your enquiry was sent to algoartisans@gmail.com. We'll reply soon.";
        }
        if (submitBtn) submitBtn.textContent = "Enquiry Sent";
        contactForm.reset();
        updateStatus();
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.textContent = original;
            submitBtn.disabled = false;
          }
        }, 2200);
      } catch (err) {
        if (statusPanel) statusPanel.textContent = "SEND FAILED";
        if (feedback) {
          feedback.hidden = false;
          feedback.classList.add("is-error");
          feedback.textContent =
            "Could not send automatically. Please email algoartisans@gmail.com directly, or try again.";
        }
        if (submitBtn) {
          submitBtn.textContent = original;
          submitBtn.disabled = false;
        }
      }
    });
  }

  const newsForm = document.querySelector(".newsletter-form");
  if (newsForm) {
    const newsFeedback = document.getElementById("newsFeedback");
    newsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!newsForm.checkValidity()) {
        newsForm.reportValidity();
        return;
      }
      const trap = newsForm.querySelector('[name="_gotcha"]');
      if (trap && trap.value) return;

      const btn = newsForm.querySelector('button[type="submit"]');
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = "Sending…";
      btn.disabled = true;
      if (newsFeedback) {
        newsFeedback.hidden = true;
        newsFeedback.classList.remove("is-error", "is-success");
      }

      try {
        await sendEnquiry(newsForm);
        btn.textContent = "Subscribed";
        if (newsFeedback) {
          newsFeedback.hidden = false;
          newsFeedback.classList.add("is-success");
          newsFeedback.textContent = "You're in — confirmation was sent to AlgoArtisans.";
        }
        newsForm.reset();
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 2000);
      } catch (err) {
        btn.textContent = original;
        btn.disabled = false;
        if (newsFeedback) {
          newsFeedback.hidden = false;
          newsFeedback.classList.add("is-error");
          newsFeedback.textContent = "Could not subscribe. Email algoartisans@gmail.com instead.";
        }
      }
    });
  }

  /* =========================================================
     Cleanup
     ========================================================= */
  window.addEventListener("pagehide", () => {
    scrollTriggers.forEach((st) => st?.kill?.());
    cleanups.forEach((fn) => {
      try {
        fn();
      } catch (_) {}
    });
    rafTasks.clear();
    if (rafId) cancelAnimationFrame(rafId);
  });
})();
