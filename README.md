# PillPlan

A counter tool for the apoteker: type the prescription signa (for example `3 dd 1 tab p.c.`), and PillPlan checks the plan and turns it into one clear picture chart, a counseling view and phone reminders, in English or Indonesian.

**Live:** https://pillplan-cela.netlify.app (try `?example` or `?example&lang=id`)

## What it does

- Signa entry in Latin or Indonesian fills times, amount and food, with a live preview
- Drug search by generic, brand or Indonesian name, plus your own medicines ("My drugs")
- A Universal Medication Schedule chart that prints on one A4 page, or saves as PDF
- Safety notes: daily maximum per ingredient across products, duplicates, time of day
- Counseling mode, a 7-day tracker and a calendar file for phone reminders
- Fully static: no server, no database, nothing leaves the browser

## Run it locally

```
cd web
npm install
npm run dev          # http://localhost:5173
npm test
npm run build && npm run preview   # production build on http://localhost:4173
```

Drug data lives in `data-src/*.csv` (edit in Excel or Sheets). Rebuild it with:

```
cd tools
uv run python -m pillplan_tools.catalog.build
uv run pytest
```

## Documentation

- [Product Requirements Document](docs/pdf/PillPlan-PRD.pdf)
- [Technical documentation](docs/pdf/PillPlan-Technical.pdf)

Starter drug data comes from US FDA labels. Check it against your own formulary before real use. PillPlan does not replace advice from a doctor or pharmacist.

Author: Moh Khoirul Umam Al Amin
