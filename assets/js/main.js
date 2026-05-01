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
const dropdowns = document.querySelectorAll('.nav-link-item');

dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
  if (!trigger) return;
    trigger.addEventListener('click', (e) => {
        e.preventDefault(); 
        e.stopPropagation(); // Prevents the window click listener from firing immediately
        
        const isOpen = dropdown.classList.contains('open');

        // Close all other dropdowns first
        dropdowns.forEach(other => other.classList.remove('open'));

        // If it wasn't open, open it now (Toggle logic)
        if (!isOpen) {
            dropdown.classList.add('open');
        }
    });
});

// Close the menu if the user clicks anywhere else on the screen
window.addEventListener('click', () => {
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('open');
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
  { threshold: 0.12 }
);

fadeSections.forEach((el) => fadeObserver.observe(el));

const storySection = document.getElementById("storySection");
const textEl = storySection.querySelector(".story-text-wrap p");

// 👉 Split into words
const words = textEl.innerText.split(" ");
textEl.innerHTML = words
  .map(word => `<span class="word">${word}</span>`)
  .join(" ");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        storySection.classList.add("active");
      } else {
        storySection.classList.remove("active");
      }
    });
  },
  {
    threshold: 0.4 // 👈 adjust when it triggers
  }
);
const wordSpans = document.querySelectorAll(".word");

window.addEventListener("scroll", () => {
  const rect = storySection.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // progress from 0 → 1
  const progress = Math.min(
    Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0),
    1
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

    }
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
    const prevBtn  = document.getElementById("travelPrev");
    const nextBtn  = document.getElementById("travelNext");
    const counter  = document.getElementById("travelCurrent");

    if (!swiperEl) return;

    const padded = (n) => String(n).padStart(2, "0");

    const swiper = new Swiper(swiperEl, {
        slidesPerView: 1.08,
        spaceBetween: 16,
        loop: false, // Loop must be false for beginning/end logic to work
        
        breakpoints: {
            320:  { slidesPerView: 1.1,  spaceBetween: 24 },
            768:  { slidesPerView: 1.5,  spaceBetween: 24 },
            1152: { slidesPerView: 2.08, spaceBetween: 32 },
            1920: { slidesPerView: 3.08, spaceBetween: 40 },
        },

        on: {
            init() {
                // Initial update
                this.emit('slideChange');
            },
            slideChange() {
                // Update Counter
                if (counter) {
                    // Logic: Show the number of the last visible slide
                    const currentVal = Math.min(this.activeIndex + Math.ceil(this.params.slidesPerView), this.slides.length);
                    counter.textContent = padded(this.activeIndex + 1);
                }

                // Update Arrows Logic (Matching your Lodges Slider)
                
                // Prev: hide when at start
                if (this.isBeginning) {
                    prevWrap?.classList.add('hidden');
                } else {
                    prevWrap?.classList.remove('hidden');
                }

                // Next: hide when at end
                if (this.isEnd) {
                    nextWrap?.classList.add('hidden');
                } else {
                    nextWrap?.classList.remove('hidden');
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
  const track    = document.getElementById('storiesTrack');
  const prevWrap = document.getElementById('storiesPrevWrap');
  const nextWrap = document.getElementById('storiesNextWrap');
  const prevBtn  = document.getElementById('storiesPrevBtn');
  const nextBtn  = document.getElementById('storiesNextBtn');

  if (!track) return;

  let current = 0;
  let autoSlide;
  let isTransitioning = false;

  const BREAKPOINTS = {
    320:  { slidesPerView: 1.3, spaceBetween: 24 },
    768:  { slidesPerView: 1.5, spaceBetween: 24 },
    1152: { slidesPerView: 3,   spaceBetween: 32 },
    1920: { slidesPerView: 3.08, spaceBetween: 40 },
  };

  function getSettings() {
    const width = window.innerWidth;
    let active = BREAKPOINTS[320];

    Object.keys(BREAKPOINTS).forEach(bp => {
      if (width >= bp) active = BREAKPOINTS[bp];
    });

    return active;
  }

  function getSlidesPerView() {
    return Math.ceil(getSettings().slidesPerView);
  }

  function getCardWidth() {
    const card = track.querySelector('.stories-card');
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
    slides.slice(0, visible).forEach(el => {
      const clone = el.cloneNode(true);
      clone.classList.add('clone');
      track.appendChild(clone);
    });

    // clone last N
    slides.slice(-visible).forEach(el => {
      const clone = el.cloneNode(true);
      clone.classList.add('clone');
      track.insertBefore(clone, track.firstChild);
    });

    current = visible; // start from real first
  }

  function goTo(index, smooth = true) {
    if (isTransitioning) return;

    isTransitioning = true;

    if (!smooth) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.5s ease';
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
    const total = track.querySelectorAll('.stories-card').length;
    const visible = getSlidesPerView();

    // jump to real slides (no animation)
    if (current >= total - visible) {
      goTo(visible, false);
    }

    if (current < visible) {
      goTo(total - (visible * 2), false);
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

  nextBtn?.addEventListener('click', () => {
    goTo(current + 1);
    stopAutoSlide();
    startAutoSlide();
  });

  prevBtn?.addEventListener('click', () => {
    goTo(current - 1);
    stopAutoSlide();
    startAutoSlide();
  });

  track.addEventListener('mouseenter', stopAutoSlide);
  track.addEventListener('mouseleave', startAutoSlide);

  window.addEventListener('resize', () => {
    location.reload(); // easiest safe reset
  });

  // INIT
  applySpacing();
  setupClones();
  goTo(current, false);
  startAutoSlide();
})();

/* ────────────────────────────────────────────────
   FOOTER ACCORDION (mobile only)
──────────────────────────────────────────────── */
function initFooterAccordion() {

  /* Newsletter toggle */
  const nlToggle   = document.getElementById("nlToggle");
  const nlFormWrap = document.getElementById("nlFormWrap");

  nlToggle?.addEventListener("click", () => {
    const isOpen = nlFormWrap.classList.contains("open");
    nlFormWrap.classList.toggle("open", !isOpen);
    nlToggle.classList.toggle("open", !isOpen);
  });

  /* Nav column accordions */
  const colHeaders = document.querySelectorAll(".footer-col-header");

  colHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      // Only accordion behaviour below lg (1152px)
      if (window.innerWidth >= 1152) return;

      const key     = header.dataset.accordion;
      const links   = document.getElementById(`acc-${key}`);
      const isOpen  = links?.classList.contains("open");

      // Close all
      colHeaders.forEach((h) => {
        const k = h.dataset.accordion;
        document.getElementById(`acc-${k}`)?.classList.remove("open");
        h.classList.remove("open");
      });

      // Open clicked if it wasn't open
      if (!isOpen) {
        links?.classList.add("open");
        header.classList.add("open");
      }
    });
  });

  /* On resize to lg+: ensure all link panels are visible */
  function syncDesktopState() {
    if (window.innerWidth >= 1152) {
      document.querySelectorAll(".footer-col-links").forEach((el) => {
        el.style.display = "";
      });
    }
  }

  window.addEventListener("resize", syncDesktopState, { passive: true });
}


    // Menu open/close
const overlay   = document.getElementById('fullMenuOverlay');
const trigger   = document.getElementById('menuTrigger');
const closeBtn  = document.getElementById('menuCloseBtn');
const mobileTrg = document.getElementById('mobileMenuTrigger');

function openMenu() {
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ✅ SAFE listeners
trigger?.addEventListener('click', openMenu);
mobileTrg?.addEventListener('click', openMenu);
closeBtn?.addEventListener('click', closeMenu);

// Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});


// ─── Lodges dropdown ───
const lodgesDropdown = document.getElementById('lodgesDropdown');

if (lodgesDropdown) {
  const trigger = lodgesDropdown.querySelector('.dropdown-trigger');

  trigger?.addEventListener('click', e => {
    e.preventDefault();
    lodgesDropdown.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!lodgesDropdown.contains(e.target)) {
      lodgesDropdown.classList.remove('open');
    }
  });
}


// ─── Image hover preview ───
const primaryLinks = document.querySelectorAll('.primary-links a');
const imgPlaceholder = document.querySelector('.image-preview-placeholder');

const imageMap = {
  0: './assets/images/navigationimg1.jpg',
  1: './assets/images/navigationimg2.jpg',
  2: './assets/images/navigationimg1.jpg',
  3: './assets/images/navigationimg2.jpg',
  4: './assets/images/navigationimg1.jpg',
};

if (imgPlaceholder) {
  primaryLinks.forEach((link, i) => {
    link.addEventListener('mouseenter', () => {
      if (imageMap[i]) {
        imgPlaceholder.style.backgroundImage = `url('${imageMap[i]}')`;
        imgPlaceholder.style.backgroundSize = 'cover';
        imgPlaceholder.style.backgroundPosition = 'center';
      }
    });
  });
}