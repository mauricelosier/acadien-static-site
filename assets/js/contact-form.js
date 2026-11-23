// Contact form → webapi /api/contact (same origin; Caddy proxies to the webapi container and adds the X-Api-Key header)
(function () {
  var form = document.getElementById('contactus_form');
  if (!form) return;

  var fr = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;
  var T = fr ? {
    sending: 'Envoi en cours…',
    ok: 'Merci! Votre message a été envoyé. Nous vous répondrons dès que possible.',
    err: "Désolé, le message n'a pas pu être envoyé. Appelez-nous au 613-878-2754 ou écrivez à info@acadienlandscaping.com.",
    phone: 'Téléphone', company: 'Entreprise'
  } : {
    sending: 'Sending…',
    ok: "Thanks! Your message was sent. We'll get back to you as soon as possible.",
    err: 'Sorry, your message could not be sent. Please call 613-878-2754 or email info@acadienlandscaping.com.',
    phone: 'Phone', company: 'Company'
  };

  var btn = form.querySelector('.s_website_form_send');
  var result = document.getElementById('s_website_form_result');

  function show(msg, ok) {
    result.textContent = msg;
    result.className = 'd-block mt-2 ' + (ok ? 'text-success' : 'text-danger');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var v = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };

    // Honeypot: real visitors never fill this hidden field
    if (v('website')) { show(T.ok, true); form.reset(); return; }

    var extra = [];
    if (v('phone')) extra.push(T.phone + ': ' + v('phone'));
    if (v('company')) extra.push(T.company + ': ' + v('company'));

    var payload = {
      name: v('name'),
      email: v('email_from'),
      subject: v('subject'),
      message: v('description') + (extra.length ? '\n\n' + extra.join('\n') : '')
    };

    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = T.sending;

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      show(T.ok, true);
      form.reset();
    }).catch(function () {
      show(T.err, false);
    }).finally(function () {
      btn.disabled = false;
      btn.textContent = label;
    });
  });
})();
