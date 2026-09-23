# Seyed Rasoul Hosseini — Personal Website

A responsive academic portfolio for GitHub Pages. The design combines an editorial layout with subtle research-inspired data scenes, section-aware navigation, light and dark themes, and accessible scroll-reveal motion.

## Project files

- `index.html` — page structure, content, metadata, and research-scene artwork
- `styles.css` — color system, typography, responsive layout, and animation
- `script.js` — theme selection, mobile navigation, scroll progress, active section state, and reveals
- `assets/portrait.jpg` — profile portrait
- `assets/Seyed_Rasoul_Hosseini_CV.pdf` — downloadable CV
- `assets/favicon.svg` — browser icon

Keep all three asset filenames exactly as listed, or update their paths in `index.html`.

## Preview locally

From the project folder, run:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. A local server is preferable to opening the HTML file directly because it matches the way GitHub Pages serves the site.

## Publish with GitHub Pages

1. Place these files in the root of the `SRasoulHosseini.github.io` repository.
2. Commit and push them to the repository's default branch.
3. In **Settings → Pages**, choose **Deploy from a branch**.
4. Select the default branch and the `/ (root)` folder, then save.

The site will be available at <https://srasoulhosseini.github.io/> after GitHub finishes the deployment.

## Update the website

- Edit biography, academic path, publications, reviewing, links, and contact details in `index.html`.
- Adjust the design tokens near the top of `styles.css` to change colors consistently.
- Replace files inside `assets/` without changing their names to update the portrait, CV, or favicon.
- Keep `data-scene` attributes and `.reveal` classes when editing sections so the visual transitions continue to work.

Motion is automatically reduced when a visitor enables reduced-motion preferences, and the site remains readable when JavaScript is unavailable.
