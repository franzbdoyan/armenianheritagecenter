// Donation box on the home page and the payment form on donate.html.
// Choices travel between them in the URL:
//   donate.html?frequency=monthly|one-time&amount=100[&method=paypal|check|employer]
(function () {
  var AMOUNTS = {
    "monthly": [50, 100, 200, 500],
    "one-time": [250, 500, 1000, 2500]
  };
  var DEFAULT = { "monthly": 100, "one-time": 500 };
  var MONTHS = 36;
  var FOUNDING_FAMILY = 100;
  var COMMITTEE_EMAIL = "armenianswa@gmail.com";

  function money(n) {
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function parseAmount(str) {
    var n = parseFloat(String(str || "").replace(/[$,\s]/g, ""));
    return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  }

  // Wires the frequency toggle, the four preset amounts and the "other" field.
  function amountPicker(form, onChange) {
    var group = form.querySelector("[data-amounts]");
    var other = form.querySelector("[data-other]");
    var radios = group.querySelectorAll('input[name="amount"]');

    function freq() {
      var el = form.querySelector('input[name="frequency"]:checked');
      return el && AMOUNTS[el.value] ? el.value : "monthly";
    }

    function showPresets(selected) {
      AMOUNTS[freq()].forEach(function (v, i) {
        radios[i].value = String(v);
        radios[i].nextElementSibling.textContent = money(v);
        radios[i].checked = v === selected;
      });
    }

    function amount() {
      var custom = parseAmount(other.value);
      if (custom) return custom;
      var el = group.querySelector('input[name="amount"]:checked');
      return el ? parseAmount(el.value) : 0;
    }

    function set(f, a) {
      var fr = form.querySelector('input[name="frequency"][value="' + f + '"]');
      if (fr) fr.checked = true;
      if (a && AMOUNTS[freq()].indexOf(a) === -1) {
        showPresets(null);
        other.value = String(a);
      } else {
        other.value = "";
        showPresets(a || DEFAULT[freq()]);
      }
      onChange();
    }

    form.addEventListener("change", function (e) {
      if (e.target.name === "frequency") {
        other.value = "";
        showPresets(DEFAULT[freq()]);
      }
      if (e.target.name === "amount") other.value = "";
      onChange();
    });

    other.addEventListener("input", function () {
      if (other.value.trim()) radios.forEach(function (r) { r.checked = false; });
      onChange();
    });

    return { freq: freq, amount: amount, set: set, other: other };
  }

  // ---------- Home page: "Make a gift today" box ----------

  var giveForm = document.getElementById("give-form");
  if (giveForm) {
    var note = document.getElementById("give-note");
    var giveBtn = document.getElementById("give-btn");

    var box = amountPicker(giveForm, function () {
      var f = box.freq();
      var a = box.amount();
      giveBtn.disabled = !a;
      if (!a) {
        giveBtn.textContent = "Donate";
        note.textContent = "Choose or enter an amount.";
      } else if (f === "monthly") {
        giveBtn.textContent = "Donate " + money(a) + " a month";
        note.textContent = (a >= FOUNDING_FAMILY ? "Founding Family: " : "") +
          money(a) + " a month for 3 years, " + money(a * MONTHS) + " in total.";
      } else {
        giveBtn.textContent = "Donate " + money(a);
        note.textContent = "A one-time gift of " + money(a) + " toward the new center.";
      }
    });

    giveForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var a = box.amount();
      if (!a) { box.other.focus(); return; }
      window.location.href = "donate.html?frequency=" + box.freq() + "&amount=" + a;
    });

    box.set("monthly", DEFAULT.monthly);
  }

  // ---------- Donate page: payment form ----------

  var payForm = document.getElementById("pay-form");
  if (!payForm) return;

  var totalAmount = document.getElementById("total-amount");
  var totalDetail = document.getElementById("total-detail");
  var METHOD_NAMES = { paypal: "PayPal or card", check: "Check", employer: "Employer matching" };

  var pay = amountPicker(payForm, update);

  function update() {
    var f = pay.freq();
    var a = pay.amount();

    totalAmount.textContent = a ? money(a) : "—";
    if (a && f === "monthly") {
      var per = document.createElement("small");
      per.textContent = " / month";
      totalAmount.appendChild(per);
      totalDetail.textContent = "For 3 years: " + money(a * MONTHS) + " in total." +
        (a >= FOUNDING_FAMILY ? " Welcome, Founding Family." : "");
    } else {
      totalDetail.textContent = a ? "One-time gift" : "Choose or enter an amount.";
    }

    document.querySelectorAll('[data-fill="amount"]').forEach(function (el) {
      el.textContent = a ? money(a) : "your amount";
    });
    document.querySelectorAll("[data-show]").forEach(function (el) {
      el.hidden = el.getAttribute("data-show") !== f;
    });
  }

  function method() {
    var el = payForm.querySelector('input[name="method"]:checked');
    return el ? el.value : "paypal";
  }

  function showMethod() {
    ["paypal", "check", "employer"].forEach(function (m) {
      document.getElementById("panel-" + m).classList.toggle("show", m === method());
    });
  }

  payForm.addEventListener("change", function (e) {
    if (e.target.name === "method") showMethod();
  });
  payForm.addEventListener("submit", function (e) { e.preventDefault(); });

  // Start from the choices in the URL
  var params = new URLSearchParams(window.location.search);
  var startFreq = params.get("frequency") === "one-time" ? "one-time" : "monthly";
  pay.set(startFreq, parseAmount(params.get("amount")) || DEFAULT[startFreq]);
  var startMethod = payForm.querySelector('input[name="method"][value="' + params.get("method") + '"]:not(:disabled)');
  if (startMethod) startMethod.checked = true;
  showMethod();

  // ---------- Optional: Founding Families list (sent by email) ----------

  var sendBtn = document.getElementById("r-send");
  var errorEl = document.getElementById("r-error");
  var sent = document.getElementById("r-sent");
  var sentText = document.getElementById("r-text");
  var copyBtn = document.getElementById("r-copy");

  sendBtn.addEventListener("click", function () {
    var name = payForm.elements.name.value.trim();
    var email = payForm.elements.email.value.trim();
    var a = pay.amount();
    var f = pay.freq();

    var problems = [];
    if (!name) problems.push("your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push("a valid email");
    if (!a) problems.push("an amount");
    if (problems.length) {
      var last = problems.pop();
      errorEl.textContent = "Please add " + (problems.length ? problems.join(", ") + " and " : "") + last + ".";
      errorEl.classList.add("show");
      return;
    }
    errorEl.classList.remove("show");

    var lines = [
      "Pledge: Armenian Community Center in Redmond",
      "",
      "Name: " + name,
      "Email: " + email,
      "",
      f === "monthly"
        ? "Gift: " + money(a) + " a month for 3 years (" + money(a * MONTHS) + " total)"
        : "Gift: one-time " + money(a)
    ];
    if (f === "monthly") lines.push("Starts: " + payForm.elements.start.value);
    lines.push("Giving by: " + METHOD_NAMES[method()], "");
    if (payForm.elements.anonymous.checked) {
      lines.push("Recognition: please keep my gift anonymous");
    } else if (payForm.elements.listas.value.trim()) {
      lines.push("Recognition: list us as \"" + payForm.elements.listas.value.trim() + "\"");
    }
    var body = lines.join("\n");

    sentText.textContent = body;
    sent.classList.add("show");
    window.location.href = "mailto:" + COMMITTEE_EMAIL +
      "?subject=" + encodeURIComponent("Pledge: " + name) +
      "&body=" + encodeURIComponent(body);
  });

  copyBtn.addEventListener("click", function () {
    function done() {
      copyBtn.textContent = "Copied";
      setTimeout(function () { copyBtn.textContent = "Copy pledge"; }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sentText.textContent).then(done, function () {});
    }
  });
})();
