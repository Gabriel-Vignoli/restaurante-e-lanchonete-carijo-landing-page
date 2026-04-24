gsap.registerPlugin(ScrollTrigger);

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
  .to(".hero-badge", { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
  .to(".hero-title", { opacity: 1, y: 0, duration: 1 }, "-=0.4")
  .to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
  .to(".hero-desc", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
  .to(".hero-ctas", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");

// ─── HERO CIRCLES FLOAT ───
gsap.to(".hero-circle:nth-child(1)", {
  rotation: 360,
  duration: 60,
  repeat: -1,
  ease: "none",
});
gsap.to(".hero-circle:nth-child(2)", {
  rotation: -360,
  duration: 40,
  repeat: -1,
  ease: "none",
});

// ─── FLOATING EMOJIS ───
gsap.utils.toArray(".float-el").forEach((el, i) => {
  gsap.fromTo(
    el,
    { y: 0, rotation: 0 },
    {
      y: -25,
      rotation: 8,
      duration: 3 + i * 0.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.7,
    },
  );
});

// ─── SCROLL REVEALS ───
function createScrollReveal(selector, vars) {
  gsap.utils.toArray(selector).forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration: 0.8,
      delay: (i % 3) * 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      ...vars,
    });
  });
}

createScrollReveal(".reveal", {});
createScrollReveal(".reveal-left", {});
createScrollReveal(".reveal-right", {});
createScrollReveal(".reveal-scale", {});

// ─── STAT CARDS COUNTER ───
const statNums = ["+20", "100%", "Seg", "11h"];
document.querySelectorAll(".stat-card").forEach((card, i) => {
  ScrollTrigger.create({
    trigger: card,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "back.out(1.5)",
        },
      );
    },
  });
});

// ─── PRODUTO CARDS HOVER ───
document.querySelectorAll(".produto-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    gsap.to(card.querySelector(".produto-icon"), {
      rotation: 15,
      scale: 1.15,
      duration: 0.3,
      ease: "back.out(2)",
    });
  });
  card.addEventListener("mouseleave", () => {
    gsap.to(card.querySelector(".produto-icon"), {
      rotation: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  });
});

// ─── ESFIRRA CARDS ───
document.querySelectorAll(".esfirra-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    gsap.to(card.querySelector(".esfirra-emoji"), {
      y: -5,
      scale: 1.2,
      duration: 0.3,
      ease: "back.out(2)",
    });
  });
  card.addEventListener("mouseleave", () => {
    gsap.to(card.querySelector(".esfirra-emoji"), {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  });
});

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

// ─── SECTION BACKGROUND PARALLAX ───
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
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "back.out(1.5)" },
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
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.15,
        duration: 0.6,
        ease: "back.out(1.5)",
      },
    );
  },
});
