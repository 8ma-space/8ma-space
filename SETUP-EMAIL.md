# Connecting your Weekly Challenge & Newsletter forms

Your site has two signup forms:

1. **Weekly Challenge** - should trigger a 7-day automated email sequence (one per day).
2. **Newsletter** - adds the subscriber to your weekly newsletter list.

The site form fields are already in place. You just need to point them at an email service that can send the daily automation. Here's the easiest path with each major provider.

---

## Option 1 - ConvertKit / Kit (recommended for creators)

Why: easiest "subscribe → drip a sequence" flow.

1. Create two **Forms** in Kit: "Weekly Challenge" and "Newsletter".
2. For the Weekly Challenge form, create a **Sequence** with 7 emails (Day 1–Day 7), spaced 1 day apart, and set the form to add subscribers to that sequence automatically.
3. In Kit, click your Weekly Challenge form → **Embed → HTML**. Copy the `<form action="...">` URL.
4. Open `index.html` and find this line:
   ```js
   const endpoint = "";
   ```
   For a single endpoint approach, you can either:
   - Paste your Kit form action URL between the quotes, OR
   - Replace each `<form>` block in the HTML with Kit's full embed code (cleaner).

---

## Option 2 - Mailchimp

1. Create two **Audiences** (or one audience with two **Tags**: `weekly-challenge` and `newsletter`).
2. Create a **Customer Journey** in Mailchimp triggered by the `weekly-challenge` tag, with 7 emails delayed 1 day apart.
3. Generate an embedded form: **Audience → Signup forms → Embedded forms**.
4. Copy the `action="..."` URL from Mailchimp's embed and paste it into the `endpoint` variable in `index.html`, OR swap the whole `<form>` block for Mailchimp's embed.

---

## Option 3 - MailerLite

1. Create two **Groups**: "Weekly Challenge" and "Newsletter".
2. Create an **Automation** triggered when someone joins the Weekly Challenge group, with 7 emails delayed 1 day apart.
3. Build an **Embedded form** for each group.
4. Copy the `action` URL into the `endpoint` variable, or paste the full embed in place of the existing `<form>` blocks.

---

## Where to host the site

Any static host works - drop `index.html` into one of these:

- **Netlify** (free): drag-and-drop at https://app.netlify.com/drop
- **Vercel** (free): https://vercel.com
- **GitHub Pages** (free)
- Or upload to your existing hosting via FTP/cPanel.

---

## What to customize before going live

In `index.html`:

- Replace **"Your Photo Here"** with an `<img>` tag pointing to your headshot (e.g. `<img src="natasa.jpg" alt="Natasa" />` inside the `.about-img` div).
- Update the **About** copy with your real bio.
- Update the **testimonials** with real quotes once you have them.
- Confirm the **program link** in the Offer section points to your live Launchware sales page.
- Tweak the **brand color** (`--accent` and `--accent-dark` at the top of the `<style>` block) if you have a brand palette.
- Update **page title and meta description** in `<head>` for SEO.
