// Codeovsky contact form — math captcha + AJAX submit to Formspree
(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const questionEl = document.getElementById('captchaQuestion');
  const expectedEl = document.getElementById('captchaExpected');
  const answerEl = document.getElementById('captcha');
  const statusEl = document.getElementById('formStatus');

  // Generate a fresh math problem
  function newCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const ops = ['+', '−', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer;
    if (op === '+') answer = a + b;
    else if (op === '−') answer = a - b;
    else answer = a * b;

    questionEl.textContent = `Quick check: ${a} ${op} ${b} =`;
    expectedEl.value = String(answer);
    answerEl.value = '';
  }

  newCaptcha();

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = 'form-status ' + (type || '');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    setStatus('', '');

    // Math captcha check
    const expected = parseInt(expectedEl.value, 10);
    const given = parseInt(answerEl.value, 10);
    if (isNaN(given) || given !== expected) {
      setStatus("That math doesn't look right — give it another try.", 'error');
      newCaptcha();
      answerEl.focus();
      return;
    }

    // Honeypot check
    const honey = form.querySelector('input[name="_gotcha"]');
    if (honey && honey.value) {
      // silently drop bot submissions
      setStatus('Thanks — we\'ll be in touch.', 'success');
      form.reset();
      newCaptcha();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const data = new FormData(form);
      // Don't send the captcha fields to Formspree
      data.delete('captcha_answer');
      data.delete('captcha_expected');

      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStatus("Got it. We'll get back to you soon.", 'success');
        form.reset();
        newCaptcha();
      } else {
        const json = await response.json().catch(() => ({}));
        const msg = (json && json.errors && json.errors[0] && json.errors[0].message)
          ? json.errors[0].message
          : "Something went wrong sending that. Try again, or just email info@codeovsky.com directly.";
        setStatus(msg, 'error');
      }
    } catch (err) {
      setStatus("Couldn't send the message. Try again, or email info@codeovsky.com directly.", 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
