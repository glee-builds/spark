// The choices shown on each screen, and which combinations make sense.
// Everything here is a generic category. The app never stores names.

export const DEPTHS = ['light', 'medium', 'deep'];

export const CLOSENESS = [
  { id: 'just-met', label: 'Just met', hint: 'First conversation, or about to be' },
  { id: 'a-little', label: 'A little', hint: 'Have talked a few times' },
  { id: 'well', label: 'Well', hint: 'Regular contact' },
  { id: 'very-close', label: 'Very close', hint: 'Talk about anything' },
  { id: 'lost-touch', label: 'Lost touch', hint: 'Knew them well, long gap' },
];

export const WHERE = [
  { id: 'networking', label: 'Networking event or conference', adjust: -1 },
  { id: 'work-meeting', label: 'Work meeting or one-on-one', adjust: 0 },
  { id: 'video-call', label: 'Video call', adjust: 0 },
  { id: 'party', label: 'Party or dinner', adjust: 0 },
  { id: 'big-event', label: 'Wedding or big family event', adjust: 0 },
  { id: 'holiday', label: 'Holiday table', adjust: 0 },
  { id: 'kids-activity', label: "Kids' activity or school pickup", adjust: -1 },
  { id: 'out-about', label: 'Out and about', adjust: -1 },
  { id: 'car', label: 'Car ride', adjust: 1 },
  { id: 'home', label: 'At home, everyday', adjust: 1 },
  { id: 'text', label: 'Text or phone check-in', adjust: 0 },
];

// group: which heading the person appears under on the Who screen.
// closeness: the "How well" answers that make sense. One answer = step skipped.
// where: the situations offered for this person.
// cap: the deepest level ever shown for this role, whatever the closeness.
export const WHO = [
  { id: 'partner', label: 'Partner', group: 'Family',
    closeness: ['very-close'],
    where: ['home', 'car', 'party', 'holiday', 'text'] },
  { id: 'parent', label: 'Parent or older relative', group: 'Family',
    closeness: ['well', 'very-close', 'lost-touch'],
    where: ['home', 'car', 'party', 'holiday', 'big-event', 'text'] },
  { id: 'relative', label: 'Sibling or other relative', group: 'Family',
    closeness: ['a-little', 'well', 'very-close', 'lost-touch'],
    where: ['home', 'car', 'party', 'holiday', 'big-event', 'text'] },
  { id: 'in-law', label: 'In-law', group: 'Family', cap: 'medium',
    closeness: ['just-met', 'a-little', 'well', 'very-close'],
    where: ['home', 'car', 'party', 'holiday', 'big-event', 'text'] },
  { id: 'teen', label: 'Teenager', group: 'Family',
    closeness: ['very-close'],
    where: ['home', 'car', 'holiday', 'text'] },
  { id: 'child', label: 'Young child', group: 'Family',
    closeness: ['very-close'],
    where: ['home', 'car', 'holiday', 'kids-activity'] },

  { id: 'friend', label: 'Friend', group: 'Friends',
    closeness: ['a-little', 'well', 'very-close', 'lost-touch'],
    where: ['party', 'out-about', 'home', 'car', 'big-event', 'video-call', 'text'] },

  { id: 'colleague', label: 'Colleague', group: 'Work',
    closeness: ['just-met', 'a-little', 'well', 'very-close'],
    where: ['work-meeting', 'video-call', 'party', 'networking', 'out-about', 'car', 'text'] },
  { id: 'boss', label: 'Boss or senior leader', group: 'Work', cap: 'medium',
    closeness: ['just-met', 'a-little', 'well'],
    where: ['work-meeting', 'video-call', 'party', 'networking'] },
  { id: 'client', label: 'Client or business contact', group: 'Work', cap: 'medium',
    closeness: ['just-met', 'a-little', 'well'],
    where: ['work-meeting', 'video-call', 'party', 'networking', 'text'] },

  { id: 'event-contact', label: 'Someone at an event', group: 'Networking',
    closeness: ['just-met', 'a-little'],
    where: ['networking', 'party', 'big-event', 'video-call'] },
  { id: 'mentor', label: 'Someone I want to learn from', group: 'Networking',
    closeness: ['just-met', 'a-little', 'well'],
    where: ['networking', 'work-meeting', 'video-call', 'party', 'text'] },

  { id: 'date', label: 'Date', group: 'Other',
    closeness: ['just-met', 'a-little', 'well'],
    where: ['party', 'out-about', 'car', 'text'] },
  { id: 'neighbor', label: 'Neighbor', group: 'Other',
    closeness: ['just-met', 'a-little', 'well'],
    where: ['out-about', 'party', 'kids-activity', 'text'] },
  { id: 'other-parent', label: 'Another parent', group: 'Other',
    closeness: ['just-met', 'a-little', 'well'],
    where: ['kids-activity', 'party', 'out-about', 'text'] },
];

// The first screen: five groups, each opening a short list of people.
export const GROUPS = [
  { id: 'Family', hint: 'Partner, parents, relatives, kids' },
  { id: 'Friends', hint: 'Old friends and new ones' },
  { id: 'Work', hint: 'Colleagues, bosses, clients' },
  { id: 'Networking', hint: 'New contacts, people to learn from' },
  { id: 'Other', hint: 'Dates, neighbors, other parents' },
];

export const FORMS = ['question', 'statement', 'compliment', 'share', 'advice', 'reachout'];
export const GOALS = ['break-ice', 'deeper', 'fun', 'silence', 'learn', 'reconnect'];

// What the user is going for. Shown on the "Aim" screen.
export const GOAL_LABELS = {
  'break-ice': 'Break the ice',
  deeper: 'Go deeper',
  fun: 'Have fun',
  silence: 'Fill a silence',
  learn: 'Learn from them',
  reconnect: 'Reconnect',
};
export const TOPICS = ['setting', 'food', 'plans', 'week', 'work', 'projects', 'hobbies',
  'entertainment', 'travel', 'family', 'kids', 'memories', 'learning', 'opinions', 'values',
  'feelings', 'home', 'neighborhood', 'sports', 'stories', 'advice', 'connection'];
export const RISK_TAGS = ['work', 'money', 'politics', 'religion', 'health', 'appearance',
  'relationship-status', 'children', 'origin'];
export const BASES = ['research-backed', 'expert-opinion', 'untested'];

export function findWho(id) { return WHO.find((w) => w.id === id); }
export function findWhere(id) { return WHERE.find((w) => w.id === id); }
export function findCloseness(id) { return CLOSENESS.find((c) => c.id === id); }

// Every Who / How well / Where combination the screens can produce.
export function allCombinations() {
  const out = [];
  for (const who of WHO) {
    for (const closeness of who.closeness) {
      for (const where of who.where) out.push({ who: who.id, closeness, where });
    }
  }
  return out;
}
