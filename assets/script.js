/* =========================================================
   8ma.space - shared scripts
   - Mobile nav toggle
   - Active nav highlight
   - Footer year
   - Form handler (Web3Forms - works on any host)
   ========================================================= */

(function () {
  // ------- Footer year -------
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ------- Mobile nav toggle -------
  var toggle = document.querySelector(".nav-toggle");
  var links  = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
    // Close menu when a link is clicked
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
      });
    });
  }

  // ------- Active link highlight -------
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href) return;
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  // ------- Form handler -------
  // Challenge forms → Netlify function (triggers MailerLite 3-day sequence)
  // All other forms → Web3Forms (admin notification)
  document.querySelectorAll("form.signup-form, form.contact-form").forEach(function (form) {
    var successId = form.dataset.successId;
    var success   = successId ? document.getElementById(successId) : null;
    var submitBtn = form.querySelector('[type="submit"]');
    var handler   = form.dataset.handler;
    var endpoint  = handler === "challenge"
      ? "/.netlify/functions/challenge-signup"
      : handler === "books-waitlist"
      ? "/.netlify/functions/books-waitlist"
      : "https://api.web3forms.com/submit";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot anti-spam check
      var honey = form.querySelector('input[name="bot-field"]');
      if (honey && honey.value) return;

      // Disable button to prevent double submit
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      var isNetlifyFn = endpoint.indexOf('/.netlify/functions/') === 0;
      fetch(endpoint, {
        method: "POST",
        headers: isNetlifyFn ? { "Content-Type": "application/x-www-form-urlencoded" } : {},
        body: isNetlifyFn
          ? new URLSearchParams(new FormData(form)).toString()
          : new FormData(form)
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          if (success) {
            form.style.display = "none";
            success.classList.add("visible");
          } else {
            location.href = "thank-you.html";
          }
        } else {
          throw new Error(data.message || "Submission failed");
        }
      })
      .catch(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.label || "Send";
        }
        alert("Something went wrong. Please email natasa@8ma.space directly.");
      });
    });

    // Store original button label so we can restore it on error
    if (submitBtn) submitBtn.dataset.label = submitBtn.textContent;
  });
})();
