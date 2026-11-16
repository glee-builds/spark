# Starter format

How the starter library is written. Each file in `data/` (family, kids, friends, work, networking, other) is a JSON array of starter bundles. Adding or editing a starter needs no code change. After editing, run:

```bash
node tools/check-library.mjs data/family.json
```

It checks the format of every starter, and that every person / purpose / medium the screens allow has at least **4 starters at the level the purpose starts at** and at least **3 under the "More reserved" setting**. Then run `node --test` and `node tools/stamp.mjs`.

The flow these tags serve: **Who** (a tile, then a person) → **"Right now I want to…"** (a purpose) → starters, with an **In person or call / Message** switch. The people, their purposes and their depth limits are defined in `src/config.js`; read the `WHO` list there.

## A bundle

```json
{
  "id": "wk-012",
  "line": "Anything you're looking forward to this month?",
  "form": "question",
  "followUps": ["What are you most excited about with that?", "How did that come about?"],
  "shareBack": "Offer one thing you're looking forward to, in a sentence, then ask another question.",
  "deliveryCue": null,
  "depth": "light",
  "who": ["colleague", "work-friend", "client"],
  "purposes": ["ice", "quick"],
  "medium": "any",
  "topics": ["plans"],
  "riskTags": [],
  "basis": "expert-opinion"
}
```

| Field | Rules |
|---|---|
| `id` | Unique, never reused. Two letters for the file (`fa` family, `ki` kids, `fr` friends, `wk` work, `nw` networking, `ot` other), a hyphen, three digits. Existing starters keep their id even when retagged, because saved starters and Worked / Fell flat marks point at it |
| `line` | What the user says or sends. One or two short sentences, at most 140 characters. Natural spoken English (American) |
| `form` | `question`, `statement` (an observation or tentative read), `compliment` (specific, then a question), `share` (a short disclosure with a hook, handing the turn back), `advice` (asks for their advice or experience), `reachout` (a message after a gap; medium must be `message`) |
| `followUps` | One or two follow-up questions for after they answer. Each at most 90 characters |
| `shareBack` | One instruction for what the user offers about themself after the follow-ups, then hand the turn back. At most 140 characters |
| `deliveryCue` | `null`, or one short tip on how or when to say it (at most 90 characters). Required for `child` and `teen`. Use it to say when a line fits ("Only if you've noticed it", "Swap in the real detail") |
| `depth` | `light` (setting, tastes, plans), `medium` (experiences, opinions, stories, what excites or stresses), `deep` (values, fears, regrets, the relationship itself) |
| `who` | One or more person ids from `WHO` in `src/config.js`. Only list a person if the line sounds right said to them |
| `purposes` | One or more of `ice`, `quick`, `deeper`, `revive`, `checkin`, `reconnect`, `support`, `repair`, `plans`, `celebrate`, `goodbye` (see below). Only list a purpose the person actually has |
| `medium` | `in-person` (said face to face or on a call), `message` (written as a text), or `any` (works said or sent, word for word) |
| `topics` | One or two of: `setting`, `food`, `plans`, `week`, `work`, `projects`, `hobbies`, `entertainment`, `travel`, `family`, `kids`, `memories`, `learning`, `opinions`, `values`, `feelings`, `home`, `neighborhood`, `sports`, `stories`, `advice`, `connection` |
| `riskTags` | Zero or more of `work`, `money`, `politics`, `religion`, `health`, `appearance`, `relationship-status`, `children`, `origin`. Tag honestly. Risk-tagged starters are hidden for "careful" people (see `WHO`), except `work` for work people and `children` for other parents and young children |
| `basis` | `research-backed` (the pattern is tested: follow-up-led, compliment, advice within their expertise, reach-out after a gap), `expert-opinion`, or `untested` |

## Purposes

| id | Label the user sees | What the starter should do |
|---|---|---|
| `ice` | Break the ice (new, or not close yet) | Open with someone not known well. Anchor on the shared situation, then an easy question |
| `quick` | Say something quick (a minute or less) | One warm, complete line for passing moments: elevator, kitchen, pickup, a quick text. Needs no long answer |
| `deeper` | Go deeper (past small talk) | Move past updates to experiences, opinions, stories, values; answerable lightly or personally |
| `revive` | Revive it (it's gone flat or tense) | A fresh topic or a playful turn when talk has stalled or turned awkward. For kids: more than one-word answers |
| `checkin` | Check in (how are they, really?) | Invite an honest answer without prying; easy to answer at any depth |
| `reconnect` | Reconnect (it's been a while) / Follow up | Low-demand reach-out after a gap, naming a specific reason; for new contacts, follow up on when you met |
| `support` | Be there (they're going through something hard) | Presence, an invitation to talk, one specific offer. No "How are you?", no advice, no "at least" |
| `repair` | Patch things up (after a fight, or to apologize) | Own your part plainly, no "but", invite them back; or a simple apology |
| `plans` | Make plans / Ask them out / Set up a playdate / Ask for their time or help | A concrete, easy-to-accept suggestion with an easy out |
| `celebrate` | Celebrate their news | Specific, warm congratulations plus a question that lets them tell the story |
| `goodbye` | Say goodbye or wrap up | Leave a conversation gracefully, or say goodbye to someone leaving (a job, a move) and keep the door open |

## How deep the app goes

Each person has a depth ceiling (`ceiling` in `WHO`). The purpose sets where a set starts: `ice`, `quick`, `reconnect`, `plans`, `celebrate`, `goodbye` start light; `revive`, `checkin`, `support`, `repair` start at medium (if the person allows it); `deeper` starts at the person's ceiling. A starter shows only when its depth is at or below where the set starts, so **light starters count for every purpose**, and a medium starter does not count toward `ice`.

## Writing rules

These come from the research guidelines (G numbers refer to the research report).

1. Specific and easy to answer. Never a status check: no "How are you?", "What's new?", "How was your day?", "How was school?" (G1, G10)
2. For people not known well, anchor on the shared situation first, then a question (G2, G3)
3. Let the other person choose how deep to go (G4)
4. Positive framing, recent past or near future (G5)
5. Written to be said out loud (or sent, for `message`) by a normal adult. No card-game phrasing, nothing cheesy, nothing that sounds like an interview or therapy (G8, G14)
6. No question that is a pretext for the user's own story. `shareBack` comes after the follow-ups (G9, G30)
7. No broad, high-effort openers: no "What are you passionate about?", "Tell me about yourself" (G13)
8. With people not known well, do not presume status: no questions about marriage, partners, having children, or "Where are you from?"; in social settings no "What do you do?" (G11)
9. With family and close friends, no getting-to-know-you questions (G19)
10. Reconnecting: short and low-demand, a specific reason, nothing that needs a long reply (G7, G25)
11. `child`: one specific question with a timing cue; never broad; never "why do you feel that" (G22)
12. `teen`: statements and offers more than questions, side by side or by text, never a string of questions (G22)
13. `partner`: daily life and what is on their mind, with a cue to listen and not fix (G23)
14. Parents and older relatives: make them the expert with story and history prompts (G24)
15. Mix the forms: in each file at least a third of the starters are not plain questions (G7, G26)
16. No statistics, no promises about what a line will achieve (G15)
17. Original wording only. Use other authors' patterns, not their lines
18. No names, no gendered pronouns (use "they" and "them"), nothing that describes a real person. Refer to third parties generically ("the hosts", "your team", "the kids")
