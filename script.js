const header = document.getElementById('siteHeader');
const navProgress = document.getElementById('navProgress');

function updateHeaderOnScroll(){
  header.classList.toggle('scrolled', window.scrollY > 8);
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  navProgress.style.width = pct + '%';
}
window.addEventListener('scroll', updateHeaderOnScroll, { passive:true });
updateHeaderOnScroll();

const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

function closeMobileMenu(){
  burger.classList.remove('open');
  mobileMenu.classList.remove('open');
  burger.setAttribute('aria-expanded', false);
}

burger.addEventListener('click', () => {
  const isOpen = burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu();
});

document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle (persists across visits)
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
try {
  const saved = localStorage.getItem('ys-theme');
  if (saved) root.setAttribute('data-theme', saved);
} catch (e) {}
themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('ys-theme', next); } catch (e) {}
});

// DRS review chip
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const chip = document.getElementById('reviewChip');
const reviewText = document.getElementById('reviewText');
const clearChip = () => {
  chip.classList.add('cleared'); reviewText.textContent = 'NOT OUT';
  chip.querySelector('.pip').classList.remove('pulse');
};
if (reduceMotion) clearChip(); else setTimeout(clearChip, 2200);

// ---- Active nav link highlighting based on visible section ----
const navLinkEls = document.querySelectorAll('.nav-links a, .mobile-menu a');
function setActiveLink(id){
  navLinkEls.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
}
const trackedSections = ['about', 'work', 'contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) setActiveLink(entry.target.id); });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
trackedSections.forEach(s => sectionObserver.observe(s));

// ---- storyline scroll-stack, eased with rAF for smoothness ----
const storyline = document.getElementById('storyline');
const panels = Array.from(document.querySelectorAll('.story-panel'));
const counterEl = document.getElementById('storyCounter');
const categoryEl = document.getElementById('storyCategory');
const browserMock = document.getElementById('browserMock');
const categories = ['INTRO','PROBLEM','STANDARD','METHOD','SYSTEM'];

let targetProgress = 0;
let currentProgress = 0;

function computeTarget(){
  const rect = storyline.getBoundingClientRect();
  const total = storyline.offsetHeight - window.innerHeight;
  let scrolled = -rect.top;
  scrolled = Math.max(0, Math.min(scrolled, total));
  targetProgress = total > 0 ? scrolled / total : 0;
}

function applyProgress(progress){
  const n = panels.length;
  let idx = Math.min(n - 1, Math.floor(progress * n));

  panels.forEach((p, i) => {
    const start = i / n, end = (i + 1) / n;
    let opacity = 0;
    if (progress >= start && progress < end) {
      const local = (progress - start) / (end - start);
      opacity = local < 0.15 ? local / 0.15 : local > 0.85 ? (1 - local) / 0.15 : 1;
    } else if (i === n - 1 && progress >= end) {
      opacity = 1;
    }
    p.style.opacity = opacity;
    p.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
  });

  counterEl.textContent = String(idx + 1).padStart(2, '0');
  categoryEl.textContent = categories[idx];
  browserMock.style.opacity = Math.max(0.15, 0.5 - progress * 0.35);
}

function loop(){
  if (reduceMotion) {
    currentProgress = targetProgress;
  } else {
    currentProgress += (targetProgress - currentProgress) * 0.14;
    if (Math.abs(targetProgress - currentProgress) < 0.0005) currentProgress = targetProgress;
  }
  applyProgress(currentProgress);
  requestAnimationFrame(loop);
}

window.addEventListener('scroll', computeTarget, { passive: true });
window.addEventListener('resize', computeTarget);
computeTarget();
requestAnimationFrame(loop);