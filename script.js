const root = document.documentElement;
const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const portrait = document.querySelector("[data-portrait]");
const year = document.querySelector("[data-year]");
const progress = document.querySelector("[data-progress]");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const desktopNavQuery = window.matchMedia("(min-width: 761px)");

function readSavedTheme() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

function applyTheme(theme, persist = false) {
  root.dataset.theme = theme;
  themeToggle?.setAttribute("aria-label", theme === "dark" ? "Use light theme" : "Use dark theme");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0d1220" : "#f6f7fb");

  if (!persist) return;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // The selected theme still applies for this visit if storage is blocked.
  }
}

applyTheme(root.dataset.theme || (darkModeQuery.matches ? "dark" : "light"));

themeToggle?.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
});

darkModeQuery.addEventListener?.("change", (event) => {
  if (!readSavedTheme()) applyTheme(event.matches ? "dark" : "light");
});

function menuIsOpen() {
  return Boolean(nav?.classList.contains("open"));
}

function setMenu(open, restoreFocus = false) {
  nav?.classList.toggle("open", open);
  body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");

  if (open) {
    nav?.querySelector("a")?.focus();
  } else if (restoreFocus) {
    menuToggle?.focus();
  }
}

menuToggle?.addEventListener("click", () => setMenu(!menuIsOpen()));
header?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("pointerdown", (event) => {
  if (!menuIsOpen() || header?.contains(event.target)) return;
  setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (!menuIsOpen()) return;

  if (event.key === "Escape") {
    event.preventDefault();
    setMenu(false, true);
    return;
  }

  if (event.key !== "Tab" || !header) return;
  const focusable = [...header.querySelectorAll('a[href], button:not([disabled])')].filter(
    (element) => element.getClientRects().length > 0
  );
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

desktopNavQuery.addEventListener?.("change", (event) => {
  if (event.matches && menuIsOpen()) setMenu(false);
});

const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];
const sceneSections = [...document.querySelectorAll("main > section[data-scene]")];
let ticking = false;

function updateScrollState() {
  ticking = false;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const pageProgress = Math.min(Math.max(scrollTop / scrollable, 0), 1);

  header?.classList.toggle("scrolled", scrollTop > 12);
  progress?.style.setProperty("--page-progress", String(pageProgress));

  const probe = scrollTop + Math.min(window.innerHeight * 0.38, 360);
  let activeSection = sceneSections[0];
  for (const section of sceneSections) {
    if (section.offsetTop <= probe) activeSection = section;
    else break;
  }

  if (!activeSection) return;
  body.dataset.scene = activeSection.dataset.scene || "top";
  navLinks.forEach((link) => {
    const active = activeSection.id !== "top" && link.hash === `#${activeSection.id}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function requestScrollUpdate() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateScrollState);
}

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
window.addEventListener("pageshow", requestScrollUpdate);
requestScrollUpdate();

const revealItems = [...document.querySelectorAll(".reveal")];
revealItems.forEach((item) => {
  const delay = Number.parseInt(item.dataset.delay || "0", 10);
  item.style.setProperty("--reveal-delay", `${Number.isFinite(delay) ? delay : 0}ms`);
});

let revealObserver;

function revealAll() {
  revealObserver?.disconnect();
  root.classList.remove("motion-ready");
  revealItems.forEach((item) => item.classList.add("visible"));
}

if (!("IntersectionObserver" in window) || reducedMotionQuery.matches) {
  revealAll();
} else {
  root.classList.add("motion-ready");
  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

reducedMotionQuery.addEventListener?.("change", (event) => {
  if (event.matches) revealAll();
});

function revealRelatedContent(element) {
  if (!(element instanceof Element)) return;
  element.closest(".reveal")?.classList.add("visible");
  element.closest("section")?.querySelectorAll(".reveal").forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) item.classList.add("visible");
  });
}

document.addEventListener("focusin", (event) => revealRelatedContent(event.target));

function revealCurrentHash() {
  if (!window.location.hash) return;
  try {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return;
    target.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
    revealRelatedContent(target);
  } catch {
    // Ignore malformed fragments; ordinary navigation remains available.
  }
}

revealCurrentHash();
window.addEventListener("hashchange", revealCurrentHash);

if (portrait) {
  const showPortraitFallback = () => portrait.classList.add("is-hidden");
  portrait.addEventListener("error", showPortraitFallback);
  if (portrait.complete && !portrait.naturalWidth) showPortraitFallback();
}
if (year) year.textContent = String(new Date().getFullYear());
