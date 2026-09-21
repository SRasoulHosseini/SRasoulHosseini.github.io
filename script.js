const root = document.documentElement;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const portrait = document.querySelector("[data-portrait]");
const year = document.querySelector("[data-year]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let savedTheme = null;
try {
  savedTheme = localStorage.getItem("theme");
} catch {
  savedTheme = null;
}
const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

function setTheme(theme) {
  root.dataset.theme = theme;
  themeToggle?.setAttribute("aria-label", theme === "dark" ? "Use light theme" : "Use dark theme");
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "dark" ? "#0c111c" : "#f7f8fc"
  );
}

setTheme(savedTheme || (systemDark ? "dark" : "light"));

themeToggle?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    // The theme still applies to the current page when storage is unavailable.
  }
});

function closeMenu() {
  nav?.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
}

menuToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("open");
  document.body.classList.toggle("menu-open", Boolean(isOpen));
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !nav?.classList.contains("open")) return;
  closeMenu();
  menuToggle?.focus();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760 && nav?.classList.contains("open")) closeMenu();
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("scrolled", window.scrollY > 12),
  { passive: true }
);

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  root.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: "0px 0px -12% 0px" }
  );

  document
    .querySelectorAll("main > .section > .container")
    .forEach((container) => revealObserver.observe(container));
}

function revealContainerFor(element) {
  if (!(element instanceof Element)) return;
  const container =
    element.closest("main > .section > .container") ||
    element.closest("main > .section")?.querySelector(":scope > .container");
  container?.classList.add("visible");
}

document.addEventListener("focusin", (event) => revealContainerFor(event.target));

function revealCurrentHash() {
  if (!window.location.hash) return;
  try {
    revealContainerFor(document.getElementById(decodeURIComponent(window.location.hash.slice(1))));
  } catch {
    // Ignore malformed URL fragments; normal page navigation remains available.
  }
}

revealCurrentHash();
window.addEventListener("hashchange", revealCurrentHash);

const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-22% 0px -58%", threshold: [0.05, 0.2, 0.5] }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

portrait?.addEventListener("error", () => portrait.classList.add("is-hidden"));

if (year) year.textContent = String(new Date().getFullYear());
