# 8Ma Space - Setup & Launch Guide

This site is a static, multi-page website. Everything you need to launch is in this folder.

```
outputs/
├── index.html              (Home - with Inner Stability + Money quiz teasers)
├── about.html              (About)
├── challenge.html          (Free 7-Day Weekly Challenge)
├── program.html            (Signature program - links to Joy vs Pressure baseline)
├── books.html              (3 forthcoming books with waitlist forms)
├── booking.html            (1:1 sessions - Calendly embed)
├── members.html            (Members area landing - Sign In / Create Account)
├── contact.html            (Contact form)
├── thank-you.html          (Post-signup)
├── quiz-stability.html     (Inner Stability Level quiz)
├── quiz-money.html         (Money & Pressure quiz)
├── quiz-joy-pressure.html  (Joy vs Pressure pre/post course assessment)
└── assets/
    ├── style.css
    ├── script.js
    ├── quiz.js             (interactive quiz engine)
    └── photos/             (logo + portraits + book cover)
```

---

## 1) Photos

All six named photos and the round logo are already placed:
- `hero.jpg` (home)
- `about-portrait.jpg` (About page main portrait)
- `about-secondary.jpg` (About "Who I work with")
- `challenge.jpg` (Weekly Challenge)
- `program.jpg` (Program)
- `book-guide.jpg` (cover for *The Body That Gave Life*)
- `logo.png` (round 8Ma logo - used in every header and footer)
- `about.jpg` (cropped red-dress profile pic on home)

To swap any of them, just replace the file with the same name. No code changes needed.

---

## 2) Email forms - connect to Hostinger Reach

The site has these forms (all use Netlify Forms by default):

| Form | Purpose |
|---|---|
| `weekly-challenge` | Triggers the 7-day daily-email automation |
| `newsletter` | Adds to your weekly newsletter list |
| `contact` | Sends to your inbox |
| `waitlist-recovery-guide` | Waitlist for *The Body That Gave Life* |
| `waitlist-fake-unicorn` | Waitlist for *Fake Unicorn* |
| `waitlist-when-nothing-is-guaranteed` | Waitlist for *When Nothing Is Guaranteed* |
| `quiz-stability-result` | Inner Stability Quiz result + email capture |
| `quiz-money-result` | Money & Pressure Quiz result + email capture |
| `quiz-joy-pressure-result` | Joy vs Pressure baseline (pre/post course) |

**Important note about Reach:** As of early 2026, Hostinger Reach does **not** offer a copy-paste HTML embed for custom websites. For static sites you have two clean paths:

### Path A - Recommended: Bridge with Netlify Forms + Zapier

1. Host on **Netlify** (free) - drag-and-drop the `outputs` folder at https://app.netlify.com/drop.
2. Once deployed, all 9 forms above appear in **Site settings → Forms**.
3. Sign up for **Zapier** and create one Zap per form: Trigger = "Netlify → New Form Submission", Action = "Hostinger Reach → Add Subscriber to Group".
4. Map each form to its own Reach group. The 7-day Weekly Challenge automation then runs on the Reach side.

### Path B - Recreate inside Hostinger Website Builder

Forms placed inside the Builder sync to Reach automatically - but you lose the custom design. Most people stay with Path A.

---

## 3) Booking page - Calendly is wired

`booking.html` embeds your Calendly inline (`https://calendly.com/8ma-space`). Visitors can pick a time and book without leaving the site. No setup needed beyond making sure your Calendly link is active.

To change the link, edit `booking.html` and search for `data-url=`.

---

## 4) Quizzes - already working

Three interactive quizzes are fully built and working:

- **`quiz-stability.html`** - promoted on the home page
- **`quiz-money.html`** - promoted on the home page
- **`quiz-joy-pressure.html`** - promoted on the program page (taken before/after the course)

Each quiz captures the result and email via a Netlify form, so once Path A above is set up, results flow into Reach. You can build a "results" automation in Reach to email back the personalised tier description and a follow-up nurture sequence.

To edit a quiz question or tier description, open the corresponding `.html` file and look for the `<script>` block at the bottom - questions and tiers are plain JavaScript objects.

---

## 5) Members area - choose a platform

This is the one part that **can't run on a static HTML site**. Accounts, gated video lessons, and progress tracking all require a backend system. The site already has:

- A `members.html` landing page with **Sign In** and **Create Account** buttons.
- Members link in the header and footer of every page.
- A pre-course step that pushes members to the Joy vs Pressure baseline assessment.

**You need to pick a membership platform**, then point the two buttons at it. Recommended options, ordered by complexity:

### Option 1 - MemberSpace (recommended for your setup)
- **Cost:** $25–$49/mo
- **Why:** Easiest to bolt onto the existing site. You add a small script tag to your pages, MemberSpace handles signup/login/payments/gates around your video pages (you'd host the videos on Vimeo Pro or similar). No re-platforming.
- **Setup:** https://www.memberspace.com → create account → install snippet → mark which pages/sections are "members only."
- **In `members.html`** (line near the bottom): set `portalUrl` and `signupUrl` to your MemberSpace URLs.

### Option 2 - Kajabi
- **Cost:** $149+/mo
- **Why:** Replaces Hostinger Reach + Calendly + MemberSpace in one. Built-in email, courses, accounts, payments, quizzes. Most all-in-one.
- **Trade-off:** Most expensive; you re-create lessons inside Kajabi instead of hosting them yourself.
- **Setup:** Build the program inside Kajabi, then in `members.html` set `portalUrl` to your `*.kajabi.com/login` URL.

### Option 3 - Teachable
- **Cost:** $39+/mo
- **Why:** Course-focused. Video lessons, quizzes, certificates, progress tracking all native. Cleaner