# Hearth Budget — A Household Budget Book

A household budget site that runs entirely in the browser from static files.
No account, no server, no network request: every figure lives in the
browser's own storage and every control works.

## What it does

- **Dashboard** — the month at a glance: income, spending, savings, money
  left, a donut of spending by category, budget vs. actual bars, unpaid
  bills, and the latest transactions.
- **Budget Planner** — edit every income source and every category budget;
  totals update live and are saved immediately.
- **Transactions** — add income or spending, filter by category, delete a
  wrong entry.
- **Savings Goals** — four goals with progress bars; add funds to any goal
  (which also records the transfer) or create a new goal.
- **Bills** — recurring bills with due dates; mark paid, add, or remove.
- **Monthly Report** — six months of income vs. spending as a bar chart,
  plus the category breakdown for the selected month.

The sample household is the fictional Hartono family, November 2026, in
Indonesian rupiah. Change any figure — the site is yours to use.

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

Or serve `app/` with any static server. No build step.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library.

## License

MIT — see `LICENSE`.
