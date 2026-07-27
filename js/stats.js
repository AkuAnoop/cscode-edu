/* Stats dashboard — reads the same real counters the rest of the site writes to.
   Depends on readLikes(), readViews(), VIEW_PAGES from main.js. */

(function () {
  const likeRows = document.getElementById("stats-rows");
  const viewRows = document.getElementById("view-rows");
  if (!likeRows) return;

  const totalViewsEl = document.getElementById("total-views");
  const totalLikesEl = document.getElementById("total-likes");
  const likedEl = document.getElementById("liked-classes");
  const topEl = document.getElementById("top-class");
  const updatedEl = document.getElementById("stats-updated");
  const refreshBtn = document.getElementById("refresh-btn");
  const optOut = document.getElementById("dont-count-me");
  const optHint = document.getElementById("owner-hint");

  function esc(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }

  /* ── owner opt-out ── */

  function syncOptOut() {
    let on = false;
    try {
      on = localStorage.getItem("csedu-dont-count-me") === "1";
    } catch (e) {}
    optOut.checked = on;
    optHint.textContent = on
      ? "Your visits from this browser are not being counted."
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

  /* ── views ── */

  async function loadViews() {
    viewRows.innerHTML =
      '<tr><td colspan="2" class="stats-loading">Loading…</td></tr>';

    const files = Object.keys(VIEW_PAGES);
    const results = await Promise.all(
      files.map(async (f) => {
        let views = null;
        try {
          views = await readViews(f);
        } catch (e) {
          views = null;
        }
        return { file: f, label: VIEW_PAGES[f], views };
      })
    );

    results.sort((a, b) => (b.views || 0) - (a.views || 0));

    viewRows.innerHTML = results
      .map(
        (r) => `
        <tr>
          <td><a href="${esc(r.file)}">${esc(r.label)}</a></td>
          <td class="num">${r.views === null ? "—" : r.views}</td>
        </tr>`
      )
      .join("");

    const known = results.filter((r) => r.views !== null);
    totalViewsEl.textContent = known.reduce((s, r) => s + r.views, 0);
  }

  /* ── likes ── */

  async function loadLikes() {
    likeRows.innerHTML =
      '<tr><td colspan="3" class="stats-loading">Loading…</td></tr>';

    let classes = [];
    try {
      const data = await fetch("data/classes.json", { cache: "no-store" }).then(
        (r) => r.json()
      );
      classes = data.classes || [];
    } catch (e) {
      likeRows.innerHTML =
        '<tr><td colspan="3" class="stats-loading">Could not load the class list.</td></tr>';
      return;
    }

    const results = await Promise.all(
      classes.map(async (c) => {
        let likes = null;
        try {
          likes = await readLikes(c.code);
        } catch (e) {
          likes = null;
        }
        return { code: c.code, name: c.name, likes };
      })
    );

    results.sort((a, b) => (b.likes || 0) - (a.likes || 0));

    likeRows.innerHTML = results
      .map(
        (r) => `
        <tr>
          <td><a href="notes.html?class=${encodeURIComponent(r.code)}">${esc(r.name)}</a></td>
          <td class="muted">${esc(r.code)}</td>
          <td class="num">${r.likes === null ? "—" : r.likes}</td>
        </tr>`
      )
      .join("");

    const known = results.filter((r) => r.likes !== null);
    const withLikes = known.filter((r) => r.likes > 0);

    totalLikesEl.textContent = known.reduce((s, r) => s + r.likes, 0);
    likedEl.textContent = `${withLikes.length} of ${results.length} classes liked`;
    topEl.textContent = withLikes.length ? withLikes[0].name : "None yet";
    topEl.classList.add("stat-num-sm");
  }

  async function load() {
    refreshBtn.disabled = true;
    await Promise.all([loadViews(), loadLikes()]);
    updatedEl.textContent = `Last checked ${new Date().toLocaleTimeString()}`;
    refreshBtn.disabled = false;
  }

  refreshBtn.addEventListener("click", load);
  load();
})();
