// Netlify serverless function — quiz-signup.js
// Adds quiz taker to MailerLite with their quiz score/tier as custom fields.
// An automation in MailerLite (triggered by group join) sends them their results.
// Env vars required:
//   MAILERLITE_API_KEY

const QUIZ_GROUPS = {
  "quiz-pressure-audit":      "187760237699139447", // Quiz - Pressure Audit
  "quiz-stability-result":    "187760241245423375", // Quiz - Inner Stability
  "quiz-money-result":        "187760242000397594", // Quiz - Money & Pressure
  "quiz-joy-pressure-result": "187760242925242099", // Quiz - Joy vs Pressure
};

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let firstName = "", email = "", formName = "";
  let score = "", band = "", title = "", description = "";

  try {
    const p = new URLSearchParams(event.body);
    firstName   = (p.get("firstName")        || "").trim();
    email       = (p.get("email")            || "").trim().toLowerCase();
    formName    = (p.get("form-name")        || "").trim();
    score       = (p.get("quiz-score")       || "").trim();
    band        = (p.get("quiz-tier")        || "").trim();
    title       = (p.get("quiz-title")       || "").trim();
    description = (p.get("quiz-description") || "").trim();
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid request" }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Valid email required" }) };
  }

  // Honeypot
  const bot = new URLSearchParams(event.body).get("bot-field");
  if (bot) return { statusCode: 200, body: JSON.stringify({ success: true }) };

  const apiKey  = process.env.MAILERLITE_API_KEY;
  const groupId = QUIZ_GROUPS[formName];

  if (!apiKey) {
    console.error("MAILERLITE_API_KEY not set");
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, message: "Email service not configured" }) };
  }

  if (!groupId) {
    console.error("Unknown quiz form name:", formName);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, message: "Unknown quiz" }) };
  }

  try {
    const payload = {
      email,
      fields: {
        name:             firstName,
        quiz_score:       score,
        quiz_band:        band,
        quiz_title:       title,
        quiz_description: description,
      },
      groups: [groupId],
    };

    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept":        "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: true }) };
    }

    console.error("MailerLite error:", JSON.stringify(data));
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, message: data.message || "Signup failed" }) };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, message: "Unexpected error" }) };
  }
};
