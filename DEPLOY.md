# Deploying to GitHub Pages

Your site is static, so GitHub Pages hosts it for free with no build step.
End result: a public link like `https://YOURNAME.github.io/cscode-edu/`

---

## Step 1 — Make a GitHub account

If you don't have one, sign up at [github.com](https://github.com). Free.

## Step 2 — Create an empty repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `cscode-edu`
3. **Public** (Pages requires public on free accounts)
4. Do **not** check "Add a README" — this folder already has one
5. Click **Create repository**

Leave that page open. You'll need the URL it shows you.

## Step 3 — Push this folder up

Open Terminal, then run these one at a time from inside the project folder.
Replace `YOURNAME` with your actual GitHub username.

```bash
cd ~/projects/akshith-site

git init
git add .
git commit -m "CSCODE EDU site"
git branch -M main
git remote add origin https://github.com/YOURNAME/cscode-edu.git
git push -u origin main
```

Git will ask you to sign in. If it asks for a password, GitHub wants a
**personal access token**, not your account password — GitHub's prompt links
to the page where you generate one.

## Step 4 — Switch Pages on

1. In your repo, click **Settings**
2. **Pages** in the left sidebar
3. Under "Build and deployment" → **Source:** `Deploy from a branch`
4. **Branch:** `main`, folder `/ (root)`
5. **Save**

Wait about a minute, then refresh. The link appears at the top of that page.

---

## Sending future changes

Any time you edit a file:

```bash
git add .
git commit -m "describe what changed"
git push
```

The live site updates itself within a minute or so.

---

## Things to know once it's public

**The signup form needs activating.** The first submission from the live site
triggers a one-time confirmation email from FormSubmit to
`aku.anoop007@gmail.com`. Click the link in it, or signups won't arrive.
Fill the form in yourself once after deploying to kick this off.

**Your email is visible in the page source.** Anyone can view-source on
`enroll.html` and read it. After activating, FormSubmit gives you a hashed
endpoint that hides the address — worth switching to if you get spam.

**The form stays locked until June 1, 2027.** That's the `data-opens`
attribute on the form tag. Friends visiting before then will see the countdown,
not a usable form. Delete that attribute if you want it open now.

**The viewer count is simulated.** It isn't real traffic. Delete the
`initViewerCount()` call at the bottom of `js/main.js` to remove it.

**Custom domain (optional).** If you buy a domain, add it under
Settings → Pages → Custom domain, and point a CNAME record at
`YOURNAME.github.io` with your registrar.
