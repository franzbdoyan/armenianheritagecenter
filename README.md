# armenianheritagecenter.org

Fundraising site for the Armenian Community Center and School in Redmond, WA.
Plain HTML and CSS, hosted on GitHub Pages. No build step.

## Pages

- `index.html`: the project, the plan, and the financials
- `donate.html`: giving tiers, pledge form, and ways to give
- `404.html`: not-found page

## Updating

- **Raised / spent figures:** the Transparency section of `index.html`
  (search for `money-num` and `ledger-row`). Update the "Last updated" line too.
- **Payment details:** the Step 2 section of `donate.html` (search for `id="ways"`).
  When Zelle is ready, replace the "Coming soon" card with the Zelle recipient.
- **Pledge email address:** `COMMITTEE_EMAIL` in `assets/js/pledge.js`.

Push to `main` and GitHub Pages republishes in about a minute.

## Preview locally

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123.
