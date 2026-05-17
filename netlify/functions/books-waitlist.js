// Netlify serverless function — books-waitlist.js
// Adds subscriber to the correct MailerLite waitlist group based on which book form was submitted.
// Env vars required (set in Netlify → Site settings → Environment variables):
//   MAILERLITE_API_KEY

const GROUP_MAP = {
  "waitlist-fake-unicorn":               "187582763554047051",
  "waitlist-recovery-guide":             "187582763009836082",
  "waitlist-when-nothing-is-guaranteed": "187582762549511171",
};

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let firstName = "", email = "", formName = "";
  try {
    const params = new URLSearchParams(event.body);
    firstName = (params.get("firstName") || "").trim();
    email     = (params.get("email")     || "").trim().toLowerCase();
    formName  = (params.get("form-name") || "").trim();
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
  const groupId = GROUP_MAP[formName];

  if (!apiKey) {
    console.error("MAILERLITE_API_KEY not set");
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, message: "Email service not configured" }) };
  }

  if (!groupId) {
    console.error("Unknown form name:", formName);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success: false, message: "Unknown form" }) };
  }

  try {
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept":        "application/json",
      },
      body: JSON.stringify({ email, fields: { name: firstName }, groups: [groupId] }),
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
