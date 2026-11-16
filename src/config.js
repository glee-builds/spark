// The choices on each screen, and which combinations make sense.
// Everything here is a generic category. The app never stores names.
//
// The flow: Who (a tile, then a person) -> "Right now I want to..." -> starters,
// with an "In person or call / Message" switch on the starters screen.
// See _briefs/spark/reports/Refining the three questions.md for why.

// How personal a starter is, lightest first. See docs/starter-format.md.
export const DEPTHS = ['light', 'casual', 'personal', 'deep'];

export const MEDIA = [
  { id: 'in-person', label: 'In person or call' },
  { id: 'message', label: 'Message' },
];

// "Right now I want to..." Each person sees 7 or fewer of these.
// level: where the starters begin. light = light; casual = casual if allowed;
// max = personal, or lower if this person's ceiling is lower. Deep is always one
// tap of "Deeper" away, never the starting point.
export const PURPOSES = {
  ice: { label: 'Break the ice', hint: 'new, or not close yet', level: 'light' },
  quick: { label: 'Say something quick', hint: 'a minute or less', level: 'light' },
  deeper: { label: 'Go deeper', hint: 'past small talk', level: 'max' },
  revive: { label: 'Revive it', hint: "it's gone flat or tense", level: 'casual' },
  checkin: { label: 'Check in', hint: 'how are they, really?', level: 'casual' },
  reconnect: { label: 'Reconnect', hint: "it's been a while", level: 'light' },
  support: { label: 'Be there', hint: "they're going through something hard", level: 'casual' },
  repair: { label: 'Patch things up', hint: 'after a fight, or to apologize', level: 'casual' },
  plans: { label: 'Make plans', hint: 'suggest getting together', level: 'light' },
  celebrate: { label: 'Celebrate their news', hint: 'a win, a milestone, good news', level: 'light' },
  goodbye: { label: 'Say goodbye or wrap up', hint: "leaving, or they're leaving", level: 'light' },
};

// Labels that read better for some people.
const ONE_WORD = { revive: { label: 'Get more than one-word answers', hint: 'past "fine" and "nothing"' } };
const FOLLOW_UP = { reconnect: { label: 'Follow up', hint: 'after we met or talked' } };
const ASK_TIME = { plans: { label: 'Ask for their time or help', hint: 'advice, an intro, a coffee' } };

// The first screen. Tiles with one person go straight to the next question.
export const GROUPS = [
  { id: 'family', label: 'Partner or family', hint: 'Partner, parents, relatives, kids' },
  { id: 'friends', label: 'Friends', hint: 'Close, casual, or from the past' },
  { id: 'work', label: 'Work & career', hint: 'Colleagues, bosses, clients' },
  { id: 'new', label: 'Someone new', hint: 'Just met, or about to' },
  { id: 'date', label: 'Date or match', hint: 'In person or on an app' },
  { id: 'community', label: 'Neighbors & community', hint: 'Neighbors, parents, clubs' },
  { id: 'group', label: 'A group', hint: 'A table, a team, a group chat' },
];

// Each person:
//   group     which tile they sit under
//   ceiling   the deepest level ever shown (light / casual / personal / deep)
//   careful   hide risky topics (money, health, family status...) for this person
//   workOk    questions about their work are fine
//   kidsOk    questions about their kids are fine
//   purposes  the "Right now I want to..." options, in order (7 or fewer)
//   media     'in-person' and/or 'message'
//   labels    purpose labels worded for this person
//   file      the data file that holds their starters
const BOTH = ['in-person', 'message'];

export const WHO = [
  // Partner or family
  { id: 'partner', label: 'Partner', group: 'family', ceiling: 'deep', file: 'family',
    purposes: ['checkin', 'deeper', 'revive', 'support', 'repair', 'plans', 'celebrate'], media: BOTH,
    labels: { revive: { label: 'Get past logistics', hint: 'more than schedules and chores' } } },
  { id: 'parent', label: 'Parent or older relative', group: 'family', ceiling: 'deep', file: 'family',
    purposes: ['checkin', 'deeper', 'reconnect', 'support', 'repair', 'plans', 'celebrate'], media: BOTH },
  { id: 'relative', label: 'Sibling or other relative', group: 'family', ceiling: 'deep', file: 'family',
    purposes: ['ice', 'checkin', 'deeper', 'reconnect', 'support', 'repair', 'celebrate'], media: BOTH },
  { id: 'in-law', label: 'In-law', group: 'family', ceiling: 'personal', careful: true, file: 'family',
    purposes: ['ice', 'quick', 'deeper', 'revive', 'checkin', 'support', 'celebrate'], media: BOTH },
  { id: 'child', label: 'Young child', group: 'family', ceiling: 'deep', kidsOk: true, file: 'kids',
    purposes: ['revive', 'checkin', 'deeper', 'support', 'repair', 'plans', 'celebrate'], media: ['in-person'],
    labels: { ...ONE_WORD, plans: { label: 'Plan something together', hint: 'an outing, a project' } } },
  { id: 'teen', label: 'Teenager (13–17)', group: 'family', ceiling: 'deep', file: 'kids',
    purposes: ['revive', 'checkin', 'deeper', 'support', 'repair', 'plans', 'celebrate'], media: BOTH,
    labels: { ...ONE_WORD, plans: { label: 'Plan something together', hint: 'just the two of you' } } },
  { id: 'grown-child', label: 'Grown child (18+)', group: 'family', ceiling: 'deep', file: 'kids',
    purposes: ['checkin', 'revive', 'deeper', 'reconnect', 'support', 'plans', 'celebrate'], media: BOTH },

  // Friends
  { id: 'close-friend', label: 'Close friend', group: 'friends', ceiling: 'deep', file: 'friends',
    purposes: ['checkin', 'deeper', 'reconnect', 'support', 'repair', 'plans', 'celebrate'], media: BOTH },
  { id: 'friend', label: 'Friend', group: 'friends', ceiling: 'personal', file: 'friends',
    purposes: ['checkin', 'deeper', 'revive', 'reconnect', 'support', 'plans', 'celebrate'], media: BOTH },
  { id: 'acquaintance', label: 'Acquaintance (class, gym, club)', group: 'friends', ceiling: 'personal',
    careful: true, file: 'friends',
    purposes: ['ice', 'quick', 'deeper', 'revive', 'plans', 'support', 'celebrate'], media: BOTH },
  { id: 'past', label: 'Someone from my past (ex, old classmate)', group: 'friends', ceiling: 'personal',
    careful: true, file: 'friends',
    purposes: ['reconnect', 'quick', 'revive', 'repair', 'plans', 'support', 'celebrate'], media: BOTH },

  // Work & career
  { id: 'colleague', label: 'Colleague', group: 'work', ceiling: 'personal', careful: true, workOk: true, file: 'work',
    purposes: ['ice', 'quick', 'deeper', 'revive', 'checkin', 'support', 'goodbye'], media: BOTH },
  { id: 'work-friend', label: 'Work friend', group: 'work', ceiling: 'personal', workOk: true, file: 'work',
    purposes: ['quick', 'checkin', 'deeper', 'support', 'plans', 'celebrate', 'goodbye'], media: BOTH },
  { id: 'boss', label: 'Boss or senior leader (current or former)', group: 'work', ceiling: 'personal',
    careful: true, workOk: true, file: 'work',
    purposes: ['ice', 'quick', 'deeper', 'revive', 'plans', 'celebrate', 'goodbye'], media: BOTH, labels: ASK_TIME },
  { id: 'report', label: 'Someone I manage', group: 'work', ceiling: 'personal', careful: true, workOk: true,
    file: 'work',
    purposes: ['ice', 'quick', 'checkin', 'deeper', 'revive', 'support', 'celebrate'], media: BOTH },
  { id: 'client', label: 'Client or customer', group: 'work', ceiling: 'personal', careful: true, workOk: true,
    file: 'work',
    purposes: ['ice', 'quick', 'revive', 'reconnect', 'plans', 'celebrate', 'goodbye'], media: BOTH,
    labels: { ...FOLLOW_UP, plans: { label: 'Set up next steps', hint: 'a meeting, a coffee' } } },
  { id: 'mentor', label: 'Someone I want to learn from', group: 'work', ceiling: 'personal', careful: true,
    workOk: true, file: 'networking',
    purposes: ['ice', 'quick', 'deeper', 'revive', 'reconnect', 'plans', 'goodbye'], media: BOTH,
    labels: { ...FOLLOW_UP, ...ASK_TIME } },
  { id: 'recruiter', label: 'Recruiter or interviewer', group: 'work', ceiling: 'light', careful: true,
    workOk: true, file: 'networking',
    purposes: ['ice', 'quick', 'revive', 'reconnect', 'goodbye'], media: BOTH, labels: FOLLOW_UP },

  // Single tiles
  { id: 'someone-new', label: 'Someone new', group: 'new', ceiling: 'personal', careful: true, workOk: true,
    file: 'networking',
    purposes: ['ice', 'quick', 'revive', 'deeper', 'reconnect', 'plans', 'goodbye'], media: BOTH,
    labels: { ...FOLLOW_UP, plans: { label: 'Stay in touch', hint: 'swap details, suggest meeting' } } },
  { id: 'date', label: 'Date or match', group: 'date', ceiling: 'personal', careful: true, file: 'other',
    purposes: ['ice', 'deeper', 'revive', 'reconnect', 'plans', 'goodbye'], media: BOTH,
    labels: { plans: { label: 'Ask them out', hint: 'or plan the next date' } } },

  // Neighbors & community
  { id: 'neighbor', label: 'Neighbor', group: 'community', ceiling: 'personal', careful: true, file: 'other',
    purposes: ['ice', 'quick', 'deeper', 'revive', 'support', 'repair', 'plans'], media: BOTH },
  { id: 'other-parent', label: 'Another parent', group: 'community', ceiling: 'personal', careful: true,
    kidsOk: true, file: 'other',
    purposes: ['ice', 'quick', 'deeper', 'revive', 'support', 'plans', 'celebrate'], media: BOTH,
    labels: { plans: { label: 'Set up a playdate', hint: 'or a meet-up' } } },
  { id: 'community', label: 'Someone from church, team, or club', group: 'community', ceiling: 'personal',
    careful: true, file: 'other',
    purposes: ['ice', 'quick', 'deeper', 'revive', 'checkin', 'support', 'plans'], media: BOTH },

  // A group
  { id: 'group-family', label: 'Family', group: 'group', ceiling: 'personal', file: 'family',
    purposes: ['revive', 'deeper', 'checkin', 'plans', 'celebrate'], media: BOTH,
    labels: { revive: { label: 'Get everyone talking', hint: 'past the usual updates' } } },
  { id: 'group-friends', label: 'Friends', group: 'group', ceiling: 'personal', file: 'friends',
    purposes: ['revive', 'deeper', 'reconnect', 'plans', 'celebrate'], media: BOTH,
    labels: { revive: { label: 'Wake up the chat', hint: 'or a quiet table' } } },
  { id: 'group-coworkers', label: 'Coworkers', group: 'group', ceiling: 'light', careful: true, workOk: true,
    file: 'work',
    purposes: ['ice', 'quick', 'revive', 'celebrate', 'goodbye'], media: BOTH },
  { id: 'group-new', label: 'People I just met', group: 'group', ceiling: 'light', careful: true, workOk: true,
    file: 'networking',
    purposes: ['ice', 'quick', 'revive', 'goodbye'], media: ['in-person'],
    labels: { ice: { label: 'Join the group', hint: 'or start one' } } },
];

export const FORMS = ['question', 'statement', 'compliment', 'share', 'advice', 'reachout'];
export const TOPICS = ['setting', 'food', 'plans', 'week', 'work', 'projects', 'hobbies',
  'entertainment', 'travel', 'family', 'kids', 'memories', 'learning', 'opinions', 'values',
  'feelings', 'home', 'neighborhood', 'sports', 'stories', 'advice', 'connection'];
export const RISK_TAGS = ['work', 'money', 'politics', 'religion', 'health', 'appearance',
  'relationship-status', 'children', 'origin'];
export const BASES = ['research-backed', 'expert-opinion', 'untested'];
export const LIBRARY_FILES = ['family', 'kids', 'friends', 'work', 'networking', 'other'];

// "Where I live" on the settings screen. Starters that assume a kind of place
// (a front yard, an apartment lobby) are tagged with the places they fit.
export const PLACES = [
  { id: 'city', label: 'City', hint: 'Apartments, sidewalks, transit' },
  { id: 'suburb', label: 'Suburb or town', hint: 'Houses, yards, driving' },
  { id: 'rural', label: 'Rural', hint: 'Open space, long drives' },
];

// The comfort setting on the settings screen.
export const COMFORT = [
  { id: 'standard', label: 'Standard', hint: 'Balanced for most people' },
  { id: 'reserved', label: 'More reserved', hint: "Lighter topics; nothing personal unless you're very close" },
  { id: 'direct', label: 'Direct', hint: 'Plain questions; fewer guesses about how someone feels' },
];

export function findWho(id) { return WHO.find((w) => w.id === id); }
export function findGroup(id) { return GROUPS.find((g) => g.id === id); }

// The label and hint for a purpose, worded for this person.
export function purposeLabel(whoId, purposeId) {
  const person = findWho(whoId);
  return { ...PURPOSES[purposeId], ...((person && person.labels && person.labels[purposeId]) || {}) };
}

// Every person / purpose / medium combination the screens can produce.
export function allCombinations() {
  const out = [];
  for (const who of WHO) {
    for (const purpose of who.purposes) {
      for (const medium of who.media) out.push({ who: who.id, purpose, medium });
    }
  }
  return out;
}
