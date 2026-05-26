const markdownFilePath = "Project_plan.md";
const themeStorageKey = "project-plan-theme";
const autoRefreshMs = 2000;
let lastMarkdownHash = "";
let autoRefreshTimer = null;
let tocObserver = null;

marked.setOptions({ gfm: true, breaks: false, mangle: false, headerIds: false });

// ── Utilities ──────────────────────────────────────────────────────────────────

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function hashText(text) {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
  return (hash >>> 0).toString(16);
}

async function fetchMarkdownText() {
  const response = await fetch(markdownFilePath, { cache: "no-store" });
  if (!response.ok) throw new Error(`Cannot load ${markdownFilePath}.`);
  return response.text();
}

// ── Heading IDs ────────────────────────────────────────────────────────────────

function addHeadingIds(root) {
  const headings = root.querySelectorAll("h1, h2, h3");
  const used = new Set();
  headings.forEach(h => {
    const base = slugify(h.textContent || "section") || "section";
    let id = base;
    let i = 2;
    while (used.has(id) || document.getElementById(id)) { id = `${base}-${i}`; i++; }
    used.add(id);
    h.id = id;
  });
  return headings;
}

// ── TOC ────────────────────────────────────────────────────────────────────────

function buildToc(headings) {
  const toc = document.getElementById("toc");
  toc.innerHTML = "";
  headings.forEach(h => {
    if (h.tagName !== "H2" && h.tagName !== "H3") return;
    const link = document.createElement("a");
    link.href = `#${h.id}`;
    link.textContent = h.textContent.replace(/^\d+\.\s*/, "");
    if (h.tagName === "H3") link.classList.add("toc-h3");
    toc.appendChild(link);
  });
}

function activeTocTracking() {
  if (tocObserver) tocObserver.disconnect();
  const sections = document.querySelectorAll("details.collapsible-section");
  const tocLinks = document.querySelectorAll("#toc a");

  tocObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      tocLinks.forEach(link => link.classList.remove("toc-active"));
      const id = entry.target.id;
      const active = document.querySelector(`#toc a[href="#${id}"]`);
      if (active) active.classList.add("toc-active");
    });
  }, { threshold: 0.15, rootMargin: "-80px 0px -60% 0px" });

  sections.forEach(s => tocObserver.observe(s));
}

// ── Header text ────────────────────────────────────────────────────────────────

function setHeaderText(root) {
  const h1 = root.querySelector("h1");
  if (h1) document.getElementById("page-title").textContent = h1.textContent;
  const altTitleLine = [...root.querySelectorAll("p")].find(p =>
    p.textContent.toLowerCase().includes("alternative title")
  );
  const subtitleTarget = document.getElementById("page-subtitle");
  if (altTitleLine && subtitleTarget) {
    subtitleTarget.textContent = altTitleLine.textContent;
  }
}

// ── Status ─────────────────────────────────────────────────────────────────────

function setLastLoaded() {
  document.getElementById("last-loaded").textContent = new Date().toLocaleString();
}

function setAutoRefreshStatus(text, state = "ok") {
  const status = document.getElementById("auto-refresh-status");
  if (!status) return;
  status.textContent = text;
  status.classList.remove("status-ok", "status-update", "status-error");
  status.classList.add(`status-${state}`);
}

// ── Collapsible sections ────────────────────────────────────────────────────────

function buildCollapsibleSections(root) {
  const children = Array.from(root.children);
  if (!children.some(c => c.tagName === "H2")) return;

  const fragment = document.createDocumentFragment();
  let i = 0;
  let sectionCount = 0;

  while (i < children.length) {
    const current = children[i];

    if (current.tagName !== "H2") {
      fragment.appendChild(current);
      i++;
      continue;
    }

    sectionCount++;
    const section = document.createElement("details");
    section.className = "collapsible-section";
    section.open = true;
    section.id = current.id;

    const summary = document.createElement("summary");
    summary.className = "collapsible-summary";

    const left = document.createElement("span");
    left.className = "summary-left";

    const badge = document.createElement("span");
    badge.className = "section-badge";
    badge.textContent = String(sectionCount).padStart(2, "0");

    const titleSpan = document.createElement("span");
    titleSpan.className = "summary-title";
    titleSpan.textContent = current.textContent;

    left.appendChild(badge);
    left.appendChild(titleSpan);

    const anchor = document.createElement("a");
    anchor.className = "summary-anchor";
    anchor.href = `#${current.id}`;
    anchor.textContent = "#";
    anchor.setAttribute("aria-label", `Link to ${current.textContent}`);
    anchor.addEventListener("click", e => e.stopPropagation());

    summary.appendChild(left);
    summary.appendChild(anchor);
    section.appendChild(summary);

    const body = document.createElement("div");
    body.className = "collapsible-body";
    i++;
    while (i < children.length && children[i].tagName !== "H2") {
      body.appendChild(children[i]);
      i++;
    }

    section.appendChild(body);
    fragment.appendChild(section);
  }

  root.innerHTML = "";
  root.appendChild(fragment);
}

// ── Injected visuals ────────────────────────────────────────────────────────────

function injectPipelineDiagram(root) {
  // Find the Study Objectives section and inject the pipeline after its intro paragraph
  const sections = root.querySelectorAll("details.collapsible-section");
  let targetBody = null;
  sections.forEach(s => {
    if (/study objectives/i.test(s.querySelector(".summary-title")?.textContent || "")) {
      targetBody = s.querySelector(".collapsible-body");
    }
  });
  if (!targetBody) return;

  const steps = [
    { num: "01", title: "Endpoints",     sub: "Define motion labels\nfrom fiducials",  color: "#a04828" },
    { num: "02", title: "Geometry",      sub: "Anatomical feature\nextraction",        color: "#b85a30" },
    { num: "03", title: "Deep Learning", sub: "3D CNN from\nplanning CT",              color: "#c96840" },
    { num: "04", title: "MAISI",         sub: "Foundation model\nrepresentations",     color: "#d97850" },
    { num: "05", title: "Triage",        sub: "Retrospective\nvirtual triage",         color: "#b07030" },
  ];

  const W = 900, H = 130, boxW = 130, boxH = 84, gap = 42, startX = 32, cy = H / 2;

  let svgParts = [
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-label="Study workflow pipeline">`,
    `<defs>`,
    `<linearGradient id="pipe-bg" x1="0%" y1="0%" x2="100%" y2="0%">`,
    `<stop offset="0%"   stop-color="#c96240" stop-opacity="0.12"/>`,
    `<stop offset="100%" stop-color="#b07030" stop-opacity="0.12"/>`,
    `</linearGradient>`,
    `<filter id="node-shadow" x="-10%" y="-15%" width="120%" height="135%">`,
    `<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#c96240" flood-opacity="0.28"/>`,
    `</filter>`,
    `</defs>`,
    `<rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="url(#pipe-bg)"/>`,
  ];

  steps.forEach((step, idx) => {
    const x = startX + idx * (boxW + gap);
    const rx = 10;

    // Arrow between boxes
    if (idx > 0) {
      const ax = x - gap + 2;
      const ay = cy;
      svgParts.push(
        `<line x1="${ax - boxW/2 + 2}" y1="${ay}" x2="${ax + gap - 4}" y2="${ay}"`,
        ` stroke="${step.color}" stroke-width="2" stroke-opacity="0.5" stroke-dasharray="4 3"/>`,
        `<polygon points="${ax + gap - 2},${ay} ${ax + gap - 8},${ay - 4} ${ax + gap - 8},${ay + 4}"`,
        ` fill="${step.color}" opacity="0.6"/>`
      );
    }

    // Box
    svgParts.push(
      `<rect x="${x}" y="${cy - boxH/2}" width="${boxW}" height="${boxH}" rx="${rx}"`,
      ` fill="${step.color}" filter="url(#node-shadow)" opacity="0.9"/>`,

      // Number badge
      `<text x="${x + 12}" y="${cy - boxH/2 + 16}" font-family="'DM Sans',sans-serif"`,
      ` font-size="10" font-weight="800" fill="rgba(255,255,255,0.65)">${step.num}</text>`,

      // Title
      `<text x="${x + boxW/2}" y="${cy - 6}" text-anchor="middle" dominant-baseline="middle"`,
      ` font-family="'DM Sans',sans-serif" font-size="13" font-weight="700" fill="#ffffff">${step.title}</text>`,
    );

    // Subtitle (handle newline)
    const subs = step.sub.split("\n");
    subs.forEach((line, li) => {
      svgParts.push(
        `<text x="${x + boxW/2}" y="${cy + 14 + li * 13}" text-anchor="middle"`,
        ` font-family="'DM Sans',sans-serif" font-size="10" fill="rgba(255,255,255,0.78)">${line}</text>`
      );
    });
  });

  svgParts.push(`</svg>`);

  const wrapper = document.createElement("div");
  wrapper.className = "pipeline-diagram";
  wrapper.innerHTML = svgParts.join("");

  // Insert after first H3 or before first H3
  const firstH3 = targetBody.querySelector("h3");
  if (firstH3) {
    targetBody.insertBefore(wrapper, firstH3);
  } else {
    targetBody.prepend(wrapper);
  }
}

function injectRiskVisual(root) {
  const sections = root.querySelectorAll("details.collapsible-section");
  let targetBody = null;
  sections.forEach(s => {
    if (/retrospective virtual triage/i.test(s.querySelector(".summary-title")?.textContent || "")) {
      targetBody = s.querySelector(".collapsible-body");
    }
  });
  if (!targetBody) return;

  const bands = [
    { cls: "risk-band-low",  icon: "○", label: "Low Risk",   text: "Standard workflow · standard margins · routine preparation" },
    { cls: "risk-band-mid",  icon: "◑", label: "Intermediate", text: "Stricter preparation · early additional verification" },
    { cls: "risk-band-high", icon: "●", label: "High Risk",  text: "Real-time tracking · adaptive workflow · individualized margins" },
  ];

  const wrapper = document.createElement("div");
  wrapper.className = "risk-visual";
  bands.forEach(b => {
    const band = document.createElement("div");
    band.className = `risk-band ${b.cls}`;
    band.innerHTML = `
      <div class="risk-band-icon">${b.icon}</div>
      <div class="risk-band-label">${b.label}</div>
      <div class="risk-band-text">${b.text}</div>
    `;
    wrapper.appendChild(band);
  });

  // Insert before the first table in that section
  const firstTable = targetBody.querySelector("table");
  if (firstTable) targetBody.insertBefore(wrapper, firstTable);
  else targetBody.prepend(wrapper);
}

function colorRiskTableRows(root) {
  // Find tables that have rows starting with Low risk / Intermediate / High risk
  root.querySelectorAll("table tbody tr").forEach(row => {
    const first = row.querySelector("td")?.textContent?.trim().toLowerCase() || "";
    if (/^low risk/.test(first))          row.classList.add("risk-low");
    else if (/^intermediate risk/.test(first)) row.classList.add("risk-mid");
    else if (/^high risk/.test(first))    row.classList.add("risk-high");
  });
}

// ── Scroll / hash helpers ──────────────────────────────────────────────────────

function openSectionFromHash() {
  const id = decodeURIComponent(window.location.hash.replace("#", "")).trim();
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  if (target.matches("details.collapsible-section")) { target.open = true; return; }
  const parent = target.closest("details.collapsible-section");
  if (parent) parent.open = true;
}

function getOpenSectionIds() {
  return new Set(
    [...document.querySelectorAll("details.collapsible-section[open]")]
      .map(s => s.id).filter(Boolean)
  );
}

function restoreOpenSectionIds(openIds) {
  if (!openIds || openIds.size === 0) return;
  document.querySelectorAll("details.collapsible-section").forEach(s => {
    s.open = openIds.has(s.id);
  });
}

// ── Render ─────────────────────────────────────────────────────────────────────

async function renderMarkdown(markdownText, preservedOpenSectionIds = null) {
  const root = document.getElementById("markdown-root");
  try {
    const markdown = markdownText || (await fetchMarkdownText());
    lastMarkdownHash = hashText(markdown);
    root.innerHTML = marked.parse(markdown);

    const headings = addHeadingIds(root);
    buildCollapsibleSections(root);
    restoreOpenSectionIds(preservedOpenSectionIds);
    buildToc(headings);
    setHeaderText(root);
    setLastLoaded();
    openSectionFromHash();
    activeTocTracking();

    // Inject visual elements
    injectPipelineDiagram(root);
    injectRiskVisual(root);
    colorRiskTableRows(root);

    setAutoRefreshStatus(`Auto refresh: on (every ${autoRefreshMs / 1000}s)`, "ok");
  } catch (error) {
    root.innerHTML = `
      <h2>Cannot load markdown file</h2>
      <p>${error.message}</p>
      <p>Make sure <strong>${markdownFilePath}</strong> is in the same folder and served by a local server.</p>
    `;
    setAutoRefreshStatus("Auto refresh: file unavailable", "error");
  }
}

// ── Auto-refresh ───────────────────────────────────────────────────────────────

async function pollMarkdownChanges() {
  try {
    const markdown = await fetchMarkdownText();
    const nextHash = hashText(markdown);
    if (!lastMarkdownHash) { await renderMarkdown(markdown); return; }
    if (nextHash !== lastMarkdownHash) {
      const openIds = getOpenSectionIds();
      await renderMarkdown(markdown, openIds);
      setAutoRefreshStatus("Auto refresh: updated", "update");
      setTimeout(() => setAutoRefreshStatus(`Auto refresh: on (every ${autoRefreshMs / 1000}s)`, "ok"), 1400);
    }
  } catch {
    setAutoRefreshStatus("Auto refresh: waiting for server", "error");
  }
}

function startAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(pollMarkdownChanges, autoRefreshMs);
}

// ── Theme ──────────────────────────────────────────────────────────────────────

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem(themeStorageKey, theme);
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) btn.textContent = theme === "dark" ? "Use Light Mode" : "Use Dark Mode";
}

function initializeTheme() {
  const stored = localStorage.getItem(themeStorageKey);
  if (stored === "dark" || stored === "light") { applyTheme(stored); return; }
  applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

// ── Button bindings ────────────────────────────────────────────────────────────

function bindButtons() {
  const copyBtn = document.getElementById("copy-link-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const orig = copyBtn.textContent;
      try {
        await navigator.clipboard.writeText(window.location.href);
        copyBtn.textContent = "Link copied!";
      } catch {
        copyBtn.textContent = "Copy failed";
      }
      setTimeout(() => { copyBtn.textContent = orig; }, 1400);
    });
  }

  document.getElementById("theme-toggle-btn")?.addEventListener("click", () => {
    applyTheme(document.body.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  document.getElementById("export-pdf-btn")?.addEventListener("click", () => window.print());

  document.getElementById("expand-all-btn")?.addEventListener("click", () => {
    document.querySelectorAll("details.collapsible-section").forEach(s => { s.open = true; });
  });

  document.getElementById("collapse-all-btn")?.addEventListener("click", () => {
    document.querySelectorAll("details.collapsible-section").forEach(s => { s.open = false; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ── Boot ───────────────────────────────────────────────────────────────────────

initializeTheme();
bindButtons();
renderMarkdown();
startAutoRefresh();
window.addEventListener("hashchange", openSectionFromHash);
