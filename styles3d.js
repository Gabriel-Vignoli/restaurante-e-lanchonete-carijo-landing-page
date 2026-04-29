// ════════════════════════════════════════════════════
//  CARIJÓ — 3D ANIMATIONS ENGINE
// ════════════════════════════════════════════════════

gsap.registerPlugin(ScrollTrigger);

// ─── UTILS ───────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ════════════════════════════════════════════════════
//  1. THREE.JS — HERO PARTICLE UNIVERSE
// ════════════════════════════════════════════════════
(function initHeroParticles() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("hero-canvas"),
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const PARTICLE_COUNT = 2200;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const palette = [
    new THREE.Color("#02AFF4"),
    new THREE.Color("#01d4ff"),
    new THREE.Color("#FEED01"),
    new THREE.Color("#0a7fa8"),
    new THREE.Color("#ffffff"),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r =
      Math.random() < 0.6
        ? THREE.MathUtils.randFloat(0.5, 4.5)
        : THREE.MathUtils.randFloat(4.5, 9);

    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI * 0.35;
    const arm = Math.floor(Math.random() * 3) * ((Math.PI * 2) / 3);
    const spin = r * 0.5;

    positions[i * 3] =
      r * Math.cos(theta + arm + spin) + THREE.MathUtils.randFloatSpread(0.6);
    positions[i * 3 + 1] =
      r * Math.sin(phi) + THREE.MathUtils.randFloatSpread(0.4);
    positions[i * 3 + 2] =
      r * Math.sin(theta + arm + spin) + THREE.MathUtils.randFloatSpread(0.6);

    const col = palette[Math.floor(Math.random() * palette.length)];
    const finalCol = Math.random() < 0.08 ? palette[2] : col;
    colors[i * 3] = finalCol.r;
    colors[i * 3 + 1] = finalCol.g;
    colors[i * 3 + 2] = finalCol.b;

    sizes[i] =
      Math.random() < 0.05
        ? THREE.MathUtils.randFloat(3, 6)
        : THREE.MathUtils.randFloat(0.5, 2.2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        vec3 pos = position;
        pos.y += sin(uTime * 0.3 + position.x * 0.5) * 0.04;
        pos.x += cos(uTime * 0.2 + position.z * 0.4) * 0.03;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * uPixelRatio * (300.0 / -mvPos.z);
        gl_Position  = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.2, 0.5, d);
        gl_FragColor = vec4(vColor, alpha * 0.85);
      }
    `,
    transparent: true,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const orbGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const orbMat = new THREE.MeshBasicMaterial({
    color: "#02AFF4",
    transparent: true,
    opacity: 0.6,
  });
  const orbs = [];
  for (let i = 0; i < 8; i++) {
    const orb = new THREE.Mesh(orbGeo, orbMat.clone());
    orb.position.set(
      THREE.MathUtils.randFloatSpread(6),
      THREE.MathUtils.randFloatSpread(3),
      THREE.MathUtils.randFloat(-2, 1),
    );
    orb.userData = {
      baseY: orb.position.y,
      speed: 0.5 + Math.random() * 0.8,
      amp: 0.1 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
    };
    scene.add(orb);
    orbs.push(orb);
  }

  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollProgress = 0;
  window.addEventListener("scroll", () => {
    const hero = document.getElementById("hero");
    scrollProgress = clamp(window.scrollY / (hero.offsetHeight * 0.8), 0, 1);
    renderer.domElement.style.opacity = 1 - scrollProgress;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  });

  let clock = new THREE.Clock();

  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    material.uniforms.uTime.value = t;
    particles.rotation.y = t * 0.04;
    particles.rotation.x = Math.sin(t * 0.05) * 0.06;

    targetX = lerp(targetX, mouseX * 0.25, 0.04);
    targetY = lerp(targetY, mouseY * 0.15, 0.04);
    camera.position.x = targetX;
    camera.position.y = -targetY;
    camera.lookAt(0, 0, 0);

    orbs.forEach((orb) => {
      orb.position.y =
        orb.userData.baseY +
        Math.sin(t * orb.userData.speed + orb.userData.phase) * orb.userData.amp;
      orb.material.opacity =
        0.3 + Math.sin(t * orb.userData.speed * 1.5 + orb.userData.phase) * 0.3;
    });

    renderer.render(scene, camera);
  })();
})();

// ════════════════════════════════════════════════════
//  2. CSS 3D TILT — Cards interativos
// ════════════════════════════════════════════════════
function addTilt(selector, opts = {}) {
  const {
    maxTilt = 15,
    scale = 1.04,
    speed = 0.15,
    glare = true,
    glareMax = 0.35,
  } = opts;

  document.querySelectorAll(selector).forEach((card) => {
    card.style.transformStyle = "preserve-3d";
    card.style.willChange = "transform";

    let glareEl = null;
    if (glare) {
      glareEl = document.createElement("div");
      Object.assign(glareEl.style, {
        position: "absolute",
        inset: "0",
        borderRadius: "inherit",
        pointerEvents: "none",
        zIndex: "10",
        opacity: "0",
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9), rgba(255,255,255,0) 60%)",
        mixBlendMode: "overlay",
        transition: "opacity 0.4s ease",
      });
      card.style.position = "relative";
      card.style.overflow = "hidden";
      card.appendChild(glareEl);
    }

    let tx = 0, ty = 0, ts = 1;
    let raf;

    function updateTransform() {
      card.style.transform = `perspective(900px) rotateX(${ty}deg) rotateY(${tx}deg) scale3d(${ts},${ts},${ts})`;
    }

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      const targetX = cx * maxTilt;
      const targetY = -cy * maxTilt;

      cancelAnimationFrame(raf);
      (function loop() {
        tx = lerp(tx, targetX, speed);
        ty = lerp(ty, targetY, speed);
        ts = lerp(ts, scale, speed);
        updateTransform();

        if (glareEl) {
          const gx = (cx + 0.5) * 100;
          const gy = (cy + 0.5) * 100;
          glareEl.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 60%)`;
          glareEl.style.opacity = (Math.abs(cx) + Math.abs(cy)) * glareMax;
        }

        if (Math.abs(tx - targetX) > 0.01 || Math.abs(ty - targetY) > 0.01) {
          raf = requestAnimationFrame(loop);
        }
      })();
    });

    card.addEventListener("mouseleave", () => {
      cancelAnimationFrame(raf);
      (function loop() {
        tx = lerp(tx, 0, speed);
        ty = lerp(ty, 0, speed);
        ts = lerp(ts, 1, speed);
        updateTransform();
        if (glareEl)
          glareEl.style.opacity = lerp(
            parseFloat(glareEl.style.opacity || 0),
            0,
            speed,
          );

        if (Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01 || Math.abs(ts - 1) > 0.001) {
          raf = requestAnimationFrame(loop);
        } else {
          card.style.transform = "";
        }
      })();
    });
  });
}

// ── Tilt aplicado — .produto-card-h (novo) ──
addTilt(".produto-card-h", { maxTilt: 12, scale: 1.05, glareMax: 0.3 });
addTilt(".esfirra-card",   { maxTilt: 10, scale: 1.04, glareMax: 0.25 });
addTilt(".review-card",    { maxTilt: 8,  scale: 1.03, glareMax: 0.2 });
addTilt(".stat-card",      { maxTilt: 14, scale: 1.06, glareMax: 0.35 });
addTilt(".visual-main",    { maxTilt: 18, scale: 1.03, glareMax: 0.4 });

// ════════════════════════════════════════════════════
//  4. MAGNETIC BUTTONS
// ════════════════════════════════════════════════════
function magneticEffect(selector) {
  document.querySelectorAll(selector).forEach((btn) => {
    let bx = 0, by = 0, raf;

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;

      cancelAnimationFrame(raf);
      (function loop() {
        bx = lerp(bx, cx * 0.35, 0.12);
        by = lerp(by, cy * 0.35, 0.12);
        btn.style.transform = `translate3d(${bx}px, ${by}px, 0) scale(1.05)`;
        btn.style.boxShadow = `${-bx * 0.3}px ${-by * 0.3}px 30px rgba(2,175,244,0.4)`;
        if (Math.abs(bx - cx * 0.35) > 0.3) raf = requestAnimationFrame(loop);
      })();
    });

    btn.addEventListener("mouseleave", () => {
      cancelAnimationFrame(raf);
      (function loop() {
        bx = lerp(bx, 0, 0.1);
        by = lerp(by, 0, 0.1);
        btn.style.transform = `translate3d(${bx}px, ${by}px, 0) scale(1)`;
        btn.style.boxShadow = "";
        if (Math.abs(bx) > 0.1 || Math.abs(by) > 0.1)
          raf = requestAnimationFrame(loop);
        else {
          btn.style.transform = "";
          btn.style.boxShadow = "";
        }
      })();
    });
  });
}

magneticEffect(".btn-primary, .btn-outline");

// ════════════════════════════════════════════════════
//  5. LIQUID MORPHING BLOB
// ════════════════════════════════════════════════════
(function initBlob() {
  const svg = document.getElementById("blob-svg");
  if (!svg) return;

  const path = svg.querySelector("path");
  let t = 0;

  function blobPoint(angle, time, r1, r2, freq) {
    const r = r1 + r2 * Math.sin(freq * angle + time);
    return [r * Math.cos(angle), r * Math.sin(angle)];
  }

  function buildPath(time) {
    const N = 64;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      pts.push(blobPoint(a, time, 120, 28, 4));
    }
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < N; i++) {
      const curr = pts[i];
      const next = pts[(i + 1) % N];
      const mx = (curr[0] + next[0]) / 2;
      const my = (curr[1] + next[1]) / 2;
      d += ` Q ${curr[0]},${curr[1]} ${mx},${my}`;
    }
    d += " Z";
    return d;
  }

  (function loop() {
    t += 0.008;
    path.setAttribute("d", buildPath(t));
    requestAnimationFrame(loop);
  })();
})();

// ════════════════════════════════════════════════════
//  6. SCROLL 3D DEPTH
// ════════════════════════════════════════════════════
(function init3DScrollDepth() {
  // Stat cards
  gsap.utils.toArray(".stat-card").forEach((card, i) => {
    gsap.fromTo(
      card,
      { rotateX: 25, opacity: 0, y: 60 },
      {
        rotateX: 0, opacity: 1, y: 0,
        duration: 0.9, delay: i * 0.1, ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      },
    );
    card.style.transformStyle = "preserve-3d";
  });

  // ── .produto-card REMOVIDO — seção usa scroll horizontal agora ──

  // Review cards
  gsap.utils.toArray(".review-card").forEach((card, i) => {
    gsap.fromTo(
      card,
      { rotateX: 30, opacity: 0, y: -40, scale: 0.95 },
      {
        rotateX: 0, opacity: 1, y: 0, scale: 1,
        duration: 0.75, delay: (i % 3) * 0.1, ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      },
    );
  });

  // Esfirra cards
  gsap.utils.toArray(".esfirra-card").forEach((card, i) => {
    gsap.fromTo(
      card,
      { rotateY: 20, opacity: 0, x: 40 },
      {
        rotateY: 0, opacity: 1, x: 0,
        duration: 0.75, delay: (i % 3) * 0.1, ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      },
    );
  });
})();

// ════════════════════════════════════════════════════
//  7. HERO TITLE — 3D letter split
// ════════════════════════════════════════════════════
(function heroLetterSplit() {
  const title = document.querySelector(".hero-title");
  if (!title) return;

  const textNode = title.childNodes[0];
  if (!textNode || textNode.nodeType !== 3) return;

  const text = textNode.textContent.trim();
  const span = document.createElement("span");
  span.innerHTML = text
    .split("")
    .map(
      (ch, i) =>
        `<span class="hero-letter" style="display:inline-block;opacity:0;transform:perspective(400px) rotateY(90deg) translateY(-20px);transition:transform 0.6s cubic-bezier(.23,1,.32,1),opacity 0.5s ease;transition-delay:${0.4 + i * 0.06}s">${ch}</span>`,
    )
    .join("");
  textNode.replaceWith(span);

  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      document.querySelectorAll(".hero-letter").forEach((l) => {
        l.style.opacity = "1";
        l.style.transform = "perspective(400px) rotateY(0deg) translateY(0px)";
      });
    }),
  );
})();

// ════════════════════════════════════════════════════
//  8. CURSOR GLOW
// ════════════════════════════════════════════════════
(function initCursorGlow() {
  if ("ontouchstart" in window) return;

  // ── Cursor principal ──
  const cursor = document.createElement("div");
  Object.assign(cursor.style, {
    position: "fixed",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "rgba(2,175,244,0.9)",
    pointerEvents: "none",
    zIndex: "9999",
    transform: "translate(-50%, -50%)",
    transition: "width 0.2s, height 0.2s, background 0.2s",
    mixBlendMode: "screen",
  });

  document.body.appendChild(cursor);

  // ── Trail (rastro) ──
  const TRAIL_LENGTH = 18;
  const trail = [];

  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const progress = i / TRAIL_LENGTH;
    const size = 10 * (1 - progress);
    const dot = document.createElement("div");
    Object.assign(dot.style, {
      position: "fixed",
      width:  size + "px",
      height: size + "px",
      borderRadius: "50%",
      background: `rgba(2,175,244,${0.5 * (1 - progress)})`,
      pointerEvents: "none",
      zIndex: "9997",
      transform: "translate(-50%, -50%)",
      mixBlendMode: "screen",
    });
    document.body.appendChild(dot);
    trail.push({ el: dot, x: 0, y: 0 });
  }

  let mx = 0, my = 0;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + "px";
    cursor.style.top  = my + "px";
  });

  (function loop() {
    trail[0].x = lerp(trail[0].x, mx, 0.25);
    trail[0].y = lerp(trail[0].y, my, 0.25);

    for (let i = 1; i < TRAIL_LENGTH; i++) {
      const factor = Math.max(0.22 - i * 0.008, 0.04);
      trail[i].x = lerp(trail[i].x, trail[i - 1].x, factor);
      trail[i].y = lerp(trail[i].y, trail[i - 1].y, factor);
      trail[i].el.style.left = trail[i].x + "px";
      trail[i].el.style.top  = trail[i].y + "px";
    }

    trail[0].el.style.left = trail[0].x + "px";
    trail[0].el.style.top  = trail[0].y + "px";

    requestAnimationFrame(loop);
  })();

  // ── Hover em elementos interativos ──
  const hoverables =
    "a, button, .produto-card-h, .esfirra-card, .stat-card, .review-card, .btn-primary, .btn-outline";

  document.querySelectorAll(hoverables).forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.width  = "28px";
      cursor.style.height = "28px";
      cursor.style.background = "rgba(254,237,1,0.85)";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.width  = "12px";
      cursor.style.height = "12px";
      cursor.style.background = "rgba(2,175,244,0.9)";
    });
  });
})();

// ════════════════════════════════════════════════════
//  9. NAVBAR + HERO ENTRANCE + REVEALS + PARALLAX
// ════════════════════════════════════════════════════

// ─── NAVBAR ───
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 60);
});

// ─── HAMBURGER ───
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  mobileMenu.classList.toggle("open");
});
document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    mobileMenu.classList.remove("open");
  });
});

// ─── HERO ENTRANCE ───
const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
heroTl
  .to(".hero-badge",    { opacity: 1, y: 0, duration: 0.8, delay: 0.8 })
  .to(".hero-title",    { opacity: 1, y: 0, duration: 1 },   "-=0.4")
  .to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
  .to(".hero-desc",     { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
  .to(".hero-ctas",     { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");

// ─── PARALLAX HERO ───
gsap.to(".hero-circles", {
  y: -60,
  ease: "none",
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
  },
});

// ─── SECTION REVEALS ───
// ── skip list atualizado para .produto-card-h ──
function createScrollReveal(selector) {
  gsap.utils.toArray(selector).forEach((el, i) => {
    const skip = el.closest(
      ".produto-card-h, .esfirra-card, .review-card, .stat-card",
    );
    if (skip) return;
    gsap.to(el, {
      opacity: 1, y: 0, x: 0, scale: 1,
      duration: 0.8,
      delay: (i % 3) * 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });
}

createScrollReveal(".reveal");
createScrollReveal(".reveal-left");
createScrollReveal(".reveal-right");
createScrollReveal(".reveal-scale");

// ─── ESFIRRAS BG PARALLAX ───
gsap.to(".esfirras-bg-card", {
  y: -30,
  ease: "none",
  scrollTrigger: {
    trigger: "#esfirras",
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
  },
});

// ─── DIAS CHIP ANIMATION ───
ScrollTrigger.create({
  trigger: ".esfirras-dias",
  start: "top 85%",
  once: true,
  onEnter: () => {
    gsap.fromTo(
      ".dia-chip",
      { opacity: 0, y: 20, rotateX: 45 },
      { opacity: 1, y: 0, rotateX: 0, stagger: 0.08, duration: 0.5, ease: "back.out(1.5)" },
    );
  },
});

// ─── CONTATO SECTION ───
ScrollTrigger.create({
  trigger: "#contato",
  start: "top 70%",
  once: true,
  onEnter: () => {
    gsap.fromTo(
      "#contato .btn-primary, #contato .btn-outline",
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.15, duration: 0.6, ease: "back.out(1.5)" },
    );
  },
});

// ════════════════════════════════════════════════════
//  10. PRODUTOS — Scroll Horizontal
// ════════════════════════════════════════════════════
(function initProdutosHScroll() {
    const section = document.getElementById("produtos");
    if (!section) return;

    // ── MOBILE ──────────────────────────────────────────
    if (window.innerWidth <= 768) {
        section.style.height = "auto";

        window.addEventListener("load", () => {
            ScrollTrigger.refresh();

            gsap.fromTo(
                ".produtos-grid-mobile .section-label, .produtos-grid-mobile .section-title, .produtos-grid-mobile p",
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".produtos-grid-mobile",
                        start: "top 90%",
                        toggleActions: "play none none none",
                    }
                }
            );

            gsap.utils.toArray(".produtos-grid-mobile .produto-card-h").forEach((card, i) => {
                gsap.fromTo(card,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.7,
                        delay: (i % 2) * 0.1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "top 92%",
                            toggleActions: "play none none none",
                        }
                    }
                );
            });
        });

        return;
    }

    // ── DESKTOP ─────────────────────────────────────────
    const track = document.getElementById("produtos-track");
    const dots  = document.querySelectorAll("#produtos-dots .dot");
    const hint  = document.getElementById("scroll-hint");
    if (!track) return;

    const totalCards = track.querySelectorAll(".produto-card-h").length;

    function getScrollDistance() {
        const viewportW = section.querySelector(".produtos-pin-wrapper").offsetWidth;
        return Math.max(0, track.scrollWidth - viewportW);
    }

    gsap.to(track, {
        x: () => -(getScrollDistance()),
        ease: "none",
        scrollTrigger: {
            id:      "produtos-hscroll",
            trigger:  section,
            start:   "top top",
            end:     () => `+=${(section.offsetHeight - window.innerHeight) * 0.65}`,
            scrub:    0.4,
            invalidateOnRefresh: true,
            onUpdate(self) {
                const idx = Math.round(self.progress * (totalCards - 1));
                dots.forEach((d, i) => d.classList.toggle("active", i === idx));
                if (hint) hint.style.opacity = self.progress > 0.12 ? "0" : "1";
            },
        },
    });

    gsap.from("#produtos-header", {
        y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2,
        clearProps: "opacity,transform"
    });

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            const progress   = i / (totalCards - 1);
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            const travel     = section.offsetHeight - window.innerHeight;
            window.scrollTo({ top: sectionTop + travel * progress, behavior: "smooth" });
        });
    });

    window.addEventListener("resize", () => {
        ScrollTrigger.getById("produtos-hscroll")?.refresh();
    });
})();