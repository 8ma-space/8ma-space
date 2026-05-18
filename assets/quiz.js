/* =========================================================
   8Ma Space - Quiz engine
   Renders one-question-at-a-time quizzes from a config object.
   Usage:  new Quiz(quizConfig).mount('#quiz-root');
   ========================================================= */

(function (global) {
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k.indexOf('on') === 0) node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function Quiz(cfg) {
    this.cfg = cfg;
    this.idx = 0;
    this.answers = []; // numeric scores per question
    this.root = null;
  }

  Quiz.prototype.mount = function (sel) {
    this.root = document.querySelector(sel);
    this.render();
  };

  Quiz.prototype.render = function () {
    var c = this.cfg, q = c.questions[this.idx], total = c.questions.length;
    var done = this.idx >= total;
    this.root.innerHTML = '';

    var shell = el('div', { class: 'quiz-shell' });

    if (!done) {
      // Progress — (idx+1)/total so Q1=12%, Q8=100%
      var pct = Math.round(((this.idx + 1) / total) * 100);
      shell.appendChild(el('div', { class: 'quiz-progress' }, [
        el('span', null, ['Question ' + (this.idx + 1) + ' of ' + total])
      ]));
      shell.appendChild(el('div', { class: 'quiz-bar' }, [
        el('div', { class: 'quiz-bar-fill', style: 'width:' + pct + '%' })
      ]));

      // Question
      shell.appendChild(el('h2', { class: 'quiz-question' }, [q.text]));

      // Options
      var opts = el('div', { class: 'quiz-options' });
      var self = this;
      q.options.forEach(function (opt, i) {
        var selected = self.answers[self.idx] === opt.score;
        var btn = el('button', {
          type: 'button',
          class: 'quiz-option' + (selected ? ' selected' : ''),
          onclick: function () {
            self.answers[self.idx] = opt.score;
            // small delay so user sees the selection
            setTimeout(function () {
              self.idx++;
              self.render();
              window.scrollTo({ top: shell.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
            }, 150);
          }
        }, [
          el('span', { class: 'quiz-option-marker', html: selected ? '✓' : '' }),
          el('span', null, [opt.label])
        ]);
        opts.appendChild(btn);
      });
      shell.appendChild(opts);

      // Back button
      var back = el('button', {
        type: 'button',
        class: 'quiz-back',
        disabled: this.idx === 0 ? '' : null,
        onclick: function () {
          if (self.idx > 0) { self.idx--; self.render(); }
        }
      }, ['← Back']);
      if (this.idx === 0) back.setAttribute('disabled', '');
      shell.appendChild(el('div', { class: 'quiz-actions' }, [back]));

    } else {
      // RESULT
      var sum = this.answers.reduce(function (a, b) { return a + b; }, 0);
      var maxScore = c.questions.length * Math.max.apply(null,
        c.questions[0].options.map(function (o) { return o.score; }));
      var pct = Math.round((sum / maxScore) * 100);

      // Find tier
      var tier = c.tiers.find(function (t) { return pct <= t.maxPct; }) || c.tiers[c.tiers.length - 1];

      var result = el('div', { class: 'quiz-result' });
      result.appendChild(el('span', { class: 'quiz-result-band' }, [tier.band]));
      result.appendChild(el('div', { class: 'quiz-score-circle' }, [pct + '%']));
      result.appendChild(el('h2', null, [tier.title]));
      result.appendChild(el('p', { class: 'hero-sub', style: 'max-width:520px;margin:0 auto 28px;' }, [tier.description]));

      // Email capture form
      var form = el('form', {
        class: 'signup-form',
        name: c.formName,
        method: 'POST',
        'data-handler': 'quiz',
        action: '/thank-you.html',
        style: 'margin: 28px auto 0;',
        onsubmit: function (e) {
          e.preventDefault();
          var btn = form.querySelector('button[type="submit"]');
          var orig = btn ? btn.textContent : '';
          if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
          fetch('/.netlify/functions/quiz-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(new FormData(form)).toString()
          })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d.success) {
              form.style.display = 'none';
              var thanks = el('p', { class: 'form-success visible', style: 'margin-top:16px;color:var(--accent);' },
                ['✓ Your results are on their way to ' + form.querySelector('input[name="email"]').value + '. Check your inbox in a few minutes.']);
              result.appendChild(thanks);
            } else {
              throw new Error(d.message || 'Submission failed');
            }
          })
          .catch(function () {
            if (btn) { btn.disabled = false; btn.textContent = orig || 'Send My Results'; }
            alert('Something went wrong. Please email natasa@8ma.space directly.');
          });
        }
      });
      form.appendChild(el('input', { type: 'hidden', name: 'form-name', value: c.formName }));
      form.appendChild(el('input', { type: 'hidden', name: 'quiz-score', value: pct + '%' }));
      form.appendChild(el('input', { type: 'hidden', name: 'quiz-tier', value: tier.band }));
      form.appendChild(el('input', { type: 'hidden', name: 'quiz-title', value: tier.title }));
      form.appendChild(el('input', { type: 'hidden', name: 'quiz-description', value: tier.description }));
      var honey = el('p', { style: 'display:none;' });
      honey.appendChild(el('label', null, ['Don\'t fill: ', el('input', { name: 'bot-field' })]));
      form.appendChild(honey);
      form.appendChild(el('input', { type: 'text', name: 'firstName', placeholder: 'First name', required: '' }));
      form.appendChild(el('input', { type: 'email', name: 'email', placeholder: 'Your email', required: '' }));
      form.appendChild(el('button', { type: 'submit', class: 'btn' }, [c.cta || 'Send My Results']));
      result.appendChild(form);
      result.appendChild(el('p', { class: 'form-note' }, [c.note || 'I\'ll send your full results plus a small follow-up resource.']));

      // Take again
      var self2 = this;
      var again = el('button', {
        type: 'button',
        class: 'quiz-back',
        style: 'margin-top: 22px;',
        onclick: function () { self2.idx = 0; self2.answers = []; self2.render(); }
      }, ['↻ Take it again']);
      result.appendChild(again);

      shell.appendChild(result);
    }

    this.root.appendChild(shell);
  };

  global.Quiz = Quiz;
})(window);
