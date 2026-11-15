# Decisions log

Every project decision, when it was made, and why. When a decision changes, don't delete the old row: mark it as replaced and add a new row explaining what changed and why.

| Date | Area | Decision | Reason |
|---|---|---|---|
| 2026-11-15 | Name | Spark, repo `spark` | Short and easy to say. A spark is the small flash that gets a fire going |
| 2026-11-15 | Purpose | A personal tool, not a paid product | Owner's decision |
| 2026-11-15 | Platform | Web app added to the phone's home screen. Works offline after the first load | Opens from a link, no app store |
| 2026-11-15 | Code | Plain HTML, CSS, JavaScript ES modules. No framework, no build step | Every file stays readable for a beginner |
| 2026-11-15 | Repo | Public | Needed for free GitHub Pages hosting. Holds only code and generic starters |
| 2026-11-15 | Hosting | GitHub Pages from `main` | Free, built into GitHub |
| 2026-11-15 | No AI | Starters come from a curated library shipped inside the app | Works offline, free to run, private |
| 2026-11-15 | Flow | Three taps: Who, How well, Where. "How well" is skipped only when one answer makes sense | Closeness changes which starters fit |
| 2026-11-15 | Starter unit | Each starter is a bundle: the line, one or two follow-ups, a share-back cue, an optional delivery cue, and tags | Research: follow-up questions matter more than the opening line |
| 2026-11-15 | Matching | Plain rules in code: fit, a depth ceiling from closeness with role caps, a risky-topic filter, variety, freshness | Predictable and testable |
| 2026-11-15 | Data | Starter library as JSON files in the repo. Saved items and settings in `localStorage` | Nothing leaves the phone |
| 2026-11-15 | Input | Tap choices only. No free-text field | Fast, and nothing identifying can be typed in |
| 2026-11-15 | Privacy | No accounts, analytics, ads, tracking, or external network requests. Nothing that identifies any person in the repo or on GitHub | Owner's rule |
| 2026-11-15 | Testing | Node's built-in test runner (`node --test`) | No dependency to install |
| 2026-11-15 | Workflow | After the first commit, never commit directly to `main`; every change goes through a branch and a pull request | Keeps a reviewable record of every change |
| 2026-11-15 | Workflow | For Phases 1 to 3, Claude merges each pull request once the tests pass | Owner's choice, so the live link stays current while the app is built |
