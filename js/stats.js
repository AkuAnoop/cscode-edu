/* Stats dashboard — reads the same real like counters the site writes to.
   Depends on LIKE_API / LIKE_NS / readLikes() from main.js. */

(function () {
  const rows = document.getElementById("stats-rows");
  if (!rows) return;

  const totalEl = document.getElementById("total-likes");
  const likedEl = document.getElementById("liked-classes");
  const topEl = document.getElementById("top-class");
  const updatedEl = document.getElementById("stats-updated");
  const refreshBtn = document.getElementById("refresh-btn");

  function esc(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }

  async function load() {
    rows.innerHTML = '<tr><td colspan="3" class="stats-loading">Loading…</td></tr>';

    let classes = [];
    try {
      const data = await fetch("data/classes.json", { cache: "no-store" }).then((r) =>
        r.json()
      );
      classes = data.classes || [];
    } catch (e) {
      rows.innerHTML =
        '<tr><td colspan="3" class="stats-loading">Could not load the class list.</td></tr>';
      return;
    }

    const results = await Promise.all(
      classes.map(async (c) => {
        let likes = null;
        try {
          likes = await readLikes(c.code);
        } catch (e) {
          likes = null; // counter unreachable
        }
        return { code: c.code, name: c.name, likes };
      })
    );

    results.sort((a, b) => (b.likes || 0) - (a.likes || 0));

    rows.innerHTML = results
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
    const total = known.reduce((s, r) => s + r.likes, 0);
    const withLikes = known.filter((r) => r.likes > 0);

    totalEl.textContent = total;
    likedEl.textContent = `${withLikes.length} of ${results.length}`;
    topEl.textContent = withLikes.length ? withLikes[0].name : "None yet";
    topEl.classList.toggle("stat-num-sm", true);

    updatedEl.textContent = `Last checked ${new Date().toLocaleTimeString()}`;
  }

  refreshBtn.addEventListener("click", load);
  load();
})();
