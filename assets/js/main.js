/* main.js — ATZ Collections interaction layer */

// ─── NAV SCROLL STATE ──────────────────────────────────────
const navWrapper = document.querySelector(".nav-wrapper");

function handleNavScroll() {
  if (window.scrollY > 40) {
    navWrapper?.classList.add("scrolled");
  } else {
    navWrapper?.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", handleNavScroll, { passive: true });
handleNavScroll();

// ─── HAMBURGER MENU ────────────────────────────────────────
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

hamburgerBtn?.addEventListener("click", () => {
  hamburgerBtn.classList.toggle("open");
  mobileMenu?.classList.toggle("open");
});

// ─── DROPDOWN MENU LOGIC ────────────────────────────────────────
const dropdowns = document.querySelectorAll(".nav-link-item");

dropdowns.forEach((dropdown) => {
  const trigger = dropdown.querySelector(".dropdown-trigger");
  if (!trigger) return;
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents the window click listener from firing immediately

    const isOpen = dropdown.classList.contains("open");

    // Close all other dropdowns first
    dropdowns.forEach((other) => other.classList.remove("open"));

    // If it wasn't open, open it now (Toggle logic)
    if (!isOpen) {
      dropdown.classList.add("open");
    }
  });
});

// Close the menu if the user clicks anywhere else on the screen
window.addEventListener("click", () => {
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("open");
  });
});

// ─── FADE SECTION OBSERVER ─────────────────────────────────
const fadeSections = document.querySelectorAll(".fade-section");

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      }
    });
  },
  { threshold: 0.12 },
);

fadeSections.forEach((el) => fadeObserver.observe(el));

const storySection = document.getElementById("storySection");
const textEl = storySection.querySelector(".story-text-wrap p");

// 👉 Split into words
const words = textEl.innerText.split(" ");
textEl.innerHTML = words
  .map((word) => `<span class="word">${word}</span>`)
  .join(" ");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        storySection.classList.add("active");
      } else {
        storySection.classList.remove("active");
      }
    });
  },
  {
    threshold: 0.4, // 👈 adjust when it triggers
  },
);
const wordSpans = document.querySelectorAll(".word");

window.addEventListener("scroll", () => {
  const rect = storySection.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // progress from 0 → 1
  const progress = Math.min(
    Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0),
    1,
  );

  const totalWords = wordSpans.length;
  const visibleWords = Math.floor(progress * totalWords);

  wordSpans.forEach((word, index) => {
    if (index < visibleWords) {
      word.style.color = "#ffffff";
    } else {
      word.style.color = "#444451";
    }
  });
});

observer.observe(storySection);

// ─── LODGES SLIDER ─────────────────────────────────────────
(function () {
  const track = document.getElementById("lodgesTrack");
  const nextWrap = document.getElementById("lodgesNextWrap");
  const prevWrap = document.getElementById("lodgesPrevWrap");
  const nextBtn = document.getElementById("lodgesNextBtn");
  const prevBtn = document.getElementById("lodgesPrevBtn");
  const counterEl = document.getElementById("counterCurrent");

  if (!track) return;

  const TOTAL = track.querySelectorAll(".lodge-card").length;
  let current = 0;

  // 👉 Dynamic STEP (fix skip issue)
  function getStep() {
    return visibleCount() === 1 ? 1 : 2;
  }

  function getCardWidth() {
    const card = track.querySelector(".lodge-card");
    if (!card) return 0;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap) || parseFloat(style.gap) || 0;
    return card.offsetWidth + gap;
  }

  function visibleCount() {
    const wrapW = track.parentElement.offsetWidth;
    const cw = getCardWidth();
    if (!cw) return 1;
    return Math.max(1, Math.floor(wrapW / cw)); // FIXED
  }

  function maxIndex() {
    return Math.max(0, TOTAL - visibleCount());
  }

  function updateArrows() {
    prevWrap.classList.toggle("hidden", current <= 0);
    nextWrap.classList.toggle("hidden", current >= maxIndex());
  }

  function updateCounter() {
    if (!counterEl) return;
    const display = Math.min(current + visibleCount(), TOTAL);
    counterEl.textContent = String(display).padStart(2, "0");
  }

 function goTo(index) {
  const cw = getCardWidth();
  const wrapW = track.parentElement.offsetWidth;
  const totalWidth = TOTAL * cw;

  current = Math.min(Math.max(0, index), maxIndex());

  let offset = current * cw;

  // 🔥 Prevent extra empty space at end
  const maxOffset = totalWidth - wrapW;
  offset = Math.min(offset, maxOffset);

  prevTranslate = -offset;
  currentTranslate = -offset;

  track.style.transition = "transform 0.4s ease";
  track.style.transform = `translateX(-${offset}px)`;

  updateArrows();
  updateCounter();
}

  // 👉 BUTTON EVENTS
  nextBtn?.addEventListener("click", () => goTo(current + getStep()));
  prevBtn?.addEventListener("click", () => goTo(current - getStep()));

  // ─── DRAG / TOUCH SUPPORT ─────────────────────
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationFrame;

  function getPositionX(e) {
    return e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
  }

  function dragStart(e) {
    isDragging = true;
    startX = getPositionX(e);
    track.style.transition = "none";
    animationFrame = requestAnimationFrame(animation);
  }

  function dragMove(e) {
    if (!isDragging) return;
    const currentPosition = getPositionX(e);
    currentTranslate = prevTranslate + (currentPosition - startX);
  }

  function dragEnd() {
    cancelAnimationFrame(animationFrame);
    isDragging = false;

    const movedBy = currentTranslate - prevTranslate;

    if (movedBy < -50) {
      goTo(current + 1);
    } else if (movedBy > 50) {
      goTo(current - 1);
    } else {
      goTo(current);
    }
  }

  function animation() {
    track.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animation);
  }

  // 👉 MOUSE EVENTS
  track.addEventListener("mousedown", dragStart);
  track.addEventListener("mousemove", dragMove);
  track.addEventListener("mouseup", dragEnd);
  track.addEventListener("mouseleave", dragEnd);

  // 👉 TOUCH EVENTS
  track.addEventListener("touchstart", dragStart, { passive: true });
  track.addEventListener("touchmove", dragMove, { passive: true });
  track.addEventListener("touchend", dragEnd);

  // 👉 RESIZE FIX
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(current), 100);
  });

  // INIT
  goTo(0);
})();

/* ────────────────────────────────────────────────
   JOURNEYS SWIPER (mobile / tablet only)
──────────────────────────────────────────────── */
function initJourneysSwiper() {
  const swiperEl = document.getElementById("journeysSwiper");
  const prevBtn = document.getElementById("jrnPrev");
  const nextBtn = document.getElementById("jrnNext");
  const prevWrap = document.getElementById("jrnPrevWrap");
  const nextWrap = document.getElementById("jrnNextWrap");

  if (!swiperEl) return;

  const swiper = new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: false,

    breakpoints: {
      320: { slidesPerView: 1, spaceBetween: 16 },
      768: { slidesPerView: 1.2, spaceBetween: 20 },
    },

    on: {
      init() {
        this.emit("slideChange");
      },
    },
  });

  // Buttons
  prevBtn?.addEventListener("click", () => swiper.slidePrev());
  nextBtn?.addEventListener("click", () => swiper.slideNext());
  function handleResize() {
    if (window.innerWidth >= 1024) {
      swiper.disable();
      prevWrap?.classList.add("hidden");
      nextWrap?.classList.add("hidden");
    } else {
      swiper.enable();
      swiper.update();
      swiper.emit("slideChange");
    }
  }

  window.addEventListener("resize", handleResize);
  handleResize();
}
initJourneysSwiper();
/* ────────────────────────────────────────────────
    TRAVEL TYPES SWIPER (Refactored Logic)
 ──────────────────────────────────────────────── */
let travelSwiper;

function initTravelSwiper() {
  const swiperEl = document.getElementById("travelSwiper");
  if (!swiperEl) return;

  // Destroy previous instance (important)
  if (travelSwiper) {
    travelSwiper.destroy(true, true);
  }

  const isMobile = window.innerWidth < 1152; 
  const prevWrap = document.getElementById("travelPrevWrap");
  const nextWrap = document.getElementById("travelNextWrap");
  const prevBtn = document.getElementById("travelPrev");
  const nextBtn = document.getElementById("travelNext");
  const counter = document.getElementById("travelCurrent");

  const padded = (n) => String(n).padStart(2, "0");

travelSwiper = new Swiper(swiperEl, {
  slidesPerView: 1.08,
  spaceBetween: 16,
  loop: isMobile,

  autoplay: isMobile
    ? {
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }
    : false,

  breakpoints: {
    320: { slidesPerView: 1.1, spaceBetween: 24 },
    768: { slidesPerView: 1.5, spaceBetween: 24 },
    1152: { slidesPerView: 2.08, spaceBetween: 32 },
    1920: { slidesPerView: 3.08, spaceBetween: 40 },
  },

  on: {
    init() {
      this.emit("slideChange");
    },

    slideChange() {
      if (counter) {
        counter.textContent = padded(this.realIndex + 1);
      }

      if (!this.params.loop) {
        prevWrap?.classList.toggle("hidden", this.isBeginning);
        nextWrap?.classList.toggle("hidden", this.isEnd);
      } else {
        prevWrap?.classList.remove("hidden");
        nextWrap?.classList.remove("hidden");
      }
    },
  },
});

 if (prevBtn) {
  prevBtn.onclick = () => travelSwiper.slidePrev();
}

if (nextBtn) {
  nextBtn.onclick = () => travelSwiper.slideNext();
}
}

// Init
initTravelSwiper();

// Re-init on resize
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initTravelSwiper, 200);
});

document.addEventListener("DOMContentLoaded", initTravelSwiper);

/* ────────────────────────────────────────────────
   STORIES SLIDER (Infinite Loop + Autoplay)
──────────────────────────────────────────────── */
(function () {
  const track = document.getElementById("storiesTrack");
  const prevWrap = document.getElementById("storiesPrevWrap");
  const nextWrap = document.getElementById("storiesNextWrap");
  const prevBtn = document.getElementById("storiesPrevBtn");
  const nextBtn = document.getElementById("storiesNextBtn");

  if (!track) return;

  let current = 0;
  let autoSlide;
  let isTransitioning = false;

  const BREAKPOINTS = {
    320: { slidesPerView: 1.3, spaceBetween: 24 },
    768: { slidesPerView: 1.5, spaceBetween: 24 },
    1152: { slidesPerView: 3, spaceBetween: 32 },
    1920: { slidesPerView: 3.08, spaceBetween: 40 },
  };

  function getSettings() {
    const width = window.innerWidth;
    let active = BREAKPOINTS[320];

    Object.keys(BREAKPOINTS).forEach((bp) => {
      if (width >= bp) active = BREAKPOINTS[bp];
    });

    return active;
  }

  function getSlidesPerView() {
    return Math.ceil(getSettings().slidesPerView);
  }

  function getCardWidth() {
    const card = track.querySelector(".stories-card");
    if (!card) return 0;

    const { spaceBetween } = getSettings();
    return card.offsetWidth + spaceBetween;
  }

  function applySpacing() {
    track.style.gap = `${getSettings().spaceBetween}px`;
  }

  function setupClones() {
    const slides = [...track.children];
    const visible = getSlidesPerView();

    // clone first N
    slides.slice(0, visible).forEach((el) => {
      const clone = el.cloneNode(true);
      clone.classList.add("clone");
      track.appendChild(clone);
    });

    // clone last N
    slides.slice(-visible).forEach((el) => {
      const clone = el.cloneNode(true);
      clone.classList.add("clone");
      track.insertBefore(clone, track.firstChild);
    });

    current = visible; // start from real first
  }

  function goTo(index, smooth = true) {
    if (isTransitioning) return;

    isTransitioning = true;

    if (!smooth) {
      track.style.transition = "none";
    } else {
      track.style.transition = "transform 0.5s ease";
    }

    current = index;

    const offset = current * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;

    setTimeout(() => {
      isTransitioning = false;
      checkLoop();
    }, 500);
  }

  function checkLoop() {
    const total = track.querySelectorAll(".stories-card").length;
    const visible = getSlidesPerView();

    // jump to real slides (no animation)
    if (current >= total - visible) {
      goTo(visible, false);
    }

    if (current < visible) {
      goTo(total - visible * 2, false);
    }
  }

  function startAutoSlide() {
    clearInterval(autoSlide);

    autoSlide = setInterval(() => {
      goTo(current + 1);
    }, 3000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlide);
  }

  nextBtn?.addEventListener("click", () => {
    goTo(current + 1);
    stopAutoSlide();
    startAutoSlide();
  });

  prevBtn?.addEventListener("click", () => {
    goTo(current - 1);
    stopAutoSlide();
    startAutoSlide();
  });

  track.addEventListener("mouseenter", stopAutoSlide);
  track.addEventListener("mouseleave", startAutoSlide);

  window.addEventListener("resize", () => {
    location.reload(); // easiest safe reset
  });

  // INIT
  applySpacing();
  setupClones();
  goTo(current, false);
  startAutoSlide();
})();

function initFooterAccordion() {

  /* ── Newsletter toggle (mobile only) ── */
  const nlToggle   = document.getElementById("nlToggle");
  const nlFormWrap = document.getElementById("nlFormWrap");

  nlToggle?.addEventListener("click", () => {
    const isOpen = nlFormWrap.classList.contains("open");
    // Toggle open class
    nlFormWrap.classList.toggle("open", !isOpen);
    nlToggle.classList.toggle("open", !isOpen);
    // Force display because Tailwind's `hidden` uses !important
    nlFormWrap.style.display = isOpen ? "none" : "block";
  });

  /* ── Nav column accordions (mobile only) ── */
  const colHeaders = document.querySelectorAll(".footer-col-header");

  colHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      if (window.innerWidth >= 1152) return;

      const key    = header.dataset.accordion;
      const links  = document.getElementById(`acc-${key}`);
      const isOpen = links?.classList.contains("open");

      // Close all first
      colHeaders.forEach((h) => {
        const k = h.dataset.accordion;
        const el = document.getElementById(`acc-${k}`);
        el?.classList.remove("open");
        el && (el.style.display = "none");
        h.classList.remove("open");
      });

      // Open the clicked one if it was closed
      if (!isOpen && links) {
        links.classList.add("open");
        links.style.display = "flex";
        links.style.flexDirection = "column";
        links.style.gap = "12px";
        links.style.paddingTop = "12px";
        header.classList.add("open");
      }
    });
  });

  /* ── On resize to lg+: clear all inline styles ── */
  function syncDesktopState() {
    if (window.innerWidth >= 1152) {
      // Remove inline styles so CSS takes over (lg:flex from Tailwind)
      nlFormWrap && (nlFormWrap.style.display = "");
      document.querySelectorAll(".footer-col-links").forEach((el) => {
        el.style.display = "";
        el.style.flexDirection = "";
        el.style.gap = "";
        el.style.paddingTop = "";
      });
    }
  }

  window.addEventListener("resize", syncDesktopState, { passive: true });
  syncDesktopState(); // run once on init
}

// Make sure it's called
initFooterAccordion();

// Menu open/close
const overlay = document.getElementById("fullMenuOverlay");
const trigger = document.getElementById("menuTrigger");
const closeBtn = document.getElementById("menuCloseBtn");
const mobileTrg = document.getElementById("mobileMenuTrigger");

function openMenu() {
  if (!overlay) return;
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  if (!overlay) return;
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}

// ✅ SAFE listeners
trigger?.addEventListener("click", openMenu);
mobileTrg?.addEventListener("click", openMenu);
closeBtn?.addEventListener("click", closeMenu);

// Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// ─── Lodges dropdown ───
const lodgesDropdown = document.getElementById("lodgesDropdown");

if (lodgesDropdown) {
  const trigger = lodgesDropdown.querySelector(".dropdown-trigger");

  trigger?.addEventListener("click", (e) => {
    e.preventDefault();
    lodgesDropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!lodgesDropdown.contains(e.target)) {
      lodgesDropdown.classList.remove("open");
    }
  });
}

// ─── Image hover preview ───
const primaryLinks = document.querySelectorAll(".primary-links a");
const imgPlaceholder = document.querySelector(".image-preview-placeholder");

const imageMap = {
  0: "./assets/images/navigationimg1.jpg",
  1: "./assets/images/navigationimg2.jpg",
  2: "./assets/images/navigationimg1.jpg",
  3: "./assets/images/navigationimg2.jpg",
  4: "./assets/images/navigationimg1.jpg",
};

if (imgPlaceholder) {
  primaryLinks.forEach((link, i) => {
    link.addEventListener("mouseenter", () => {
      if (imageMap[i]) {
        imgPlaceholder.style.backgroundImage = `url('${imageMap[i]}')`;
        imgPlaceholder.style.backgroundSize = "cover";
        imgPlaceholder.style.backgroundPosition = "center";
      }
    });
  });
}
// ─── EXPERIENCES SWIPER ────────────────────────────────────
(function () {
  const swiperEl    = document.getElementById("expSwiper");
  const nextWrap    = document.getElementById("expNext");
  const prevWrap    = document.getElementById("expPrev");
  const nextBtn     = nextWrap?.querySelector(".exp-arrow-btn");
  const prevBtn     = prevWrap?.querySelector(".exp-arrow-btn");
  const progressBar = document.getElementById("expProgressBar");

  if (!swiperEl) return;

  const TOTAL = swiperEl.querySelectorAll(".swiper-slide").length;

  // ── Is mobile/tablet (below lg) ─────────────────────────
  function isMobile() {
    return window.innerWidth < 1152;
  }

  // ── Update progress bar ──────────────────────────────────
  function updateProgress(activeIndex) {
    if (!progressBar) return;
 const progress = (activeIndex + 1) / TOTAL;
progressBar.style.transform = `scaleX(${progress})`;
  }

  // ── Toggle desc on active card only ─────────────────────
  function updateActiveCard(activeIndex) {
    swiperEl.querySelectorAll(".swiper-slide").forEach((slide, i) => {
      const card     = slide.querySelector(".exp-card");
      const descWrap = slide.querySelector(".exp-card-desc-wrap");
      if (!card || !descWrap) return;

      if (i === activeIndex) {
        card.classList.add("exp-card--active");
        descWrap.classList.remove("exp-card-desc-wrap--hidden");
      } else {
        card.classList.remove("exp-card--active");
        descWrap.classList.add("exp-card-desc-wrap--hidden");
      }
    });
  }

  // ── Arrow visibility ─────────────────────────────────────
  function updateArrows(swiper) {
    // On mobile: loop is on, always hide prev/next wrap buttons
    // (user swipes freely — no arrow UI needed)
    if (isMobile()) {
      prevWrap?.classList.add("hidden");
      nextWrap?.classList.add("hidden");
      return;
    }

    // Desktop: show/hide based on position
    if (swiper.isBeginning) {
      prevWrap?.classList.add("hidden");
    } else {
      prevWrap?.classList.remove("hidden");
    }

    if (swiper.isEnd) {
      nextWrap?.classList.add("hidden");
    } else {
      nextWrap?.classList.remove("hidden");
    }
  }

  // ── Position next arrow at right edge of second card ─────
  function positionNextArrow(swiper) {
    if (!nextWrap) return;

    // Mobile: no floating arrow
    if (isMobile()) {
      nextWrap.style.left = "";
      return;
    }

    const slides      = swiperEl.querySelectorAll(".swiper-slide");
    const targetIndex = swiper.activeIndex + 1;
    const targetSlide = slides[targetIndex] ?? slides[1];
    if (!targetSlide) return;

    const wrapEl = swiperEl.closest(".exp-swiper-wrap");
    if (!wrapEl) return;

    const wrapRect  = wrapEl.getBoundingClientRect();
    const slideRect = targetSlide.getBoundingClientRect();
    const rightEdge = slideRect.right - wrapRect.left;

    nextWrap.style.position  = "absolute";
    nextWrap.style.left      = rightEdge - 17 + "px"; // 17 = half of 34px btn
    nextWrap.style.right     = "auto";
    nextWrap.style.top       = "50%";
    nextWrap.style.transform = "translateY(-50%)";
  }

  // ── Init Swiper ──────────────────────────────────────────
  const swiper = new Swiper(swiperEl, {
    // Loop only on mobile/tablet — on desktop arrows control it
    loop: isMobile(),
    speed: 620,

    // Autoplay only on mobile/tablet
    autoplay: isMobile()
      ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
      : false,

    breakpoints: {
      320:  { slidesPerView: 1.2, spaceBetween: 13 },
      768:  { slidesPerView: 1.4, spaceBetween: 16 },
      1152: { slidesPerView: "auto", spaceBetween: 20 },
      1440: { slidesPerView: "auto", spaceBetween: 23 },
      1920: { slidesPerView: "auto", spaceBetween: 28 },
    },

    on: {
      init(sw) {
        updateActiveCard(sw.activeIndex);
        updateProgress(sw.activeIndex);
        updateArrows(sw);
        setTimeout(() => positionNextArrow(sw), 60);
      },
      slideChange(sw) {
        updateActiveCard(sw.activeIndex);
        updateProgress(sw.activeIndex);
        updateArrows(sw);
        setTimeout(() => positionNextArrow(sw), 30);
      },
    },
  });

  // ── Button clicks (desktop only) ─────────────────────────
  nextBtn?.addEventListener("click", () => swiper.slideNext());
  prevBtn?.addEventListener("click", () => swiper.slidePrev());

  // ── Resize: reinit swiper when crossing lg breakpoint ────
  let resizeTimer;
  let wasOnMobile = isMobile();

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const onMobile = isMobile();

      // If breakpoint crossed — destroy and reinit with correct config
      if (onMobile !== wasOnMobile) {
        wasOnMobile = onMobile;
        swiper.destroy(true, true);

        // Reinit with updated loop/autoplay based on new viewport
        const newSwiper = new Swiper(swiperEl, {
          loop: onMobile,
          speed: 620,
          autoplay: onMobile
            ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false,
          breakpoints: {
            320:  { slidesPerView: 1.2, spaceBetween: 13 },
            768:  { slidesPerView: 1.4, spaceBetween: 16 },
            1152: { slidesPerView: "auto", spaceBetween: 20 },
            1440: { slidesPerView: "auto", spaceBetween: 23 },
            1920: { slidesPerView: "auto", spaceBetween: 28 },
          },
          on: {
            init(sw) {
              updateActiveCard(sw.activeIndex);
              updateProgress(sw.activeIndex);
              updateArrows(sw);
              setTimeout(() => positionNextArrow(sw), 60);
            },
            slideChange(sw) {
              updateActiveCard(sw.activeIndex);
              updateProgress(sw.activeIndex);
              updateArrows(sw);
              setTimeout(() => positionNextArrow(sw), 30);
            },
          },
        });

        nextBtn?.addEventListener("click", () => newSwiper.slideNext());
        prevBtn?.addEventListener("click", () => newSwiper.slidePrev());

      } else {
        // Same breakpoint zone — just reposition arrow
        positionNextArrow(swiper);
      }
    }, 100);
  });
})();

// ─── FULL MENU OVERLAY ───────────────────────────────────────
(function () {
  const overlay     = document.getElementById("fullMenuOverlay");
  const menuTrigger = document.getElementById("menuTrigger");
  const closeBtn    = document.getElementById("menuCloseBtn");
  const mobileTrg   = document.getElementById("mobileMenuTrigger");

  const linkImages = [
    "./assets/images/navigationimg2.jpg", // Lodges
    "./assets/images/navigationimg1.jpg", // Residences
    "./assets/images/navigationimg1.jpg", // Journeys
    "./assets/images/navigationimg2.jpg", // Experiences
    "./assets/images/navigationimg1.jpg", // Impact
  ];

  const previewImg = document.getElementById("fmoPreviewImg");
  const fmoLeft    = overlay?.querySelector(".fmo-left");

  // declare lodgesOpen at top so closeMenu can access it
  let lodgesOpen = false;

  // ── Open / Close ─────────────────────────────────────────
  function openMenu() {
    if (!overlay) return;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    lodgesOpen = false;

    fmoLeft?.classList.remove("has-active", "dropdown-open");
    overlay.querySelectorAll(".fmo-primary-item").forEach((item) => {
      item.classList.remove("is-active", "is-blurred", "is-dropdown-hidden");
    });
    overlay.querySelectorAll(".fmo-submenu").forEach((sub) => {
      sub.classList.remove("open");
    });
  }

  menuTrigger?.addEventListener("click", (e) => {
    e.preventDefault();
    openMenu();
  });
  mobileTrg?.addEventListener("click", openMenu);
  closeBtn?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // ── Primary link hover ────────────────────────────────────
  if (overlay && fmoLeft) {
    const primaryItems = overlay.querySelectorAll(".fmo-primary-item");

    primaryItems.forEach((item, idx) => {
      const link = item.querySelector(".fmo-primary-link");

      link?.addEventListener("mouseenter", () => {
        if (lodgesOpen) return;

        fmoLeft.classList.add("has-active");

        primaryItems.forEach((i) => {
          i.classList.remove("is-active", "is-blurred");
          i.classList.add("is-blurred");
        });

        item.classList.remove("is-blurred");
        item.classList.add("is-active");

        if (previewImg && linkImages[idx]) {
          previewImg.style.opacity = "0";
          setTimeout(() => {
            previewImg.src = linkImages[idx];
            previewImg.style.opacity = "1";
          }, 200);
        }
      });
    });

    fmoLeft.addEventListener("mouseleave", () => {
      if (lodgesOpen) return;
      fmoLeft.classList.remove("has-active");
      primaryItems.forEach((i) => {
        i.classList.remove("is-active", "is-blurred");
      });
    });
  }

  const lodgesItem = document.getElementById("fmoLodges");
  const lodgesMenu = document.getElementById("fmoLodgesMenu");
 const lodgesTriggers = lodgesItem?.querySelectorAll(".fmo-dropdown-trigger");

  const primaryItems = overlay?.querySelectorAll(".fmo-primary-item") ?? [];

  function toggleLodges() {
    lodgesOpen = !lodgesOpen;

    if (lodgesOpen) {
      lodgesMenu?.classList.add("open");
      lodgesItem?.classList.add("is-active");
      lodgesItem?.classList.remove("is-blurred");
      fmoLeft?.classList.add("has-active", "dropdown-open");

      // Hide all other primary items
      primaryItems.forEach((item) => {
        if (item !== lodgesItem) {
          item.classList.add("is-dropdown-hidden");
          item.classList.remove("is-active", "is-blurred");
        }
      });

    } else {
      lodgesMenu?.classList.remove("open");
      lodgesItem?.classList.remove("is-active");
      fmoLeft?.classList.remove("has-active", "dropdown-open");

      primaryItems.forEach((item) => {
        item.classList.remove("is-active", "is-blurred", "is-dropdown-hidden");
      });
    }
  }

  // FIX 4: loop over ALL triggers and attach the SAME toggle function
  lodgesTriggers?.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggleLodges();
    });
  });

})();