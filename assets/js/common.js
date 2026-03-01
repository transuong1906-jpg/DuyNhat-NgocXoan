/* =====================================================
   GLOBAL STATE
===================================================== */
const AppState = {
  opened: false,
  scrolling: false,
  autoScrollTimer: null
};

/* =====================================================
   DOM READY
===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  lockScroll();
  initOpeningCard();
  initAudio();
  initScrollStopEvents();
});

/* =====================================================
   SCROLL LOCK
===================================================== */
function lockScroll() {
  document.body.classList.add('no-scroll');
}

function unlockScroll() {
  document.body.classList.remove('no-scroll');
}

/* =====================================================
   OPENING CARD FLOW
===================================================== */
function initOpeningCard() {
  const opening = document.getElementById('card-opening-sides');
  if (!opening) {
    // Không có thiệp → vào thẳng nội dung
    startAfterOpening();
    return;
  }

  opening.classList.add('loading');

  // giả lập preload (font + image)
  setTimeout(() => {
    opening.classList.remove('loading');
    openCard(opening);
  }, 600);

  // cho phép click mở
  opening.addEventListener('click', () => openCard(opening));
}

function openCard(opening) {
  if (AppState.opened) return;
  AppState.opened = true;

  opening.classList.add('_animating');
  document.body.classList.add('card-opened');

  // sau khi animation bắt đầu
  setTimeout(() => {
    unlockScroll();
    document.dispatchEvent(new CustomEvent('card-started'));
    startAfterOpening();
  }, 600);

  // ẩn overlay hoàn toàn sau animation
  setTimeout(() => {
    opening.style.opacity = '0';
    opening.style.pointerEvents = 'none';
  }, 4600);
}

/* =====================================================
   AFTER OPENING (TIMELINE)
===================================================== */
function startAfterOpening() {
  initRevealSections();

  setTimeout(() => {
    showFloatingButtons();
  }, 1200);

  setTimeout(() => {
    startAutoScroll();
  }, 2600);
}

/* =====================================================
   SECTION REVEAL (MATCH CSS)
===================================================== */
function initRevealSections() {
  const sections = document.querySelectorAll(
    'section, .section, .container'
  );

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach(sec => {
    sec.classList.add('will-reveal');
    io.observe(sec);
  });

  // hook WOW nếu có
  if (window.WOW) {
    new WOW().init();
  }
}

/* =====================================================
   FLOATING BUTTONS
===================================================== */
function showFloatingButtons() {
  document.querySelectorAll('.floating-btn').forEach(btn => {
    btn.classList.add('expanded');
    setTimeout(() => btn.classList.remove('expanded'), 3000);
  });
}

/* =====================================================
   AUDIO HANDLING (MATCH CSS)
===================================================== */
function initAudio() {
  const audio = document.querySelector('audio');
  const btn = document.getElementById('audioToggleBtn');
  if (!audio || !btn) return;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      btn.classList.add('playing');
    } else {
      audio.pause();
      btn.classList.remove('playing');
    }
  });

  // thử autoplay sau khi mở thiệp
  document.addEventListener('card-started', () => {
    audio.play().then(() => {
      btn.classList.add('playing');
    }).catch(() => {});
  });
}

/* =====================================================
   GUEST POPUP
===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('QrModal');
  const closeBtn = document.getElementById('QrModalClose');
  const giftButtons = document.querySelectorAll('.qr-gift-button');
  const qrCards = document.querySelectorAll('.qr-card');

  if (!modal) return;

  // mở popup
  giftButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-qr-target');

      // ẩn tất cả QR
      qrCards.forEach(card => card.style.display = 'none');

      // hiện QR đúng
      const activeCard = modal.querySelector(
        `.qr-card[data-qr-card="${target}"]`
      );
      if (activeCard) activeCard.style.display = 'block';

      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  // đóng popup
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  });

  // click nền để đóng
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });
});

/* =====================================================
   AUTO SCROLL
===================================================== */
function startAutoScroll() {
  if (AppState.scrolling) return;
  AppState.scrolling = true;

  const el = document.scrollingElement || document.documentElement;

  AppState.autoScrollTimer = setInterval(() => {
    const max =
      el.scrollHeight - window.innerHeight - 2;

    if (el.scrollTop >= max) {
      stopAutoScroll();
      return;
    }

    el.scrollTop += 2;
  }, 40);
}

function stopAutoScroll() {
  if (AppState.autoScrollTimer) {
    clearInterval(AppState.autoScrollTimer);
    AppState.autoScrollTimer = null;
  }
  AppState.scrolling = false;
}

function initScrollStopEvents() {
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(evt => {
    window.addEventListener(evt, stopAutoScroll, { passive: true });
  });
}
