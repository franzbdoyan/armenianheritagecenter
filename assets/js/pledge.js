// Pledge form: GitHub Pages can't process forms, so the pledge is composed
// into an email to the fundraising committee instead.
(function () {
  var COMMITTEE_EMAIL = "armenianswa@gmail.com";
  var MONTHS = 36;

  var form = document.getElementById("pledge-form");
  if (!form) return;

  var otherWrap = document.getElementById("other-wrap");
  var otherInput = document.getElementById("p-other");
  var errorEl = document.getElementById("form-error");
  var sumTotal = document.getElementById("sum-total");
  var sumDetail = document.getElementById("sum-detail");
  var sent = document.getElementById("sent");
  var sentText = document.getElementById("sent-text");
  var copyBtn = document.getElementById("copy-btn");
  var tiers = document.querySelectorAll(".tier");

  function money(n) {
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function parseAmount(str) {
    var n = parseFloat(String(str || "").replace(/[$,\s]/g, ""));
    return isFinite(n) && n > 0 ? n : 0;
  }

  function selected(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function monthlyAmount() {
    var v = selected("amount");
    return v === "other" ? parseAmount(otherInput.value) : parseAmount(v);
  }

  function syncTiers(value) {
    tiers.forEach(function (t) {
      t.setAttribute("aria-pressed", String(t.dataset.amount === value));
    });
  }

  function update() {
    var isOther = selected("amount") === "other";
    otherWrap.classList.toggle("show", isOther);
    syncTiers(selected("amount"));

    var m = monthlyAmount();
    if (m) {
      sumTotal.textContent = money(m * MONTHS);
      sumDetail.textContent = money(m) + " a month for " + MONTHS + " months, starting " +
        (selected("start") === "Now" ? "now" : selected("start"));
    } else {
      sumTotal.textContent = "—";
      sumDetail.textContent = "Enter your monthly amount";
    }
  }

  // Tier cards pick the amount and jump to the form
  tiers.forEach(function (t) {
    t.addEventListener("click", function () {
      var radio = form.querySelector('input[name="amount"][value="' + t.dataset.amount + '"]');
      if (radio) radio.checked = true;
      update();
      document.getElementById("pledge").scrollIntoView({ behavior: "smooth", block: "start" });
      var focusTarget = t.dataset.amount === "other" ? otherInput : document.getElementById("p-name");
      setTimeout(function () { focusTarget.focus({ preventScroll: true }); }, 450);
    });
  });

  form.addEventListener("change", update);
  otherInput.addEventListener("input", update);

  function buildPledge() {
    var data = new FormData(form);
    var m = monthlyAmount();
    var lines = [
      "Founding Family pledge: Armenian Community Center in Redmond",
      "",
      "Name: " + data.get("name").trim(),
      "Email: " + data.get("email").trim()
    ];
    if (data.get("phone").trim()) lines.push("Phone: " + data.get("phone").trim());
    lines.push(
      "",
      "Monthly pledge: " + money(m) + " a month for 3 years (" + money(m * MONTHS) + " total)",
      "Start: " + selected("start")
    );
    var onetime = parseAmount(data.get("onetime"));
    if (onetime) lines.push("One-time gift in addition: " + money(onetime));
    lines.push("Giving by: " + data.get("method"));
    if (data.get("employer").trim()) lines.push("Employer (matching): " + data.get("employer").trim());
    lines.push("");
    if (data.get("anonymous")) {
      lines.push("Recognition: please keep my gift anonymous");
    } else if (data.get("listas").trim()) {
      lines.push("Recognition: list us as \"" + data.get("listas").trim() + "\"");
    }
    return lines.join("\n");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var problems = [];
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    if (!name) problems.push("your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push("a valid email");
    if (!monthlyAmount()) problems.push("a monthly amount");

    if (problems.length) {
      var last = problems.pop();
      errorEl.textContent = "Please add " + (problems.length ? problems.join(", ") + " and " : "") + last + ".";
      errorEl.classList.add("show");
      return;
    }
    errorEl.classList.remove("show");

    var body = buildPledge();
    var subject = "Founding Family pledge: " + name;
    sentText.textContent = body;
    sent.classList.add("show");

    window.location.href = "mailto:" + COMMITTEE_EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  });

  copyBtn.addEventListener("click", function () {
    var text = sentText.textContent;
    function done() {
      copyBtn.textContent = "Copied";
      setTimeout(function () { copyBtn.textContent = "Copy pledge"; }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {});
    } else {
      var range = document.createRange();
      range.selectNodeContents(sentText);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      try { document.execCommand("copy"); done(); } catch (err) {}
    }
  });

  update();
})();
