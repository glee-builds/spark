# spark: working rules for Claude Code

Shared rules for all coding projects are in `../CLAUDE.md`, and they apply here. This file adds this project's rules. The full decision history is in `docs/decisions.md`; when a decision changes, update that file and note why.

## Workflow

- **Never commit directly to `main`.** The first commit was the only exception. All work goes on a branch and reaches `main` through a pull request.
- **Who merges:** for Phases 1 to 5 the owner asked Claude to merge each pull request once the tests pass, so the live link stays current (see `docs/decisions.md`). For later work, the owner merges unless they say otherwise.
- **A new file the app loads must be added to the `FILES` list in `sw.js`**, or it will be missing offline. A test checks this.
- **After changing any app file, run `node tools/stamp.mjs`.** It updates the version in `sw.js` so phones fetch the update. A test fails if you forget.
- **Starters and code go in separate pull requests.** A pull request that adds starters adds one group at a time, so the owner can read the lines out loud.

## Privacy rule (applies to everything public)

Nothing that identifies the owner or any other person is stored anywhere public.

- The app and the starter library use generic categories ("Colleague", "Parent"), never names or details of real people. Starters use "they" and "them".
- This covers everything GitHub shows: files, commit messages, branch names, pull request titles, descriptions, and comments.
- No personal email address in any file or commit.
- **Before every push or pull request**, scan the changes for names, email addresses, and personal details:
  `git diff main... | grep -n -w -i -E "he|him|his|she|her|son|daughter|year-old|@"`
  Use `-w`, not `\b`: macOS `grep` does not support `\b`. Read each match and fix anything that describes a real person.
- Planning documents (brief, product requirements, research) live outside this repo and are never copied in.

## Locked decisions

- **Code:** plain HTML, CSS, and JavaScript ES modules. No framework, no build step.
- **Repo:** public.
- **Hosting:** GitHub Pages from `main`.
- **Data:** the starter library is JSON files in `data/`. Saved items and settings stay in the phone's `localStorage`.
- **No AI:** starters come from the built-in library. No AI service, no network requests after the page loads.
- **Input:** tap choices only. No free-text field anywhere.
- **Testing:** Node's built-in test runner (`node --test`).

## Design rules

- **Phone first:** portrait layout. Choices and main actions sit in the lower two-thirds of the screen. Tap targets at least 48px.
- **No scrolling:** every choice screen and the starters list fit on one phone screen. The list drops starters from the end until it fits; details open on tap.
- **Glanceable:** each starter in the list is one short label (Ask, Observe, Share...) and the line. Everything else is on the detail screen.
- **Discreet:** plain appearance, no sound, no attention-grabbing animation. Dark mode supported.
- **Not color alone:** depth and state use a label or icon as well as color.
- **Original:** original visuals, colors, and starter wording.
- **Honest:** no statistics or promises in the app that the research does not support.

## Repo layout

```
index.html        the one page of the app
manifest.webmanifest  name, colors, and icons for the home-screen app
sw.js             the service worker: saves the app's files for offline use
assets/           the app icons
tools/stamp.mjs   stamps sw.js with a fingerprint of the app files
styles.css        all styling
src/
  app.js          the screens and what happens on each tap
  config.js       the Who, How well, and Where choices and which combinations make sense
  matching.js     the rules that pick starters (depth ceiling, risky topics, variety)
  library.js      loads the starter files and the support lines
  support.js      picks the wrap-up line, hard-time lines, and reassurance
  install.js      starts offline support and shows the add-to-home-screen hint
  storage.js      what is remembered on the phone (recently seen starters, recent choices, saved starters)
  validate.js     checks a starter follows the format
data/             the starter library, one JSON file per group of people,
                  plus support.json (wrap-up lines, hard-time lines, reassurances)
tests/            node --test
docs/
  decisions.md    every decision, dated, with the reason
  starter-format.md  how to write a starter, and the writing rules
CLAUDE.md         this file
README.md         what the app is and how to preview it
```

## Preview locally

`python3 -m http.server 8000`, then open http://localhost:8000.
