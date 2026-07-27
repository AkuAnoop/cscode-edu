const grid = document.getElementById("classes-grid");
const termLabel = document.getElementById("term-label");
const yearEl = document.getElementById("year");
const filterTabs = document.querySelectorAll(".filter-tab");

let allClasses = [];
let activeFilter = "all";

if (yearEl) yearEl.textContent = new Date().getFullYear();

const icons = {
  STEM: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M7 8l3 3 4-4 3 3"/></svg>`,
  Arts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.2"/><circle cx="12" cy="8" r="1.2"/><circle cx="15.5" cy="10.5" r="1.2"/></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"/></svg>`,
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function createClassCard(classInfo) {
  const card = document.createElement("article");
  card.className = "class-card";
  card.dataset.category = classInfo.category || "Other";
  card.dataset.code = classInfo.code;

  const gradient = classInfo.gradient || "purple";
  const icon = icons[classInfo.category] || icons.default;

  const notesHtml = classInfo.notes
    ? `<div class="class-notes">${escapeHtml(classInfo.notes)}</div>`
    : "";

  const headerStyle = classInfo.image
    ? ` style="background-image:url('${escapeHtml(classInfo.image)}')"`
    : "";
  const headerClass = classInfo.image
    ? "class-card-header has-image"
    : `class-card-header gradient-${escapeHtml(gradient)}`;

  card.innerHTML = `
    <div class="${headerClass}"${headerStyle}>
      ${classInfo.image ? "" : `<div class="class-card-icon" aria-hidden="true">${icon}</div>`}
    </div>
    <div class="class-card-body">
      <span class="class-category">${escapeHtml(classInfo.category || "Course")}</span>
      <h3>${escapeHtml(classInfo.name)}</h3>
      <p class="class-code-label">${escapeHtml(classInfo.code)}</p>
      <p class="class-description">${escapeHtml(classInfo.description)}</p>
      <div class="class-meta">
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>
          ${escapeHtml(classInfo.instructor)}
        </span>
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>
          ${escapeHtml(classInfo.schedule || "Schedule TBA")}
        </span>
      </div>
      ${notesHtml}
      <p class="card-likes" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.7-9.6-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.6 12c-2.1 4.3-9.6 9-9.6 9z"/></svg>
        <span class="card-like-count">0</span> likes
      </p>
      <a class="class-enroll" href="notes.html?class=${encodeURIComponent(classInfo.code)}">View notes</a>
    </div>
  `;

  return card;
}

function renderClasses() {
  grid.innerHTML = "";

  const filtered =
    activeFilter === "all"
      ? allClasses
      : allClasses.filter((c) => c.category === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML =
      '<p class="empty-state">No classes in this category yet.</p>';
    return;
  }

  filtered.forEach((classInfo) => {
    grid.appendChild(createClassCard(classInfo));
  });

  attachCardLikeCounts();
}

function setupFilters() {
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter;

      filterTabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle("active", isActive);
        t.setAttribute("aria-selected", isActive);
      });

      renderClasses();
    });
  });
}

async function loadClasses() {
  if (!grid) return;

  try {
    const response = await fetch("data/classes.json");
    if (!response.ok) throw new Error("Failed to load classes");

    const data = await response.json();

    if (data.term && termLabel) {
      termLabel.textContent = data.term;
    }

    allClasses = data.classes || [];

    if (allClasses.length === 0) {
      grid.innerHTML =
        '<p class="empty-state">No classes yet. Add them in <code>data/classes.json</code>.</p>';
      return;
    }

    setupFilters();
    renderClasses();
  } catch (error) {
    grid.innerHTML =
      '<p class="empty-state">Could not load classes. Open this site with a local server (see README).</p>';
    console.error(error);
  }
}

/* ── Live floating balls ── */

function initBalls() {
  const canvas = document.getElementById("balls");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  const palette = ["#ffffff", "#ede9fe", "#c4b5fd", "#a78bfa", "#ddd6fe"];
  let balls = [];
  let width = 0;
  let height = 0;
  const pointer = { x: -9999, y: -9999 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeBalls() {
    const count = Math.max(14, Math.min(38, Math.round(width / 40)));
    balls = Array.from({ length: count }, () => {
      const r = 6 + Math.random() * 26;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.14 + Math.random() * 0.3,
      };
    });
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    balls.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;

      if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; }
      if (b.x + b.r > width) { b.x = width - b.r; b.vx *= -1; }
      if (b.y - b.r < 0) { b.y = b.r; b.vy *= -1; }
      if (b.y + b.r > height) { b.y = height - b.r; b.vy *= -1; }

      // gentle push away from the cursor
      const dx = b.x - pointer.x;
      const dy = b.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 130 && dist > 0.1) {
        const push = (130 - dist) / 130 * 0.6;
        b.x += (dx / dist) * push;
        b.y += (dy / dist) * push;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = b.alpha;
      ctx.fill();

      ctx.globalAlpha = b.alpha * 0.8;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  function setup() {
    resize();
    makeBalls();
  }

  setup();
  window.addEventListener("resize", setup);

  // The classes grid renders after fetch, which changes the canvas height —
  // re-measure whenever the canvas box actually changes size.
  if (window.ResizeObserver) {
    let lastW = 0;
    let lastH = 0;
    new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      if (Math.abs(rect.width - lastW) < 1 && Math.abs(rect.height - lastH) < 1) return;
      lastW = rect.width;
      lastH = rect.height;
      setup();
    }).observe(canvas);
  }
  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  requestAnimationFrame(step);
}

/* ── Signup form ── */

function initSignupForm() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  const statusEl = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");
  const courseSelect = document.getElementById("course");
  const notifyEmail = form.dataset.email;

  // Populate the class dropdown from the same data the classes page uses.
  if (courseSelect) {
    fetch("data/classes.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !data.classes) return;
        data.classes.forEach((c) => {
          const opt = document.createElement("option");
          opt.value = `${c.code} — ${c.name}`;
          opt.textContent = `${c.code} — ${c.name}`;
          courseSelect.appendChild(opt);
        });
        const other = document.createElement("option");
        other.value = "Not sure yet";
        other.textContent = "Not sure yet";
        courseSelect.appendChild(other);
      })
      .catch(() => {});
  }

  function setError(name, message) {
    const input = form.querySelector(`[name="${name}"]`);
    const errorEl = form.querySelector(`.field-error[data-for="${name}"]`);
    if (input) input.classList.toggle("invalid", Boolean(message));
    if (errorEl) errorEl.textContent = message || "";
  }

  function validateGradeAverage(value, scale) {
    if (!value) return "Please enter your current grade average.";

    if (scale === "GPA (4.0 scale)") {
      const num = parseFloat(value);
      if (Number.isNaN(num) || num < 0 || num > 5) {
        return "Enter a GPA between 0 and 5 (e.g. 3.8).";
      }
      return "";
    }

    if (scale === "Percentage (0-100)") {
      const num = parseFloat(value.replace("%", ""));
      if (Number.isNaN(num) || num < 0 || num > 100) {
        return "Enter a percentage between 0 and 100 (e.g. 92).";
      }
      return "";
    }

    if (scale === "Letter grade") {
      if (!/^[A-Fa-f][+-]?$/.test(value.trim())) {
        return "Enter a letter grade like A, B+, or C-.";
      }
      return "";
    }

    return "";
  }

  function validate() {
    let ok = true;
    const name = form.name_.value.trim();
    const email = form.email.value.trim();
    const course = form.course.value;
    const gradeLevel = form.grade_level.value;
    const gradeScale = form.grade_scale.value;
    const gradeAverage = form.grade_average.value.trim();

    if (name.length < 2) {
      setError("name", "Please enter your name.");
      ok = false;
    } else setError("name", "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("email", "Please enter a valid email address.");
      ok = false;
    } else setError("email", "");

    if (!gradeLevel) {
      setError("grade_level", "Select your grade level.");
      ok = false;
    } else setError("grade_level", "");

    if (!gradeScale) {
      setError("grade_scale", "Pick how your grades are measured.");
      ok = false;
    } else setError("grade_scale", "");

    const gradeError = validateGradeAverage(gradeAverage, gradeScale);
    if (gradeError) {
      setError("grade_average", gradeError);
      ok = false;
    } else setError("grade_average", "");

    if (!course) {
      setError("course", "Pick a class so I know what to reply about.");
      ok = false;
    } else setError("course", "");

    return ok;
  }

  // `form.name` collides with the form's own name property, so alias it.
  Object.defineProperty(form, "name_", {
    get: () => form.querySelector('[name="name"]'),
  });

  ["name", "email", "course", "grade_level", "grade_scale", "grade_average"].forEach((field) => {
    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      input.addEventListener("input", () => setError(field, ""));
      input.addEventListener("change", () => setError(field, ""));
    }
  });

  /* Enrollment window: the form stays locked until data-opens passes. */
  const opensAttr = form.dataset.opens;
  const opensAt = opensAttr ? new Date(`${opensAttr}T00:00:00`) : null;
  const gate = document.getElementById("enroll-gate");
  const gateSub = document.getElementById("gate-sub");
  const gateTitle = document.getElementById("gate-title");

  function isOpen() {
    return !opensAt || Number.isNaN(opensAt.getTime()) || Date.now() >= opensAt.getTime();
  }

  function formatOpenDate() {
    return opensAt.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function countdownText() {
    const ms = opensAt.getTime() - Date.now();
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);

    if (days > 0) return `${days} day${days === 1 ? "" : "s"}, ${hours} hr ${mins} min`;
    if (hours > 0) return `${hours} hr ${mins} min ${secs} sec`;
    if (mins > 0) return `${mins} min ${secs} sec`;
    return `${secs} sec`;
  }

  function lockForm(locked) {
    form
      .querySelectorAll("input:not([type=hidden]), select, textarea, button")
      .forEach((el) => {
        if (el.classList.contains("hp-field")) return;
        el.disabled = locked;
      });
    form.classList.toggle("is-locked", locked);
    if (gate) gate.hidden = !locked;
  }

  function refreshGate() {
    if (isOpen()) {
      lockForm(false);
      if (gate) gate.hidden = true;
      return true;
    }

    lockForm(true);
    if (gateTitle) {
      gateTitle.textContent = `Enrollment opens ${formatOpenDate()}`;
    }
    if (gateSub) {
      gateSub.textContent = `Opens in ${countdownText()}. Come back then to sign up.`;
    }
    return false;
  }

  if (opensAt && !Number.isNaN(opensAt.getTime())) {
    refreshGate();
    setInterval(refreshGate, 1000);
  }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `form-status ${type || ""}`.trim();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isOpen()) {
      setStatus(
        `Enrollment doesn't open until ${formatOpenDate()}.`,
        "warn"
      );
      return;
    }

    if (!validate()) {
      setStatus("Please fix the highlighted fields.", "error");
      return;
    }

    if (!notifyEmail) {
      setStatus(
        "This form isn't pointed at an inbox yet — add data-email=\"you@example.com\" to the form tag in enroll.html.",
        "warn"
      );
      return;
    }

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    setStatus("Sending…", "");

    const payload = Object.fromEntries(new FormData(form).entries());
    payload._replyto = payload.email;

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(notifyEmail)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();

      if (response.ok && String(result.success) === "true") {
        form.reset();
        setStatus(
          "Thanks! Your signup was sent — I'll get an email and reply soon.",
          "success"
        );
      } else {
        setStatus(
          result.message ||
            "Something went wrong sending your signup. Please try again.",
          "error"
        );
      }
    } catch (error) {
      setStatus(
        "Couldn't reach the mail service. Check your connection and try again.",
        "error"
      );
      console.error(error);
    } finally {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  });
}

/* ── Notes page ── */

function initNotesPage() {
  const body = document.getElementById("notes-body");
  if (!body) return;

  const toc = document.getElementById("notes-toc");
  const params = new URLSearchParams(window.location.search);
  const code = params.get("class");

  function slug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function renderTopic(topic, index) {
    const id = slug(topic.title);

    const problems = (topic.problems || [])
      .map(
        (p, i) => `
        <details class="problem">
          <summary>
            <span class="problem-num">Q${i + 1}</span>
            ${escapeHtml(p.q)}
          </summary>
          <div class="problem-answer">${escapeHtml(p.a)}</div>
        </details>`
      )
      .join("");

    const example = topic.example
      ? `
      <figure class="example">
        <figcaption>
          <span class="example-tag">Example</span>
          ${escapeHtml(topic.example.label)}
        </figcaption>
        <pre class="example-code" data-lang="${escapeHtml(topic.example.lang || "text")}"><code>${escapeHtml(topic.example.code)}</code></pre>
      </figure>`
      : "";

    return `
      <article class="topic" id="${id}">
        <p class="topic-index">Topic ${index + 1}</p>
        <h2>${escapeHtml(topic.title)}</h2>
        <p class="topic-body">${escapeHtml(topic.body)}</p>
        ${example}
        ${problems ? `<div class="problems"><h3>Practice</h3>${problems}</div>` : ""}
      </article>`;
  }

  function showError(message) {
    body.innerHTML = `<p class="notes-error">${escapeHtml(message)}</p>`;
  }

  if (!code) {
    showError("No class selected. Head back to the classes page and pick one.");
    return;
  }

  Promise.all([
    fetch("data/notes.json").then((r) => (r.ok ? r.json() : Promise.reject())),
    fetch("data/classes.json").then((r) => (r.ok ? r.json() : Promise.reject())),
  ])
    .then(([notes, classData]) => {
      const entry = notes[code];
      const classInfo = (classData.classes || []).find((c) => c.code === code);

      if (!entry) {
        showError(`No notes written yet for ${code}. Check back soon.`);
        return;
      }

      document.getElementById("notes-code").textContent = code;
      document.getElementById("notes-title").textContent = classInfo
        ? classInfo.name
        : code;
      document.getElementById("notes-tagline").textContent = entry.tagline || "";
      document.title = `${code} Notes — CSCODE EDU`;

      const meta = document.getElementById("notes-meta");
      if (meta && classInfo) {
        meta.innerHTML = `
          <span class="notes-chip">${escapeHtml(classInfo.instructor)}</span>
          <span class="notes-chip">${escapeHtml(classInfo.schedule || "Schedule TBA")}</span>
          <span class="notes-chip">${entry.topics.length} topics</span>`;
      }

      initLikeButton(code);

      body.innerHTML = entry.topics.map(renderTopic).join("");

      if (toc) {
        toc.innerHTML = `
          <p class="toc-label">On this page</p>
          <ul>
            ${entry.topics
              .map(
                (t) =>
                  `<li><a href="#${slug(t.title)}">${escapeHtml(t.title)}</a></li>`
              )
              .join("")}
          </ul>`;
      }
    })
    .catch(() => {
      showError(
        "Could not load notes. Make sure the site is running through a local server."
      );
    });
}

/* ── Likes (real, persisted) ──────────────────────────────────────────
   Backed by Abacus (abacus.jasoncameron.dev) — a free counter API with no
   signup. Counts are stored on their server, so they persist across
   visitors and devices. Change LIKE_NS if you ever want to reset to zero.

   Caveat worth knowing: this is a public counter. Anyone who knows the URL
   could bump it manually. Fine for a class site; not audited voting.
─────────────────────────────────────────────────────────────────────── */

const LIKE_API = "https://abacus.jasoncameron.dev";
const LIKE_NS = "cscode-edu-akuanoop-v1";

function likeKey(code) {
  return "like-" + code.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function likedAlready(code) {
  try {
    return localStorage.getItem("csedu-liked-" + likeKey(code)) === "1";
  } catch (e) {
    return false;
  }
}

function markLiked(code, on) {
  try {
    if (on) localStorage.setItem("csedu-liked-" + likeKey(code), "1");
    else localStorage.removeItem("csedu-liked-" + likeKey(code));
  } catch (e) {
    /* private mode — counting still works, just no memory */
  }
}

async function readLikes(code) {
  const r = await fetch(`${LIKE_API}/get/${LIKE_NS}/${likeKey(code)}`, {
    cache: "no-store",
  });
  // A class nobody has liked yet simply has no counter record — that's 0,
  // not an error.
  if (r.status === 404) return 0;
  if (!r.ok) throw new Error("count unavailable");
  return (await r.json()).value || 0;
}

async function addLike(code) {
  const r = await fetch(`${LIKE_API}/hit/${LIKE_NS}/${likeKey(code)}`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error("could not save like");
  return (await r.json()).value || 0;
}

function initLikeButton(code) {
  const mount = document.getElementById("like-mount");
  if (!mount || !code) return;

  const liked = likedAlready(code);

  mount.innerHTML = `
    <button class="like-btn${liked ? " liked" : ""}" type="button" id="like-btn"
            aria-pressed="${liked}">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s-7.5-4.7-9.6-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.6 12c-2.1 4.3-9.6 9-9.6 9z"/>
      </svg>
      <span class="like-label">${liked ? "Liked" : "Like this class"}</span>
      <span class="like-count" id="like-count">·</span>
    </button>`;

  const btn = document.getElementById("like-btn");
  const countEl = document.getElementById("like-count");

  readLikes(code)
    .then((n) => (countEl.textContent = n))
    .catch(() => (countEl.textContent = "–"));

  btn.addEventListener("click", async () => {
    if (btn.dataset.busy) return;

    // Already liked → just un-highlight locally. The stored total only ever
    // goes up, so we don't fake a decrement.
    if (btn.classList.contains("liked")) {
      btn.classList.remove("liked");
      btn.setAttribute("aria-pressed", "false");
      btn.querySelector(".like-label").textContent = "Like this class";
      markLiked(code, false);
      return;
    }

    btn.dataset.busy = "1";
    try {
      const n = await addLike(code);
      countEl.textContent = n;
      btn.classList.add("liked", "pop");
      btn.setAttribute("aria-pressed", "true");
      btn.querySelector(".like-label").textContent = "Liked";
      markLiked(code, true);
      setTimeout(() => btn.classList.remove("pop"), 400);
    } catch (e) {
      btn.querySelector(".like-label").textContent = "Couldn't save — retry";
    } finally {
      delete btn.dataset.busy;
    }
  });
}

function attachCardLikeCounts() {
  document.querySelectorAll(".class-card[data-code]").forEach((card) => {
    const code = card.dataset.code;
    const el = card.querySelector(".card-like-count");
    if (!el) return;
    readLikes(code)
      .then((n) => {
        el.textContent = n;
        el.closest(".card-likes").hidden = false;
      })
      .catch(() => {});
  });
}

/* ── Real page-view counting ──────────────────────────────────────────
   Every page load bumps a counter for that page, using the same free
   Abacus service as likes. Gives true cumulative view totals per page.

   What it does NOT give you: unique visitors, a timeline of when views
   happened, referrers, or devices. For that, set up GoatCounter (see the
   commented block at the bottom of index.html).
─────────────────────────────────────────────────────────────────────── */

const VIEW_PAGES = {
  "index.html": "Home",
  "classes.html": "Classes",
  "notes.html": "Class notes",
  "updates.html": "Updates",
  "enroll.html": "Sign Up",
};

function currentPageFile() {
  const file = window.location.pathname.split("/").pop();
  return !file || file === "" ? "index.html" : file;
}

function viewKey(file) {
  return "view-" + file.replace(/\.html$/, "").replace(/[^a-z0-9]+/gi, "-");
}

function ownerOptedOut() {
  try {
    return localStorage.getItem("csedu-dont-count-me") === "1";
  } catch (e) {
    return false;
  }
}

async function readViews(file) {
  const r = await fetch(`${LIKE_API}/get/${LIKE_NS}/${viewKey(file)}`, {
    cache: "no-store",
  });
  if (r.status === 404) return 0;
  if (!r.ok) throw new Error("view count unavailable");
  return (await r.json()).value || 0;
}

function countThisView() {
  const file = currentPageFile();

  // Don't count the private dashboard, and don't count the owner.
  if (file === "stats.html" || ownerOptedOut()) return;
  if (!VIEW_PAGES[file]) return;

  fetch(`${LIKE_API}/hit/${LIKE_NS}/${viewKey(file)}`, {
    cache: "no-store",
  }).catch(() => {
    /* counting is best-effort — never break the page over it */
  });
}

/* ── Live viewer counter ──────────────────────────────────────────────
   NOTE: this number is simulated, not real analytics. It drifts around a
   believable baseline that rises in the evening. To remove it entirely,
   delete this function and the initViewerCount() call at the bottom.
─────────────────────────────────────────────────────────────────────── */

function initViewerCount() {
  if (document.querySelector(".viewer-pill")) return;

  const pill = document.createElement("div");
  pill.className = "viewer-pill";
  pill.innerHTML = `
    <span class="viewer-dot" aria-hidden="true"></span>
    <span class="viewer-text"><strong id="viewer-num">1</strong> people viewing right now</span>`;
  document.body.appendChild(pill);

  const numEl = pill.querySelector("#viewer-num");

  // Baseline shifts with time of day so it doesn't feel random.
  function baseline() {
    const hour = new Date().getHours();
    if (hour >= 1 && hour < 7) return 4;    // overnight
    if (hour < 12) return 11;               // morning
    if (hour < 17) return 17;               // afternoon
    if (hour < 22) return 24;               // evening peak
    return 9;                               // late night
  }

  let current = baseline() + Math.floor(Math.random() * 5) - 2;

  function tick() {
    const target = baseline();
    // drift toward the baseline, with a little noise
    const pull = current < target ? 1 : current > target ? -1 : 0;
    const noise = Math.random() < 0.55 ? (Math.random() < 0.5 ? -1 : 1) : 0;

    current = Math.max(2, current + pull * (Math.random() < 0.4 ? 1 : 0) + noise);

    numEl.textContent = current;
    const tail = pill.querySelector(".viewer-text").lastChild;
    if (tail && tail.nodeType === Node.TEXT_NODE) {
      tail.textContent =
        current === 1 ? " person viewing right now" : " people viewing right now";
    }

    setTimeout(tick, 2500 + Math.random() * 4000);
  }

  numEl.textContent = current;
  setTimeout(tick, 2000);
}

loadClasses();
initBalls();
initSignupForm();
initNotesPage();
initViewerCount();
countThisView();
