# Seyed Rasoul Hosseini — A research notebook

A personal academic website built around continual learning: paper-like surfaces,
violet and teal ink, a contents margin, and an interactive learning illustration.
Plain HTML, CSS, and JavaScript. The delivered `index.html` is ready to upload:
it contains its own CSS and JavaScript, so stale separate files cannot change
its layout or behavior. The portrait and PDFs remain in `assets/`.

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
3. Replace `index.html` at the repository root with the file in this package.
   Upload the **contents inside** the extracted folder to that same root:
   `index.html`, `styles.css`, `script.js`, `README.md`, and the entire `assets`
   folder. Do not upload the ZIP or nest the enclosing folder inside the repo.
4. Commit the changes to the branch already used by GitHub Pages.
5. Wait for the Pages deployment to finish, then reload the website with
   `Ctrl+Shift+R` (Windows/Linux) or `Command+Shift+R` (Mac).

The repository name, URL, and existing Pages settings can stay the same.

## Editing

- `index.html`: biography, publications, academic path, certificates, reviewing,
  contact links, and metadata. Update the appropriate HTML section directly.
  The embedded style/script blocks are generated from the following two files.
- `styles.css`: color variables at the top, typography, responsive layouts,
  reduced-motion behavior, and print styles.
- `script.js`: Day/Night theme, active contents link, reading progress, reveal
  transitions, and the continual-learning illustration.
- `assets/portrait.jpg`: original portrait.
- `assets/Seyed_Rasoul_Hosseini_CV.pdf`: existing downloadable CV, unchanged.
- `assets/certificates/`: all three course certificates. NVIDIA files are cropped
  into one page each, including their original continuation with certification
  ID. The Coursera PDF is unchanged. Verification URLs appear beside each course.

After editing `styles.css` or `script.js`, refresh their embedded copies:

```bash
python3 tools/build.py
python3 tools/validate.py
```

These commands need Python 3 only. Changes to page text do not need a rebuild;
run the validator after changing links or filenames. Upload the rebuilt
`index.html` and any changed assets. Keep the source files and `tools/` in the
repository for future maintenance.

For changes to interaction behavior, run `node tools/check-interactions.cjs`
with Node.js. These regression checks use a simulated DOM; they do not replace
a visual check in a browser.

Expected public paths include `/index.html`, `/assets/portrait.jpg`, and
`/assets/certificates/NVIDIA_LLM_cropped.pdf`. A folder such as
`/SRasoulHosseini.github.io-main/index.html` is the wrong upload location.

## Interaction and accessibility

Scrolling is native, with smooth anchor links and no wheel interception or
forced snapping. Header and navigation heights are measured for anchor offsets.
Short final sections share the remaining scroll distance on tall or zoomed-out
screens, so the active navigation does not skip Reviewing before Contact.

Entries fade in once with finite animations. Their default CSS state is always
visible: blocked scripts or failed observers cannot leave blank content.
The contents margin becomes a horizontally scrollable navigation bar on smaller
screens. Links, content, CV, and certificates work without JavaScript. Theme and
illustration controls appear only after initialization.

The opening illustration is a **conceptual visual metaphor**, not an experiment
or trained model. It shows existing and incoming knowledge. Use the learning
progress slider, play/pause/restart button, and Preserve knowledge switch to
explore retention. It illustrates a general goal, without attributing it to a
specific learning method. It plays once, pauses work while out of view, and
does not autoplay when reduced motion is set.

The page includes a skip link, keyboard focus indicators, reduced-motion and
forced-color support, and print styles. The illustration uses SVG rather than
video, WebGL, or a third-party animation library.

## Validation

Local file links, retained content and certificate bytes, JavaScript syntax,
HTTP asset delivery, and focused interaction logic were checked. Regression
checks cover resized headers, the mobile offset, bottom-of-page navigation,
observer failure, theme changes, knowledge preservation, pause/resume, and reduced motion.
The end-of-page regression checks every section in both scroll directions at
900, 1700, and 2000-pixel viewport heights, including the previously skipped
Certificates → Reviewing → Contact transition.

The build environment blocks the live site and has no browser available.
Browser rendering remains unverified. The skipped navigation section was
reproduced and corrected with viewport-based interaction tests.
After deployment, check the page at desktop and phone widths, click each
contents link, and open the CV and all three certificates. The page should
also remain fully readable with JavaScript disabled.


