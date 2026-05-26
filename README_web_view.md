# Project Plan Web View

This folder now contains a markdown-connected project-plan website:

- index.html
- visual_overview.html
- styles.css
- app.js
- Project_plan.md

## How it works

The page loads and renders Project_plan.md directly in the browser.

The visual overview page is a standalone, visitor-facing companion page with
hand-crafted SVG/CSS visualizations for the core framework concepts.

This means your editing workflow is simple:

1. Edit Project_plan.md.
2. Keep the page open.
3. Your changes auto-appear within about 2 seconds.

Extra viewer features:

- Dark/light mode toggle (saved in browser local storage).
- Collapsible section view based on H2 headings.
- Expand All and Collapse All controls.
- PDF download via browser print dialog.
- Auto-refresh polling (every 2 seconds) with status indicator.

## Local preview

Run a local web server from this folder:

```bash
cd /home/mluser1/Musti_Phd_Project_4
python3 -m http.server 8000
```

Then open:

http://localhost:8000/index.html

For the visual overview:

http://localhost:8000/visual_overview.html

## Share as a link

Option A: GitHub Pages

1. Push this folder to a GitHub repository.
2. In repository settings, enable GitHub Pages from the main branch root.
3. Share the generated Pages link.

Option B: Any static hosting

Upload these files to Netlify, Vercel, Cloudflare Pages, or your own web server.

## Important notes

- Keep index.html and Project_plan.md in the same folder unless you update the path in app.js.
- The page builds a table of contents automatically from section headings.
- The button "Copy Share Link" copies the current page URL.
- The button "Download PDF" opens the print dialog. Choose "Save as PDF" in your browser.
