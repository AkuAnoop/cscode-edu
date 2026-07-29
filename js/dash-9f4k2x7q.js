/* CSCODE EDU — full dashboard.
   Reads the real counters, tracks change over time, and reports setup status.
   Depends on readLikes(), readViews(), VIEW_PAGES, LIKE_API, LIKE_NS from main.js. */

(function () {
  const el = (id) => document.getElementById(id);
  if (!el("view-rows")) return;

  const SNAP_KEY = "csedu-stat-history";
  const MAX_SNAPS = 60;

  function esc(t) {
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  }

  /* ── history stored on this device ── */

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(SNAP_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveSnapshot(views, likes) {
    try {
      const hist = loadHistory();
      const last = hist[hist.length - 1];
      // only record when something actually changed
      if (last && last.views === views && last.likes === likes) return hist;
      hist.push({ t: Date.now(), views, likes });
      const trimmed = hist.slice(-MAX_SNAPS);
      localStorage.setItem(SNAP_KEY, JSON.stringify(trimmed));
      return trimmed;
    } catch (e) {
      return loadHistory();
    }
  }

  function timeAgo(ms) {
    const s = Math.floor((Date.now() - ms) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  function drawChart(hist) {
    const box = el("history-chart");
    if (hist.length < 2) {
      box.innerHTML =
        '<p class="chart-empty">Not enough history yet. Every time you open this page it records a snapshot — come back later and a trend line appears here.</p>';
      return;
    }

    const w = 700;
    const h = 160;
    const pad = 28;
    const maxV = Math.max(...hist.map((p) => p.views), 1);
    const t0 = hist[0].t;
    const tSpan = Math.max(hist[hist.length - 1].t - t0, 1);

    const pts = hist.map((p) => {
      const x = pad + ((p.t - t0) / tSpan) * (w - pad * 2);
      const y = h - pad - (p.views / maxV) * (h - pad * 2);
      return [x, y];
    });

    const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
    const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;

    box.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" class="hist-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.45"/>
            <stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <line x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" stroke="#e5e7eb"/>
        <path d="${area}" fill="url(#hg)"/>
        <path d="${line}" fill="none" stroke="#7c3aed" stroke-width="2.5"
              stroke-linejoin="round" stroke-linecap="round"/>
        ${pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#5b21b6"/>`).join("")}
      </svg>
      <div class="chart-axis">
        <span>${timeAgo(hist[0].t)}</span>
        <span>${maxV} views peak</span>
        <span>now</span>
      </div>`;
  }

  /* ── owner opt-out ── */

  const optOut = el("dont-count-me");
  function syncOptOut() {
    let on = false;
    try {
      on = localStorage.getItem("csedu-dont-count-me") === "1";
    } catch (e) {}
    optOut.checked = on;
    el("owner-hint").textContent = on
      ? "Your visits from this browser are not counted."
      : "Your visits are currently counted like anyone else's.";
  }
  optOut.addEventListener("change", () => {
    try {
      if (optOut.checked) localStorage.setItem("csedu-dont-count-me", "1");
      else localStorage.removeItem("csedu-dont-count-me");
    } catch (e) {}
    syncOptOut();
  });
  syncOptOut();

  /* ── setup status ── */

  function renderSetup() {
    const gcOn = window.csAnalytics && window.csAnalytics.enabled;
    el("setup-rows").innerHTML = `
      <tr>
        <td>Private analytics (GoatCounter)</td>
        <td>${gcOn
          ? '<span class="pill ok">Connected</span>'
          : '<span class="pill warn">Not set up</span>'}</td>
        <td class="muted">${gcOn
          ? "Full history, referrers and devices in your logged-in dashboard."
          : 'Add your code in <code>js/analytics.js</code> to get timestamps and real privacy.'}</td>
      </tr>
      <tr>
        <td>Signup form emails</td>
        <td><span class="pill warn">Needs first send</span></td>
        <td class="muted">FormSubmit emails aku.anoop007@gmail.com. The first submission sends a one-time activation link you must click.</td>
      </tr>
      <tr>
        <td>Enrollment window</td>
        <td><span class="pill warn">Locked</span></td>
        <td class="muted">Form opens 1 June 2027. Visitors see a countdown until then.</td>
      </tr>`;
  }

  /* ── main load ── */

  async function load() {
    const btn = el("refresh-btn");
    btn.disabled = true;

    // views
    const files = Object.keys(VIEW_PAGES);
    const vres = await Promise.all(
      files.map(async (f) => {
        let v = null;
        try {
          v = await readViews(f);
        } catch (e) {}
        return { file: f, label: VIEW_PAGES[f], views: v };
      })
    );
    vres.sort((a, b) => (b.views || 0) - (a.views || 0));

    const totalViews = vres.filter((r) => r.views !== null).reduce((s, r) => s + r.views, 0);
    const maxViews = Math.max(...vres.map((r) => r.views || 0), 1);

    el("view-rows").innerHTML = vres
      .map(
        (r) => `
        <tr>
          <td><a href="${esc(r.file)}">${esc(r.label)}</a></td>
          <td class="barcell">
            <span class="bar" style="width:${((r.views || 0) / maxViews) * 100}%"></span>
          </td>
          <td class="num">${r.views === null ? "—" : r.views}</td>
        </tr>`
      )
      .join("");

    // likes
    let classes = [];
    try {
      classes = (await fetch("data/classes.json", { cache: "no-store" }).then((r) => r.json())).classes || [];
    } catch (e) {}

    const lres = await Promise.all(
      classes.map(async (c) => {
        let v = null;
        try {
          v = await readLikes(c.code);
        } catch (e) {}
        return { code: c.code, name: c.name, likes: v };
      })
    );
    lres.sort((a, b) => (b.likes || 0) - (a.likes || 0));

    const known = lres.filter((r) => r.likes !== null);
    const totalLikes = known.reduce((s, r) => s + r.likes, 0);
    const withLikes = known.filter((r) => r.likes > 0);

    el("like-rows").innerHTML = lres
      .map(
        (r) => `
        <tr>
          <td><a href="notes.html?class=${encodeURIComponent(r.code)}">${esc(r.name)}</a></td>
          <td class="muted">${esc(r.code)}</td>
          <td class="num">${r.likes === null ? "—" : r.likes}</td>
        </tr>`
      )
      .join("");

    // headline numbers + deltas
    const hist = loadHistory();
    const prev = hist.length ? hist[hist.length - 1] : null;

    el("total-views").textContent = totalViews;
    el("total-likes").textContent = totalLikes;
    el("top-class").textContent = withLikes.length ? withLikes[0].name : "None yet";
    el("liked-classes").textContent = `${withLikes.length} of ${lres.length} classes liked`;

    if (prev) {
      const dv = totalViews - prev.views;
      const dl = totalLikes - prev.likes;
      el("views-delta").textContent = dv > 0 ? `+${dv} since ${timeAgo(prev.t)}` : `no change since ${timeAgo(prev.t)}`;
      el("views-delta").className = "stat-delta" + (dv > 0 ? " up" : "");
      el("likes-delta").textContent = dl > 0 ? `+${dl} since ${timeAgo(prev.t)}` : `no change since ${timeAgo(prev.t)}`;
      el("likes-delta").className = "stat-delta" + (dl > 0 ? " up" : "");
    } else {
      el("views-delta").textContent = "first snapshot";
      el("likes-delta").textContent = "first snapshot";
    }

    const updated = saveSnapshot(totalViews, totalLikes);
    drawChart(updated);
    renderSetup();

    el("stats-updated").textContent = `Last checked ${new Date().toLocaleTimeString()} · ${updated.length} snapshot${updated.length === 1 ? "" : "s"} recorded on this device`;
    btn.disabled = false;
  }

  el("refresh-btn").addEventListener("click", load);
  el("clear-history").addEventListener("click", () => {
    try {
      localStorage.removeItem(SNAP_KEY);
    } catch (e) {}
    load();
  });

  load();
  setInterval(load, 60000); // refresh every minute while open
})();
