# Seyed Rasoul Hosseini — A research notebook

A personal academic website built around continual learning: paper-like surfaces,
violet and teal ink, a contents margin, and an interactive learning illustration.
Plain HTML, CSS, and JavaScript; no build step or package installation required.

## Preview

Open `index.html`, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Google Fonts requires an internet connection;
system font fallbacks keep the page readable offline.

## Update the existing GitHub Pages repository

1. Unzip this package.
2. Open the existing `SRasoulHosseini.github.io` repository on GitHub.
3. Upload the **contents inside** the extracted folder to the repository root:
   `index.html`, `styles.css`, `script.js`, `README.md`, and the entire `assets`
   folder. Do not upload the ZIP or nest the enclosing folder inside the repo.
4. Commit the changes to the branch already used by GitHub Pages.
5. Wait for the Pages deployment to finish, then reload the website. If the
   previous design remains cached, perform a hard refresh.

The repository name, URL, and existing Pages settings can stay the same.

## Editing

- `index.html`: biography, publications, academic path, certificates, reviewing,
  contact links, and metadata. Update the appropriate section directly.
- `styles.css`: color variables at the top, typography, responsive layouts,
  reduced-motion behavior, and print styles.
- `script.js`: Paper/Night theme, active contents link, reading progress, reveal
  transitions, and the continual-learning illustration.
- `assets/portrait.jpg`: original portrait.
- `assets/Seyed_Rasoul_Hosseini_CV.pdf`: existing downloadable CV, unchanged.
- `assets/certificates/`: all three course certificates. NVIDIA files are cropped
  into one page each, including their original continuation with certification
  ID. The Coursera PDF is unchanged. Verification URLs appear beside each course.

## Interaction and accessibility

Scrolling is native, with no wheel interception or forced snapping. Sections
fade in once; the contents margin becomes a horizontally scrollable navigation
bar on smaller screens. Links, content, CV, and certificates work without
JavaScript. Theme and illustration controls appear only after initialization.

The opening illustration is a **conceptual visual metaphor**, not an experiment
or trained model. It shows earlier and incoming experience. Use the slider,
pause/replay button, and Memory replay switch to explore it. It plays once,
pauses work while out of view, and does not autoplay when reduced motion is set.

The page includes a skip link, keyboard focus indicators, reduced-motion and
forced-color support, and print styles. The illustration uses SVG rather than
video, WebGL, or a third-party animation library.

## Validation

Local file links, retained publication content, JavaScript syntax, and focused
interaction logic were checked. The cropped certificates were rendered and
visually inspected. Browser rendering could not be checked in the build
environment; review the page at desktop and mobile widths before publishing.


