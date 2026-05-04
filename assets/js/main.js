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

  const STEP = 2; // cards to advance per click
  const TOTAL = 6;
  let current = 0; // 0-based index of leftmost visible card

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
  return Math.max(1, Math.ceil(wrapW / cw));
}
function maxIndex() {
  const wrapW = track.parentElement.offsetWidth;
  const cw = getCardWidth();
  const totalWidth = TOTAL * cw;
  return Math.max(0, Math.ceil((totalWidth - wrapW) / cw));
}

  function updateArrows() {
    // Prev: hide when at start
    if (current <= 0) {
      prevWrap.classList.add("hidden");
    } else {
      prevWrap.classList.remove("hidden");
    }
    // Next: hide when at end
    if (current >= maxIndex()) {
      nextWrap.classList.add("hidden");
    } else {
      nextWrap.classList.remove("hidden");
    }
  }

  function updateCounter() {
    if (!counterEl) return;
    const display = Math.min(current + visibleCount(), TOTAL);
    counterEl.textContent = String(display).padStart(2, "0");
  }

function goTo(index) {
  // Calculate the maximum scroll offset — never go past last card
  const maxOffset = (TOTAL - 1) * getCardWidth();
  
  current = Math.min(Math.max(0, index), maxIndex());
  
  // Clamp the offset so we never scroll into empty space
  const offset = Math.min(current * getCardWidth(), maxOffset);
  
  track.style.transform = `translateX(-${offset}px)`;
  updateArrows();
  updateCounter();
}

  nextBtn?.addEventListener("click", () => goTo(current + STEP));
  prevBtn?.addEventListener("click", () => goTo(current - STEP));

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener("resize", () => {
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
function initTravelSwiper() {
  const swiperEl = document.getElementById("travelSwiper");
  const prevWrap = document.getElementById("travelPrevWrap"); // The wrapper div
  const nextWrap = document.getElementById("travelNextWrap"); // The wrapper div
  const prevBtn = document.getElementById("travelPrev");
  const nextBtn = document.getElementById("travelNext");
  const counter = document.getElementById("travelCurrent");

  if (!swiperEl) return;

  const padded = (n) => String(n).padStart(2, "0");

  const swiper = new Swiper(swiperEl, {
    slidesPerView: 1.08,
    spaceBetween: 16,
    loop: false, // Loop must be false for beginning/end logic to work

    breakpoints: {
      320: { slidesPerView: 1.1, spaceBetween: 24 },
      768: { slidesPerView: 1.5, spaceBetween: 24 },
      1152: { slidesPerView: 2.08, spaceBetween: 32 },
      1920: { slidesPerView: 3.08, spaceBetween: 40 },
    },

    on: {
      init() {
        // Initial update
        this.emit("slideChange");
      },
      slideChange() {
        // Update Counter
        if (counter) {
          // Logic: Show the number of the last visible slide
          const currentVal = Math.min(
            this.activeIndex + Math.ceil(this.params.slidesPerView),
            this.slides.length,
          );
          counter.textContent = padded(this.activeIndex + 1);
        }

        // Update Arrows Logic (Matching your Lodges Slider)

        // Prev: hide when at start
        if (this.isBeginning) {
          prevWrap?.classList.add("hidden");
        } else {
          prevWrap?.classList.remove("hidden");
        }

        // Next: hide when at end
        if (this.isEnd) {
          nextWrap?.classList.add("hidden");
        } else {
          nextWrap?.classList.remove("hidden");
        }
      },
    },
  });

  // Attach click events to buttons
  prevBtn?.addEventListener("click", () => swiper.slidePrev());
  nextBtn?.addEventListener("click", () => swiper.slideNext());
}

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
  const swiperEl = document.getElementById("expSwiper");
  const nextWrap = document.getElementById("expNext");
  const prevWrap = document.getElementById("expPrev");
  const nextBtn = nextWrap?.querySelector(".exp-arrow-btn");
  const prevBtn = prevWrap?.querySelector(".exp-arrow-btn");
  const progressBar = document.getElementById("expProgressBar");

  if (!swiperEl) return;

  const TOTAL = swiperEl.querySelectorAll(".swiper-slide").length;

  // ── Update progress bar ──────────────────────────────────
  function updateProgress(activeIndex) {
    if (!progressBar) return;
    progressBar.style.width = ((activeIndex + 1) / TOTAL) * 100 + "%";
  }

  // ── Toggle desc visibility on active card only ───────────
  function updateActiveCard(activeIndex) {
    swiperEl.querySelectorAll(".swiper-slide").forEach((slide, i) => {
      const card = slide.querySelector(".exp-card");
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

  // ── Position next arrow at junction between card 2 & 3 ───
  // Arrow always sits at the RIGHT EDGE of the SECOND visible card
  // i.e. slides[activeIndex + 1], falling back to slides[1]
  function positionNextArrow(swiper) {
    if (!nextWrap) return;

    // Only show the floating arrow on desktop (lg+)
    if (window.innerWidth < 1152) {
      nextWrap.style.left = "";
      return;
    }

    const slides = swiperEl.querySelectorAll(".swiper-slide");

    // Target: second card in the current view (activeIndex + 1)
    const targetIndex = swiper.activeIndex + 1;
    const targetSlide = slides[targetIndex] ?? slides[1];
    if (!targetSlide) return;

    const wrapEl = swiperEl.closest(".exp-swiper-wrap");
    if (!wrapEl) return;

    const wrapRect = wrapEl.getBoundingClientRect();
    const slideRect = targetSlide.getBoundingClientRect();

    // Right edge of the second card relative to the swiper wrapper
    const rightEdge = slideRect.right - wrapRect.left;

    nextWrap.style.position = "absolute";
    nextWrap.style.left = rightEdge - 22 + "px"; // 22 = half of 44px btn width
    nextWrap.style.right = "auto";
    nextWrap.style.top = "50%";
    nextWrap.style.transform = "translateY(-50%)";
  }

  // ── Init Swiper ──────────────────────────────────────────
  const swiper = new Swiper(swiperEl, {
    loop: true,
    speed: 620,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    breakpoints: {
      320: { slidesPerView: 1.2, spaceBetween: 13 },
      768: { slidesPerView: 1.4, spaceBetween: 16 },
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

  // ── Button clicks ────────────────────────────────────────
  nextBtn?.addEventListener("click", () => swiper.slideNext());
  prevBtn?.addEventListener("click", () => swiper.slidePrev());

  // ── Recalculate on resize ────────────────────────────────
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => positionNextArrow(swiper), 100);
  });
})();

// ─── FULL MENU OVERLAY ─────────────────────────────────────
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

  // ── Open / Close ─────────────
  function openMenu() {
    if (!overlay) return;
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove("active");
    document.body.style.overflow = "";

    // Full reset
    fmoLeft?.classList.remove("has-active", "dropdown-open");
    overlay.querySelectorAll(".fmo-primary-item").forEach((item) => {
      item.classList.remove("is-active", "is-blurred");
    });
    overlay.querySelectorAll(".fmo-submenu").forEach((sub) => {
      sub.classList.remove("open");
    });
    lodgesOpen = false;
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

  if (overlay && fmoLeft) {
    const primaryItems = overlay.querySelectorAll(".fmo-primary-item");

    primaryItems.forEach((item, idx) => {
      const link = item.querySelector(".fmo-primary-link");

      link?.addEventListener("mouseenter", () => {
        // Skip hover changes when dropdown is open
        if (lodgesOpen) return;

        fmoLeft.classList.add("has-active");

        primaryItems.forEach((i) => {
          i.classList.remove("is-active", "is-blurred");
          i.classList.add("is-blurred");
        });

        item.classList.remove("is-blurred");
        item.classList.add("is-active");

        // Swap preview image
        if (previewImg && linkImages[idx]) {
          previewImg.style.opacity = "0";
          setTimeout(() => {
            previewImg.src = linkImages[idx];
            previewImg.style.opacity = "1";
          }, 200);
        }
      });
    });

    // Reset when mouse leaves entire left column
    fmoLeft.addEventListener("mouseleave", () => {
      // Don't reset if dropdown is open — keep lodge item active
      if (lodgesOpen) return;

      fmoLeft.classList.remove("has-active");
      primaryItems.forEach((i) => {
        i.classList.remove("is-active", "is-blurred");
      });
    });
  }

  const lodgesItem    = document.getElementById("fmoLodges");
  const lodgesMenu    = document.getElementById("fmoLodgesMenu");
  const lodgesTrigger = lodgesItem?.querySelector(".fmo-dropdown-trigger");
  const primaryItems  = overlay?.querySelectorAll(".fmo-primary-item") ?? [];

  let lodgesOpen = false;

  lodgesTrigger?.addEventListener("click", (e) => {
    e.preventDefault();
    lodgesOpen = !lodgesOpen;

    if (lodgesOpen) {
      // Open state
      lodgesMenu?.classList.add("open");
      lodgesItem?.classList.add("is-active");
      lodgesItem?.classList.remove("is-blurred");
      fmoLeft?.classList.add("has-active", "dropdown-open");

      // Hide every other primary item
      primaryItems.forEach((item) => {
        if (item !== lodgesItem) {
          item.classList.add("is-dropdown-hidden");
          item.classList.remove("is-active", "is-blurred");
        }
      });

    } else {
      // Close state — restore neutral
      lodgesMenu?.classList.remove("open");
      lodgesItem?.classList.remove("is-active");
      fmoLeft?.classList.remove("has-active", "dropdown-open");

      primaryItems.forEach((item) => {
        item.classList.remove(
          "is-active",
          "is-blurred",
          "is-dropdown-hidden"
        );
      });
    }
  });
})();