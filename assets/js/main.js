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
  { threshold: 0.12 }
);

fadeSections.forEach((el) => fadeObserver.observe(el));

// ─── WORD COLOUR REVEAL ON SCROLL ──────────────────────────
// Words light up progressively as the section scrolls into the viewport.
// We track the section's position relative to viewport and
// illuminate words proportional to how far into view the section is.

const storySection = document.getElementById("storySection");
const words = document.querySelectorAll(".word-animate");

let rafId = null;
let lastProgress = -1;

function lightWords(progress) {
  // progress: 0 → 1 (how far into the section the user has scrolled)
  const threshold = Math.floor(progress * words.length);
  words.forEach((word, i) => {
    if (i < threshold) {
      word.classList.add("lit");
    } else {
      word.classList.remove("lit");
    }
  });
}

function onScroll() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;

    if (!storySection) return;

    const rect = storySection.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Start lighting when top of section enters screen
    // Finish when bottom of section is near viewport bottom
    const sectionH = rect.height;
    const start = rect.top - windowH * 0.85;
    const end = rect.top + sectionH * 0.75 - windowH * 0.2;

    let progress = 0;
    if (start < 0 && end !== start) {
      progress = Math.min(1, Math.max(0, -start / (end - start)));
    }

    // Only update DOM if progress changed meaningfully
    if (Math.abs(progress - lastProgress) > 0.004) {
      lastProgress = progress;
      lightWords(progress);
    }
  });
}

window.addEventListener("scroll", onScroll, { passive: true });
// Run once on load in case section is already in view
onScroll();


// ─── LODGES SLIDER ─────────────────────────────────────────
(function () {
  const track       = document.getElementById('lodgesTrack');
  const nextWrap    = document.getElementById('lodgesNextWrap');
  const prevWrap    = document.getElementById('lodgesPrevWrap');
  const nextBtn     = document.getElementById('lodgesNextBtn');
  const prevBtn     = document.getElementById('lodgesPrevBtn');
  const counterEl   = document.getElementById('counterCurrent');

  if (!track) return;

  const STEP       = 2;    // cards to advance per click
  const TOTAL      = 6;
  let current      = 0;    // 0-based index of leftmost visible card

  function getCardWidth() {
    const card = track.querySelector('.lodge-card');
    if (!card) return 0;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap) || parseFloat(style.gap) || 0;
    return card.offsetWidth + gap;
  }

  function visibleCount() {
    // How many cards fit in the wrapper?
    const wrapW = track.parentElement.offsetWidth;
    const cw    = getCardWidth();
    if (!cw) return 1;
    return Math.max(1, Math.floor(wrapW / cw));
  }

  function maxIndex() {
    return Math.max(0, TOTAL - visibleCount());
  }

  function updateArrows() {
    // Prev: hide when at start
    if (current <= 0) {
      prevWrap.classList.add('hidden');
    } else {
      prevWrap.classList.remove('hidden');
    }
    // Next: hide when at end
    if (current >= maxIndex()) {
      nextWrap.classList.add('hidden');
    } else {
      nextWrap.classList.remove('hidden');
    }
  }

  function updateCounter() {
    if (!counterEl) return;
    const display = Math.min(current + visibleCount(), TOTAL);
    counterEl.textContent = String(display).padStart(2, '0');
  }

  function goTo(index) {
    current = Math.min(Math.max(0, index), maxIndex());
    const offset = current * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
    updateArrows();
    updateCounter();
  }

  nextBtn?.addEventListener('click', () => goTo(current + STEP));
  prevBtn?.addEventListener('click', () => goTo(current - STEP));

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(current), 100);
  });

  // Init
  goTo(0);
})();

/* ────────────────────────────────────────────────
   JOURNEYS SWIPER (mobile / tablet only)
──────────────────────────────────────────────── */
function initJourneysSwiper() {
  const swiperEl = document.getElementById("journeysSwiper");
  const prevBtn  = document.getElementById("jrnPrev");
  const nextBtn  = document.getElementById("jrnNext");
  const counter  = document.getElementById("jrnCurrent");
 
  if (!swiperEl) return;
 
  const TOTAL = swiperEl.querySelectorAll(".swiper-slide").length;
  const padded = (n) => String(n).padStart(2, "0");
 
  const swiper = new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: 16,
    loop: false,
    breakpoints: {
      // md (768px) → show 1.15 cards to hint next
      768: { slidesPerView: 1.1, spaceBetween: 20 },
    },
    on: {
      slideChange() {
        if (counter) counter.textContent = padded(this.activeIndex + 1);
      },
    },
  });
 
  prevBtn?.addEventListener("click", () => swiper.slidePrev());
  nextBtn?.addEventListener("click", () => swiper.slideNext());
 
  // Only activate swiper below lg (1152px)
  function handleResize() {
    if (window.innerWidth >= 1152) {
      // Disable interaction on desktop; grid is shown instead
      swiper.disable();
    } else {
      swiper.enable();
    }
  }
  window.addEventListener("resize", handleResize, { passive: true });
  handleResize();
}
 
 /* ────────────────────────────────────────────────
    TRAVEL TYPES SWIPER
 ──────────────────────────────────────────────── */
function initTravelSwiper() {
  const swiperEl = document.getElementById("travelSwiper");
  const prevBtn  = document.getElementById("travelPrev");
  const nextBtn  = document.getElementById("travelNext");
  const counter  = document.getElementById("travelCurrent");

  if (!swiperEl) return;

  const padded = (n) => String(n).padStart(2, "0");

  const swiper = new Swiper(swiperEl, {
    slidesPerView: 1.08,
    spaceBetween: 16,
    loop: false,

    breakpoints: {
      768:  { slidesPerView: 1.5,  spaceBetween: 24 },
      1152: { slidesPerView: 2.08, spaceBetween: 32 },
      1440: { slidesPerView: 2.5, spaceBetween: 36 },
      1920: { slidesPerView: 3.08, spaceBetween: 40 },
    },

    on: {
      init() {
        if (counter) counter.textContent = padded(this.activeIndex + 1);
      },
      slideChange() {
        if (counter) counter.textContent = padded(this.activeIndex + 1);
      },
    },
  });

  prevBtn?.addEventListener("click", () => swiper.slidePrev());
  nextBtn?.addEventListener("click", () => swiper.slideNext());
}

document.addEventListener("DOMContentLoaded", initTravelSwiper);