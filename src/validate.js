// Checks that a starter bundle follows docs/starter-format.md.
// Used by the tests, so a typo in the library is caught before it ships.

import { WHO, WHERE, CLOSENESS, DEPTHS, FORMS, GOALS, TOPICS, RISK_TAGS, BASES } from './config.js';

const ids = (list) => list.map((x) => x.id);
const BANNED = [/how are you\??$/i, /what'?s new\??$/i, /how was your day\??$/i,
  /how was school\??$/i, /what do you do\??$/i, /where are you from\??$/i,
  /passionate about/i, /tell me about yourself/i, /what'?s your story/i,
  /\b(he|him|his|she|her|hers)\b/i];

function allIn(values, allowed) {
  return Array.isArray(values) && values.every((v) => allowed.includes(v));
}

// Returns a list of problems with one starter. An empty list means it is fine.
export function problems(s) {
  const out = [];
  const say = (msg) => out.push(`${s.id || '(no id)'}: ${msg}`);
  if (!/^[a-z]{2}-\d{3}$/.test(s.id || '')) say('id must look like "fa-001"');
  if (typeof s.line !== 'string' || s.line.length < 8) say('line is missing');
  else if (s.line.length > 140) say(`line is ${s.line.length} characters (max 140)`);
  if (!FORMS.includes(s.form)) say(`form "${s.form}" is not allowed`);
  if (!Array.isArray(s.followUps) || s.followUps.length < 1 || s.followUps.length > 2) say('needs one or two followUps');
  else s.followUps.forEach((f) => { if (typeof f !== 'string' || f.length > 90) say('a followUp is over 90 characters'); });
  if (typeof s.shareBack !== 'string' || s.shareBack.length < 8) say('shareBack is missing');
  else if (s.shareBack.length > 140) say('shareBack is over 140 characters');
  if (s.deliveryCue !== null && (typeof s.deliveryCue !== 'string' || s.deliveryCue.length > 90)) say('deliveryCue must be null or at most 90 characters');
  if (!DEPTHS.includes(s.depth)) say(`depth "${s.depth}" is not allowed`);
  if (!allIn(s.who, ids(WHO)) || s.who.length === 0) say('who has an unknown id or is empty');
  if (!allIn(s.closeness, ids(CLOSENESS)) || s.closeness.length === 0) say('closeness has an unknown id or is empty');
  if (!allIn(s.where, [...ids(WHERE), 'any']) || s.where.length === 0) say('where has an unknown id or is empty');
  if (!allIn(s.goals, GOALS) || s.goals.length === 0) say('goals has an unknown id or is empty');
  if (!allIn(s.topics, TOPICS) || s.topics.length < 1 || s.topics.length > 2) say('topics needs one or two known topics');
  if (!allIn(s.riskTags, RISK_TAGS)) say('riskTags has an unknown tag');
  if (!BASES.includes(s.basis)) say(`basis "${s.basis}" is not allowed`);
  if (s.form === 'reachout' && !(s.where.length === 1 && s.where[0] === 'text')) say('reachout starters must be where: ["text"]');
  if (Array.isArray(s.who) && (s.who.includes('child') || s.who.includes('teen')) && !s.deliveryCue) say('child and teen starters need a deliveryCue');
  const text = [s.line, ...(s.followUps || []), s.shareBack || '', s.deliveryCue || ''].join(' | ');
  for (const pattern of BANNED) {
    if (pattern.test(s.line || '') || (pattern.source.includes('him') && pattern.test(text))) {
      say(`uses a banned phrase or a gendered pronoun (${pattern.source})`);
    }
  }
  return out;
}
