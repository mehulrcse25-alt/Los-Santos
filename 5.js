/* ========================================
   GTA V — main.js
   ======================================== */

/* ── 1. LOADER ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2000);
});

/* ── 2. NAVBAR — scroll behaviour ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  backToTop.classList.toggle('show', window.scrollY > 400);
});

/* ── 3. BACK TO TOP ── */
const backToTop = document.getElementById('back-to-top');
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── 4. ANIMATED STAT COUNTERS ── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const step     = target / (duration / 16);
  let current    = 0;
  const timer    = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

/* ── 5. SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.card, .char-card').forEach(el => revealObserver.observe(el));

/* ── 6. NATIVE VIDEO PLAYER ── */
(function initVideoPlayer() {
  const wrap       = document.getElementById('video-player-wrap');
  const video      = document.getElementById('trailer-video');
  const controls   = document.getElementById('vid-controls');
  const bigPlay    = document.getElementById('vid-big-play');
  const playBtn    = document.getElementById('vid-play-btn');
  const icoPlay    = playBtn.querySelector('.ico-play');
  const icoPause   = playBtn.querySelector('.ico-pause');
  const rewindBtn  = document.getElementById('vid-rewind-btn');
  const forwardBtn = document.getElementById('vid-forward-btn');
  const muteBtn    = document.getElementById('vid-mute-btn');
  const icoVolUp   = muteBtn.querySelector('.ico-vol-up');
  const icoVolOff  = muteBtn.querySelector('.ico-vol-off');
  const volumeEl   = document.getElementById('vid-volume');
  const timeEl     = document.getElementById('vid-time');
  const progressBg = document.getElementById('vid-progress-bg');
  const bufferedEl = document.getElementById('vid-buffered');
  const playedEl   = document.getElementById('vid-played');
  const thumbEl    = document.getElementById('vid-thumb');
  const pipBtn     = document.getElementById('vid-pip-btn');
  const fsBtn      = document.getElementById('vid-fs-btn');
  const icoFsEnter = fsBtn.querySelector('.ico-fs-enter');
  const icoFsExit  = fsBtn.querySelector('.ico-fs-exit');

  if (!wrap || !video) return;

  /* ── Helpers ── */
  function fmt(s) {
    s = Math.floor(s || 0);
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
  }

  function updatePlayIcons() {
    const playing = !video.paused && !video.ended;
    icoPlay.style.display  = playing ? 'none' : '';
    icoPause.style.display = playing ? ''     : 'none';
    bigPlay.classList.toggle('hidden', playing);
    // update big play icon to show correct symbol
    const bigSvgPath = bigPlay.querySelector('path');
    if (bigSvgPath) {
      bigSvgPath.setAttribute('d', playing
        ? 'M6 19h4V5H6v14zm8-14v14h4V5h-4z'   // pause shape
        : 'M8 5v14l11-7z');                    // play shape
    }
  }

  function updateProgress() {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    playedEl.style.width = pct + '%';
    thumbEl.style.left   = pct + '%';
    // buffered
    if (video.buffered.length) {
      const bufPct = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
      bufferedEl.style.width = bufPct + '%';
    }
    timeEl.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
  }

  /* ── Auto-hide controls ── */
  let hideTimer = null;
  function showControls() {
    wrap.classList.add('ctrl-visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!video.paused) wrap.classList.remove('ctrl-visible');
    }, 3000);
  }

  wrap.addEventListener('mousemove', showControls);
  wrap.addEventListener('touchstart', showControls, { passive: true });

  /* ── Click on video area = play/pause + ripple ── */
  video.addEventListener('click', togglePlay);
  bigPlay.addEventListener('click', togglePlay); // big icon also clickable

  function togglePlay() {
    if (video.paused || video.ended) {
      video.play();
    } else {
      video.pause();
    }
    triggerRipple();
    showControls();
  }

  function triggerRipple() {
    bigPlay.classList.remove('ripple');
    void bigPlay.offsetWidth; // reflow to restart animation
    bigPlay.classList.add('ripple');
    setTimeout(() => bigPlay.classList.remove('ripple'), 600);
  }

  /* ── Play/pause button ── */
  playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });

  /* ── Rewind / Forward ── */
  rewindBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.currentTime = Math.max(0, video.currentTime - 10);
    showControls();
  });
  forwardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
    showControls();
  });

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', (e) => {
    // Only when trailer section is roughly visible
    const rect = wrap.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space' || e.key === 'k') { e.preventDefault(); togglePlay(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); showControls(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); showControls(); }
    if (e.key === 'm') { video.muted = !video.muted; updateMuteIcon(); }
    if (e.key === 'f') { toggleFullscreen(); }
  });

  /* ── Seek bar click / drag ── */
  let seeking = false;

  function seekFromEvent(e) {
    const rect = progressBg.getBoundingClientRect();
    const x    = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pct  = Math.max(0, Math.min(1, x / rect.width));
    video.currentTime = pct * (video.duration || 0);
    updateProgress();
  }

  progressBg.parentElement.addEventListener('mousedown', (e) => {
    seeking = true;
    seekFromEvent(e);
  });
  progressBg.parentElement.addEventListener('touchstart', (e) => {
    seeking = true;
    seekFromEvent(e);
  }, { passive: true });
  window.addEventListener('mousemove', (e) => { if (seeking) { seekFromEvent(e); showControls(); } });
  window.addEventListener('touchmove', (e) => { if (seeking) seekFromEvent(e); }, { passive: true });
  window.addEventListener('mouseup',   () => { seeking = false; });
  window.addEventListener('touchend',  () => { seeking = false; });

  /* ── Volume ── */
  volumeEl.addEventListener('input', (e) => {
    e.stopPropagation();
    video.volume = parseFloat(volumeEl.value);
    video.muted  = video.volume === 0;
    updateMuteIcon();
  });

  function updateMuteIcon() {
    const muted = video.muted || video.volume === 0;
    icoVolUp.style.display  = muted ? 'none' : '';
    icoVolOff.style.display = muted ? ''     : 'none';
    volumeEl.value = muted ? 0 : video.volume;
  }

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.5;
    updateMuteIcon();
    showControls();
  });

  /* ── Picture-in-Picture ── */
  pipBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (_) {}
  });

  /* ── Fullscreen ── */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      wrap.requestFullscreen && wrap.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  }
  fsBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFullscreen(); });

  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    icoFsEnter.style.display = isFs ? 'none' : '';
    icoFsExit.style.display  = isFs ? ''     : 'none';
    if (isFs) showControls();
  });

  /* ── Video events ── */
  video.addEventListener('play',       () => { updatePlayIcons(); showControls(); });
  video.addEventListener('pause',      () => { updatePlayIcons(); wrap.classList.add('ctrl-visible'); clearTimeout(hideTimer); });
  video.addEventListener('ended',      () => { updatePlayIcons(); wrap.classList.add('ctrl-visible'); });
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('loadedmetadata', () => { timeEl.textContent = `0:00 / ${fmt(video.duration)}`; });

  /* ── Double-click fullscreen ── */
  video.addEventListener('dblclick', (e) => { e.preventDefault(); toggleFullscreen(); });

  /* ── Init state ── */
  updatePlayIcons();
  wrap.classList.add('ctrl-visible'); // show controls on load until first play
})();

/* ── 7. MAP SLIDESHOW ── */
const slides       = document.querySelectorAll('.slide');
const slidesTrack  = document.getElementById('slides-track');
const dots         = document.querySelectorAll('.dot');
const progressFill = document.getElementById('slide-progress-fill');
let currentSlide   = 0;
let slideTimer     = null;
const SLIDE_INTERVAL = 5000;

function goToSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slidesTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  progressFill.style.width = `${((currentSlide + 1) / slides.length) * 100}%`;
}
function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }
function startAutoSlide() { clearInterval(slideTimer); slideTimer = setInterval(nextSlide, SLIDE_INTERVAL); }
function resetAutoSlide()  { clearInterval(slideTimer); startAutoSlide(); }

document.getElementById('slide-next').addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
document.getElementById('slide-prev').addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
dots.forEach(dot => dot.addEventListener('click', () => { goToSlide(parseInt(dot.dataset.index)); resetAutoSlide(); }));

document.addEventListener('keydown', e => {
  // Only fire for slideshow when map section is in view AND video is not focused
  const mapSection = document.getElementById('map');
  if (!mapSection) return;
  const r = mapSection.getBoundingClientRect();
  if (r.top > window.innerHeight || r.bottom < 0) return;
  if (e.key === 'ArrowRight') { nextSlide(); resetAutoSlide(); }
  if (e.key === 'ArrowLeft')  { prevSlide(); resetAutoSlide(); }
});

let touchStartX = 0;
const slideshow = document.querySelector('.map-slideshow');
slideshow.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
slideshow.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); resetAutoSlide(); }
});
slideshow.addEventListener('mouseenter', () => clearInterval(slideTimer));
slideshow.addEventListener('mouseleave', startAutoSlide);

goToSlide(0);
startAutoSlide();

/* ── 8. SIGNUP FORM ── */
document.getElementById('signup-btn').addEventListener('click', () => {
  const name      = document.getElementById('signup-name').value.trim();
  const email     = document.getElementById('signup-email').value.trim();
  const platform  = document.getElementById('signup-platform').value;
  const successEl = document.getElementById('signup-success');

  if (!name || !email || !platform) {
    alert('Please fill in all fields before joining.');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  successEl.textContent = `🎮 Welcome, ${name}! You're on the list for ${platform}. See you in Los Santos.`;
  successEl.classList.add('show');
  document.getElementById('signup-name').value     = '';
  document.getElementById('signup-email').value    = '';
  document.getElementById('signup-platform').value = '';
  setTimeout(() => successEl.classList.remove('show'), 6000);
});

/* ── 9. SMOOTH ACTIVE NAV LINK ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav ul a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`nav ul a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));
