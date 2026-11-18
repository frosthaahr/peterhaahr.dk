// Kontaktformular: sender via FormSubmit til salg@peterhaahr.dk.
// Kanal-sporing: utm_source/utm_campaign (fx ?utm_source=linkedin&utm_campaign=cirkusheste) eller henvisende side.
(function () {
  var ENDPOINT = "https://formsubmit.co/ajax/salg@peterhaahr.dk";

  document.getElementById("year").textContent = new Date().getFullYear();

  function leadSource() {
    var p = new URLSearchParams(window.location.search);
    var src = p.get("utm_source");
    if (src) return [src, p.get("utm_campaign")].filter(Boolean).join(" · ").slice(0, 200);
    try {
      var ref = document.referrer ? new URL(document.referrer).hostname : "";
      return ref && ref !== window.location.hostname ? ref.slice(0, 200) : "direkte";
    } catch (e) {
      return "direkte";
    }
  }

  var form = document.getElementById("lead-form");
  var err = document.getElementById("form-error");
  var thanks = document.getElementById("form-thanks");
  var btn = form.querySelector("button[type=submit]");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = "Sender…";

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
    data["Kilde"] = leadSource();
    data._subject = "Nyt lead fra peterhaahr.dk: " + (data["Virksomhed"] || data["Navn"]);
    data._template = "table";
    data._replyto = data.email;

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) === "false") throw new Error(j.message); }); })
      .then(function () { form.hidden = true; thanks.hidden = false; })
      .catch(function () {
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = "Ønsk en samtale →";
      });
  });
})();
