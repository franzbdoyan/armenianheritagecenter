# armenianheritagecenter.org

Fundraising site for the Armenian Community Center and School in Redmond, WA.
Plain HTML and CSS, hosted on GitHub Pages. No build step.

## Pages

- `index.html`: the project story with a "Make a gift today" box, the plan,
  the building, financials and FAQ
- `donate.html`: the payment page (amount, frequency, payment method)
- `404.html`: not-found page

The home page box sends people to the donate page with their choices filled in:

```
donate.html?frequency=monthly&amount=100
donate.html?frequency=one-time&amount=500
donate.html?method=check        (or paypal, employer)
```

Use the same links in emails, social posts or QR codes.

## Updating

- **Raised / spent figures:** the Transparency section of `index.html`
  (search for `money-num` and `ledger-row`). Update the "Last updated" line too.
- **Preset amounts:** `AMOUNTS` at the top of `assets/js/give.js`.
- **Payment details:** the `panel-paypal`, `panel-check` and `panel-employer`
  blocks in `donate.html`. When Zelle is ready, remove `disabled` from the Zelle
  option and add a `panel-zelle` block with the recipient.
- **Pledge email address:** `COMMITTEE_EMAIL` in `assets/js/give.js`.

Upload changed files to `main` and GitHub Pages republishes in about a minute.

## Preview locally

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123.
