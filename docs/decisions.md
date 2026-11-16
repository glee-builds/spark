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
| 2026-11-15 | Testing | GitHub Actions runs `node --test` on every pull request | A broken change or a thin part of the library shows as a red X before merging |
| 2026-11-15 | Library | Every allowed Who, How well, and Where combination must have at least six starters at its default depth | Checked by a test, so no choice leads to an empty or repetitive screen |
| 2026-11-15 | Offline | A service worker saves every app file on the first visit, answers from the saved copy, and refreshes it in the background | Opens instantly with no signal. An update shows the second time the app is opened |
| 2026-11-15 | Install | The app shows its own one-time hint for adding to the home screen | iPhone has no automatic install prompt |
| 2026-11-15 | Matching | A set shown at medium or deep opens with one light starter, written for the chosen place when possible | Research guideline: anchor on the shared situation first, then go deeper |
| 2026-11-15 | Design | A starter's tip shows on the card face, not under "More" | Tips often say when a line fits ("Only if you've noticed it"), so they must be seen before the line is used |
| 2026-11-15 | Design | The Who screen is sized to fit a current phone without scrolling | Fewer seconds to the first tap |
| 2026-11-15 | Design | Who is now two short steps: a group (Family, Friends, Work, Networking, Other), then the person. Friends has one person, so that step is skipped | Owner asked for a first screen with no scrolling |
| 2026-11-15 | Design | The starters screen is a list of lines with a short label each; tapping one opens the detail (tip, follow-ups, your turn), with arrows to flip between starters. The list drops starters from the end until it fits the screen (never fewer than two) | Owner asked for suggestions readable at a glance without scrolling. Replaces the 2026-11-15 "tip shows on the card face" row: the tip is now on the detail screen |
| 2026-11-15 | Design | The reassurance line moves to the Where screen | Frees space on the starters screen, and lands just before the conversation |
| 2026-11-15 | Workflow | Claude also merges the pull requests for Phases 4 and 5 once the tests pass | Owner asked Claude to complete the remaining phases |
| 2026-11-15 | Recent | The first screen shows the last two situations under "Again", one tap from the starters | Phase 4: makes a repeat use one tap. Two, not three, so the first screen still fits a small phone |
| 2026-11-15 | Offline | Replaces the earlier offline row. The service worker now serves only from a cache named after a fingerprint of every app file, written into `sw.js` by `node tools/stamp.mjs`. A new version is saved complete, and the app switches to it at the first screen | The earlier "refresh in the background" approach could mix old and new files after an update and break the app. A test fails if `sw.js` isn't stamped |
| 2026-11-15 | Aim | An "Aim" button on the starters screen opens a short list (Any, Break the ice, Go deeper, Have fun, Fill a silence, Learn from them, Reconnect). Starters tagged for the aim come first; only aims with at least three possible starters are offered | Phase 4 goal chips. A separate screen, not a row of chips, so the starters list keeps its space |
| 2026-11-15 | Saved | A starter's detail screen has a Save button. Saved starters are listed on a Saved screen, reached from the first screen once anything is saved | Phase 4. Saved by id in `localStorage`, so nothing personal is stored |
| 2026-11-15 | Comfort | A Settings screen with a comfort setting: Standard, More reserved (one step lighter and no risky topics unless very close), Direct (plain questions first, fewer statements and feelings topics). Also buttons to show seen starters again and clear the "Again" list | Phase 4. A user-set comfort level instead of cultural rules (research guideline 27) |
| 2026-11-15 | Feedback | A starter's detail screen has Worked and Fell flat buttons. Fell-flat starters stop coming up; ones that worked come up slightly more. "Your notes" in Settings lists both | Phase 5 tooling: the owner's review of which starters work needs a record of real use. Kept on the phone only |
| 2026-11-15 | Flow | Replaces the Who / How well / Where flow. Now: Who (7 tiles, then a person; closeness is built into the people, e.g. Close friend, Acquaintance, Work friend), then "Right now I want to..." (11 purposes, 7 or fewer per person, worded per person), then starters with an "In person or call / Message" switch preset from the purpose or last choice | Research in `_briefs/spark/reports/Refining the three questions.md`: Where barely changed the starters (65% overlap between in-person places) except in person vs message; purpose and the other person's state changed them most. Holdout test: 14 clear / 6 hesitate / 0 no fit vs 7 / 10 / 3, 2.8 taps vs 3.65 |
| 2026-11-15 | Flow | Removes the Aim button and the "They're having a hard time" switch | Both are now purposes ("Be there", and the purpose list itself) |
| 2026-11-15 | Library | Starters are tagged by person, purpose, and medium (in-person, message, or any) instead of closeness and place. Existing starters keep their ids so saved starters and marks still work. Young children, teens, and grown children move to `data/kids.json`. Every person / purpose / medium needs at least 4 starters where the purpose starts, and 3 under "More reserved" | Checked by tests and `tools/check-library.mjs` |
| 2026-11-15 | Workflow | This change ships starters and code in one pull request, one commit per starter file | The new questions and the new tags only work together. An exception to the separate-pull-requests rule |
