// Netlify serverless function — challenge-signup.js
// Adds subscriber to MailerLite group; automation sends the 3-day email sequence.
// Env vars required (set in Netlify dashboard → Site settings → Environment variables):
//   MAILERLITE_API_KEY   — your MailerLite API token
//   MAILERLITE_GROUP_ID  — the ID of the "3-Day Challenge" group in MailerLite

exports.handler = async function (event) {
  // Only accept POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // --- Parse form body (URL-encoded from HTML form) ---
  let firstName = "";
  let email = "";
  try {
    const params = new URLSearchParams(event.body);
    firstName = (params.get("firstName") || "").trim();
    email = (params.get("email") || "").trim().toLowerCase();
  } catch (e) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Invalid request body" }),
    };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Valid email required" }),
    };
  }

  // Honeypot — bot-field must be empty
  const botField = new URLSearchParams(event.body).get("bot-field");
  if (botField) {
    // Silent success to confuse bots
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;

  if (!apiKey) {
    console.error("MAILERLITE_API_KEY not set");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Email service not configured" }),
    };
  }

  // --- Add / update subscriber in MailerLite ---
  try {
    const payload = {
      email,
      fields: { name: firstName },
      groups: groupId ? [groupId] : [],
    };

    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true }),
      };
    }

    // MailerLite returned an error — log it but still return 200 so the
    // user sees a success message (avoids exposing internal details).
    console.error("MailerLite API error:", JSON.stringify(data));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: data.message || "Signup failed" }),
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, message: "Unexpected error" }),
    };
  }
};
