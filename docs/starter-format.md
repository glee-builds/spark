# Starter format

How the starter library is written. Each file in `data/` is a JSON array of starter bundles. Adding or editing a starter needs no code change; run `node --test` afterwards to check the format and coverage.

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
  "who": ["colleague", "friend", "neighbor"],
  "closeness": ["just-met", "a-little", "well"],
  "where": ["any"],
  "goals": ["break-ice", "silence"],
  "topics": ["plans"],
  "riskTags": [],
  "basis": "expert-opinion"
}
```

| Field | Rules |
|---|---|
| `id` | Unique. Two-letter file prefix, a hyphen, three digits: `fa-` family, `fr-` friends, `wk-` work, `nw-` networking, `ot-` other |
| `line` | What the user says (or sends, for `text`). One or two short sentences, at most 140 characters. Natural spoken English |
| `form` | One of `question`, `statement` (an observation or tentative read, no question mark needed), `compliment` (specific compliment plus a question), `share` (a short disclosure with a hook, ending by handing the turn back), `advice` (asks for their advice or experience), `reachout` (a message after a gap; only with `where: ["text"]`) |
| `followUps` | One or two follow-up questions the user can ask after the answer. Each at most 90 characters. Must work for most likely answers |
| `shareBack` | One sentence telling the user what to offer about themself after the follow-ups, and to hand the turn back. Written as an instruction ("Offer...", "Mention..."). At most 140 characters |
| `deliveryCue` | `null`, or one short tip on how or when to say it (at most 90 characters). Required for `child` and `teen` starters (a timing cue) and for `partner` starters at medium or deep (a listening cue such as "Listen; don't fix.") |
| `depth` | `light` (setting, tastes, plans), `medium` (experiences, opinions, stories, what excites or stresses), `deep` (values, fears, regrets, the relationship itself) |
| `who` | One or more ids from the Who list below. No `"any"` |
| `closeness` | One or more of `just-met`, `a-little`, `well`, `very-close`, `lost-touch` |
| `where` | One or more ids from the Where list, or `["any"]`. `"any"` means every situation **except** `text`. A starter shown for `text` must list `text` and be written as a message |
| `goals` | One or more of `break-ice`, `deeper`, `fun`, `silence`, `learn`, `reconnect` |
| `topics` | One or two of: `setting`, `food`, `plans`, `week`, `work`, `projects`, `hobbies`, `entertainment`, `travel`, `family`, `kids`, `memories`, `learning`, `opinions`, `values`, `feelings`, `home`, `neighborhood`, `sports`, `stories`, `advice`, `connection` |
| `riskTags` | Zero or more of `work`, `money`, `politics`, `religion`, `health`, `appearance`, `relationship-status`, `children`, `origin`. Tag honestly: a question about someone's job is `work`; asking whether they have kids is `children` |
| `basis` | `research-backed` (the pattern itself is tested: follow-up-led, compliment, advice within their expertise, reach-out after a gap), `expert-opinion` (follows coach or clinician guidance), or `untested` (our own extrapolation, for example for bosses, clients, in-laws, neighbors) |

## Who

| id | Label | Allowed closeness | Allowed where |
|---|---|---|---|
| `partner` | Partner | `very-close` | `home`, `car`, `party`, `holiday`, `text` |
| `parent` | Parent or older relative | `well`, `very-close`, `lost-touch` | `home`, `car`, `party`, `holiday`, `big-event`, `text` |
| `relative` | Sibling or other relative | `a-little`, `well`, `very-close`, `lost-touch` | `home`, `car`, `party`, `holiday`, `big-event`, `text` |
| `in-law` | In-law | `just-met`, `a-little`, `well`, `very-close` | `home`, `car`, `party`, `holiday`, `big-event`, `text` |
| `teen` | Teenager | `very-close` | `home`, `car`, `holiday`, `text` |
| `child` | Young child | `very-close` | `home`, `car`, `holiday`, `kids-activity` |
| `friend` | Friend | `a-little`, `well`, `very-close`, `lost-touch` | `party`, `out-about`, `home`, `car`, `big-event`, `video-call`, `text` |
| `colleague` | Colleague | `just-met`, `a-little`, `well`, `very-close` | `work-meeting`, `video-call`, `party`, `networking`, `out-about`, `car`, `text` |
| `boss` | Boss or senior leader | `just-met`, `a-little`, `well` | `work-meeting`, `video-call`, `party`, `networking` |
| `client` | Client or business contact | `just-met`, `a-little`, `well` | `work-meeting`, `video-call`, `party`, `networking`, `text` |
| `event-contact` | Someone at an event | `just-met`, `a-little` | `networking`, `party`, `big-event`, `video-call` |
| `mentor` | Someone I want to learn from | `just-met`, `a-little`, `well` | `networking`, `work-meeting`, `video-call`, `party`, `text` |
| `date` | Date | `just-met`, `a-little`, `well` | `party`, `out-about`, `car`, `text` |
| `neighbor` | Neighbor | `just-met`, `a-little`, `well` | `out-about`, `party`, `kids-activity`, `text` |
| `other-parent` | Another parent | `just-met`, `a-little`, `well` | `kids-activity`, `party`, `out-about`, `text` |

## Where

| id | Label | Notes for writing |
|---|---|---|
| `networking` | Networking event or conference | Short, can be overheard. Anchor on the event, the talks, the organizer |
| `work-meeting` | Work meeting or one-on-one | The minutes before or after, or a one-on-one |
| `video-call` | Video call | The first minutes while people join |
| `party` | Party or dinner | Includes a work social, dinner out, drinks |
| `big-event` | Wedding or big family event | Anchor on the couple, the hosts, the occasion |
| `holiday` | Holiday table | Family gathered, others listening |
| `kids-activity` | Kids' activity or school pickup | Short, standing around, kids nearby |
| `out-about` | Out and about | A neighbor in the street, a line, the gym, a walk |
| `car` | Car ride | Side by side, private, time to talk |
| `home` | At home, everyday | Private, unhurried |
| `text` | Text or phone check-in | Written as the message itself. Must not demand a long reply |

## Depth the app will show

Closeness sets a ceiling: `just-met` light; `a-little`, `well`, `lost-touch` medium; `very-close` deep. `car` and `home` raise it one level; `networking`, `kids-activity`, and `out-about` lower it one level. `boss`, `client`, and `in-law` never go above medium. So a `deep` starter is only ever shown to very close people, or to people known well in a car or at home. Tag `closeness` and `where` with that in mind.

## Risky topics

A starter with a `riskTags` entry is hidden when closeness is `just-met` or `a-little`, and always hidden for `boss`, `client`, and `in-law`. Two exceptions: `work` is allowed in `networking`, `work-meeting`, and `video-call`, and for `colleague`, `boss`, `client`, and `mentor`; `children` is allowed for `other-parent` and at `kids-activity`. Never write a starter that comments on weight, diet, or looks.

## Writing rules

These come from the research guidelines (G numbers refer to the research report).

1. Specific and easy to answer. Never a status check: no "How are you?", "What's new?", "How was your day?", "How was school?" (G1, G10)
2. For people just met, anchor on the shared situation first: a remark about the place, event, food, or host, then a question (G2, G3)
3. Let the other person choose how deep to go: a question answerable lightly or personally (G4)
4. Positive framing, recent past or near future: "Anything you're looking forward to?" (G5)
5. Written to be said out loud by a normal adult. No card-game phrasing ("If you could have dinner with anyone, dead or alive..."), nothing cheesy, nothing that sounds like an interview or a therapy session (G8, G14)
6. No question that is a pretext for the user's own story. `shareBack` comes after the follow-ups, never first (G9, G30)
7. No broad, high-effort openers: no "What are you passionate about?", "Tell me about yourself", "What's your story?" (G13)
8. With people not known well, do not presume status: no questions about marriage, partner, having children, or "Where are you from?"; in social settings no "What do you do?" (G11)
9. With people known well or very close, no getting-to-know-you questions. Use what is on their mind lately, shared memories, shared history, and their opinions (G19)
10. For `lost-touch`, short and low-demand: say you thought of them, name a specific memory or reason, ask nothing that needs a long answer (G7, G25)
11. `child`: one specific question, never broad, with a timing cue such as "Try at bedtime or one-on-one." Never "why do you feel that" (G22)
12. `teen`: openers that need no reply, statements and offers more than questions, side by side or by text, never a string of questions (G22)
13. `partner`: daily life and what is on their mind, stress from outside the relationship, with a cue to listen and not fix (G23)
14. `parent` and older relatives: make them the expert with story and history prompts (G24)
15. Mix the forms. In each file at least a third of the starters are not plain questions (G7, G26)
16. No statistics, no promises, no claims about what a question will achieve (G15)
17. Original wording only. Do not copy question lists from any author, book, card deck, or website. Use their patterns, write your own lines
18. No names, no gendered pronouns (use "they" and "them"), nothing that describes a real person. Refer to third parties generically ("the hosts", "your team", "the kids")
