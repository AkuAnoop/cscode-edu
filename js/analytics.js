/* ═══════════════════════════════════════════════════════════════════════
   PRIVATE ANALYTICS — the only line you need to edit is right below.

   1. Go to https://www.goatcounter.com and sign up (free, ~1 minute).
      Pick a code when asked — e.g. "cscodeedu".
   2. Paste that code between the quotes below.
   3. Save, then re-upload this file to GitHub.

   Your dashboard then lives at https://YOURCODE.goatcounter.com and is
   behind your login — the website stays public, the numbers stay yours.

   IMPORTANT after signing up: in GoatCounter go to
   Settings → Site settings and make sure the dashboard is NOT set to
   public viewing, so it requires your login.
   ═══════════════════════════════════════════════════════════════════════ */

const GOATCOUNTER_CODE = "";

/* ─── nothing below here needs editing ─────────────────────────────── */

window.csAnalytics = {
  enabled: Boolean(GOATCOUNTER_CODE),

  // Record a custom event (used for likes). Silently does nothing until
  // GOATCOUNTER_CODE is filled in.
  event(name, title) {
    if (!window.goatcounter || !window.goatcounter.count) return;
    window.goatcounter.count({
      path: name,
      title: title || name,
      event: true,
    });
  },
};

(function loadGoatCounter() {
  if (!GOATCOUNTER_CODE) {
    console.info(
      "[CSCODE EDU] Analytics not set up yet — add your code in js/analytics.js"
    );
    return;
  }

  const s = document.createElement("script");
  s.async = true;
  s.src = "//gc.zgo.at/count.js";
  s.setAttribute(
    "data-goatcounter",
    `https://${GOATCOUNTER_CODE}.goatcounter.com/count`
  );
  document.head.appendChild(s);
})();
