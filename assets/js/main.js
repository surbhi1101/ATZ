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
    e.stopPropagation(); 
    const isOpen = dropdown.classList.contains("open");

    dropdowns.forEach((other) => other.classList.remove("open"));
    if (!isOpen) {
      dropdown.classList.add("open");
    }
  });
});

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
    threshold: 0.4,
  },
);
const wordSpans = document.querySelectorAll(".word");

window.addEventListener("scroll", () => {
  const rect = storySection.getBoundingClientRect();
  const windowHeight = window.innerHeight;

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
    return Math.max(1, Math.floor(wrapW / cw));
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

  const maxOffset = totalWidth - wrapW;
  offset = Math.min(offset, maxOffset);

  prevTranslate = -offset;
  currentTranslate = -offset;

  track.style.transition = "transform 0.4s ease";
  track.style.transform = `translateX(-${offset}px)`;

  updateArrows();
  updateCounter();
}

  nextBtn?.addEventListener("click", () => goTo(current + getStep()));
  prevBtn?.addEventListener("click", () => goTo(current - getStep()));

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

  track.addEventListener("mousedown", dragStart);
  track.addEventListener("mousemove", dragMove);
  track.addEventListener("mouseup", dragEnd);
  track.addEventListener("mouseleave", dragEnd);

  track.addEventListener("touchstart", dragStart, { passive: true });
  track.addEventListener("touchmove", dragMove, { passive: true });
  track.addEventListener("touchend", dragEnd);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(current), 100);
  });

  goTo(0);
})();

/*  JOURNEYS SWIPER */
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
let travelSwiper;

function initTravelSwiper() {
  const swiperEl = document.getElementById("travelSwiper");
  if (!swiperEl) return;

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

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initTravelSwiper, 200);
});

document.addEventListener("DOMContentLoaded", initTravelSwiper);

/* STORIES SLIDER*/
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

    slides.slice(0, visible).forEach((el) => {
      const clone = el.cloneNode(true);
      clone.classList.add("clone");
      track.appendChild(clone);
    });

     slides.slice(-visible).forEach((el) => {
      const clone = el.cloneNode(true);
      clone.classList.add("clone");
      track.insertBefore(clone, track.firstChild);
    });

    current = visible; 
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
    location.reload(); 
  });

  applySpacing();
  setupClones();
  goTo(current, false);
  startAutoSlide();
})();

function initFooterAccordion() {
 const nlToggle   = document.getElementById("nlToggle");
  const nlFormWrap = document.getElementById("nlFormWrap");

  nlToggle?.addEventListener("click", () => {
    const isOpen = nlFormWrap.classList.contains("open");
    nlFormWrap.classList.toggle("open", !isOpen);
    nlToggle.classList.toggle("open", !isOpen);
    nlFormWrap.style.display = isOpen ? "none" : "block";
  });

  const colHeaders = document.querySelectorAll(".footer-col-header");

  colHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      if (window.innerWidth >= 1152) return;

      const key    = header.dataset.accordion;
      const links  = document.getElementById(`acc-${key}`);
      const isOpen = links?.classList.contains("open");

      colHeaders.forEach((h) => {
        const k = h.dataset.accordion;
        const el = document.getElementById(`acc-${k}`);
        el?.classList.remove("open");
        el && (el.style.display = "none");
        h.classList.remove("open");
      });

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

  function syncDesktopState() {
    if (window.innerWidth >= 1152) {
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

initFooterAccordion();

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

trigger?.addEventListener("click", openMenu);
mobileTrg?.addEventListener("click", openMenu);
closeBtn?.addEventListener("click", closeMenu);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

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
// ─── EXPERIENCES SLIDER ────────────────────────────────────
(function () {
  const track       = document.getElementById("expTrack");
  const nextWrap    = document.getElementById("expNextWrap");
  const prevWrap    = document.getElementById("expPrevWrap");
  const nextBtn     = document.getElementById("expNextBtn");
  const prevBtn     = document.getElementById("expPrevBtn");
  const progressBar = document.getElementById("expProgressBar");

  if (!track) return;

  let current = 0;
  let autoplayInterval = null;
  const AUTOPLAY_DELAY = 3000;

  function getCards() {
    return [...track.querySelectorAll(".exp-card")];
  }

  function getGap() {
    const style = getComputedStyle(track);
    return parseFloat(style.columnGap) || parseFloat(style.gap) || 0;
  }

  function TOTAL() {
    return getCards().length;
  }

  function isDesktop() {
    return window.innerWidth >= 1152;
  }

  function getOffsetForIndex(index) {
    const cards = getCards();
    const gap   = getGap();
    let offset  = 0;
    for (let i = 0; i < index; i++) {
      offset += cards[i].offsetWidth + gap;
    }
    return offset;
  }

  function getTotalTrackWidth() {
    const cards = getCards();
    const gap   = getGap();
    return cards.reduce((sum, c) => sum + c.offsetWidth + gap, 0) - gap;
  }

  function updateActiveCard(index) {
    getCards().forEach((card, i) => {
      const desc  = card.querySelector(".exp-card-desc-wrap");
      const lodge = card.querySelector(".exp-card-lodge-wrap");

      if (i === index) {
        card.classList.add("exp-card--active");
        desc?.classList.remove("exp-card-desc-wrap--hidden");
        lodge?.classList.remove("exp-card-lodge-wrap--hidden");
      } else {
        card.classList.remove("exp-card--active");
        desc?.classList.add("exp-card-desc-wrap--hidden");
        lodge?.classList.add("exp-card-lodge-wrap--hidden");
      }
    });
  }

  function updateArrows() {
    if (!isDesktop()) {
      prevWrap?.classList.add("hidden");
      nextWrap?.classList.add("hidden");
      return;
    }
    // On desktop show/hide based on position
    prevWrap?.classList.toggle("hidden", current <= 0);
    nextWrap?.classList.toggle("hidden", current >= TOTAL() - 1);
  }

  function updateProgress() {
    if (!progressBar) return;
    progressBar.style.width = ((current + 1) / TOTAL()) * 100 + "%";
  }

  // ── Loop helper: jump silently to index without animation ─
  function jumpTo(index) {
    current = index;
    updateActiveCard(current);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const wrapW     = track.parentElement.offsetWidth;
        let offset      = getOffsetForIndex(current);
        const maxOffset = Math.max(0, getTotalTrackWidth() - wrapW);
        offset          = Math.min(offset, maxOffset);

        track.style.transition = "none";
        track.style.transform  = `translateX(-${offset}px)`;

        updateArrows();
        updateProgress();

        // Re-enable transition after paint
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            track.style.transition = "transform 0.45s ease";
          });
        });
      });
    });
  }

  function goTo(index, animate = true) {
    const total = TOTAL();

    // ── Loop: wrap around in both directions ──
    if (index >= total) {
      // Past last — loop to first
      jumpTo(0);
      return;
    }
    if (index < 0) {
      // Before first — loop to last
      jumpTo(total - 1);
      return;
    }

    current = index;
    updateActiveCard(current);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const wrapW     = track.parentElement.offsetWidth;
        let offset      = getOffsetForIndex(current);
        const maxOffset = Math.max(0, getTotalTrackWidth() - wrapW);
        offset          = Math.min(offset, maxOffset);

        track.style.transition = animate ? "transform 0.45s ease" : "none";
        track.style.transform  = `translateX(-${offset}px)`;

        updateArrows();
        updateProgress();
      });
    });
  }

  // ── Autoplay: only on sm & md (below 1152px) ─────────────
  function startAutoplay() {
    stopAutoplay();

    // Desktop: no autoplay — buttons only
    if (isDesktop()) return;

    autoplayInterval = setInterval(() => {
      goTo(current + 1); // goTo handles loop automatically
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  // ── Buttons: loop on all devices ─────────────────────────
  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    stopAutoplay();
    goTo(current + 1); // loops past last → first
    startAutoplay();
  });

  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    stopAutoplay();
    goTo(current - 1); // loops before first → last
    startAutoplay();
  });

  // ── Touch / Drag ──────────────────────────────────────────
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animFrame;

  function getPositionX(e) {
    return e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
  }

  function dragStart(e) {
    stopAutoplay();
    isDragging = true;
    startX = getPositionX(e);
    prevTranslate = -(getOffsetForIndex(current));
    currentTranslate = prevTranslate;
    track.style.transition = "none";
    animFrame = requestAnimationFrame(animationLoop);
  }

  function dragMove(e) {
    if (!isDragging) return;
    currentTranslate = prevTranslate + (getPositionX(e) - startX);
  }

  function dragEnd() {
    cancelAnimationFrame(animFrame);
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;
    if (movedBy < -50)     goTo(current + 1); // loops
    else if (movedBy > 50) goTo(current - 1); // loops
    else                   goTo(current);
    startAutoplay();
  }

  function animationLoop() {
    track.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animationLoop);
  }

  track.addEventListener("mousedown",  dragStart);
  track.addEventListener("mousemove",  dragMove);
  track.addEventListener("mouseup",    dragEnd);
  track.addEventListener("mouseleave", dragEnd);
  track.addEventListener("touchstart", dragStart, { passive: true });
  track.addEventListener("touchmove",  dragMove,  { passive: true });
  track.addEventListener("touchend",   dragEnd);

  // ── Resize: restart autoplay based on new breakpoint ─────
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      goTo(current);
      startAutoplay(); // will only run if now sm/md
    }, 150);
  });

  // ── Init ──────────────────────────────────────────────────
  goTo(0, false);
  startAutoplay(); // only fires if sm/md on load
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
 let lodgesOpen = false;

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
 lodgesTriggers?.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      toggleLodges();
    });
  });

})();