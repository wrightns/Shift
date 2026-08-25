# Shift

Sporting app that helps develop and stick to a practice plan.

Shift has three pieces:

- **Drill Bank** — a reusable library of drills (name, category, description, equipment, default duration, tags) you can pull into any practice plan.
- **Practice Plan Builder** — build a day's practice out of blocks:
  - **Single blocks** — a one-off timed segment (e.g. "Warmup — 15 min"), optionally linked to a drill from the bank.
  - **Interval blocks** — a repeating work/break cycle that fills a total duration, e.g. "15 minutes of small-sided games, stopping for a 30s team talk every 3 minutes." Shift works out the number of reps automatically.
  - **Group blocks** — a sequence of sub-blocks, e.g. two 10-minute stations run back to back.

  The builder shows your planned total against a target practice length so you can see at a glance if you're over or under.
- **Practice Runner** — pick a plan and run it live: a big countdown timer per segment, an audio alarm when a segment ends (and a fanfare when the whole practice is done), pause/resume, skip forward/back, jump to any segment in the full schedule, and an overall progress bar for the whole session. It also requests a screen wake lock so your phone/tablet doesn't sleep mid-practice.

A sample 90-minute soccer practice (warmup, small-sided games with talk breaks, two stations, closing game) is pre-loaded so you can see it working immediately.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
```

Practice plans and drills are persisted to the browser's `localStorage` — no backend required.

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`, publishing to `https://<owner>.github.io/Shift/`.
