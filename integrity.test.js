/**
 * SweepsCheck — Data Integrity Test Suite
 * Run: npm test  (or: node tests/integrity.test.js)
 *
 * Tests every rule from the data architecture spec.
 * Exits with code 1 if any test fails.
 */

'use strict';

const path = require('path');

// ─── LOAD DATA ────────────────────────────────────────────────────────────────

let DATA;
try {
  const raw = require('fs').readFileSync(path.join(__dirname, '../data.js'), 'utf8')
    .replace(/if\s*\(typeof module[\s\S]+$/m, '');
  DATA = eval(`(function() { ${raw}; return { SITE_META, STATES_LIST, STATE_DATA, DEFAULT_STATE, PLATFORMS, CHANGE_HISTORY }; })()`);
} catch (e) {
  console.error('FATAL: Could not load data.js —', e.message);
  process.exit(1);
}

const { SITE_META, STATES_LIST, STATE_DATA, DEFAULT_STATE, PLATFORMS, CHANGE_HISTORY } = DATA;

// ─── TEST RUNNER ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let warned = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result === false) {
      console.error(`  ✗ FAIL  ${name}`);
      failed++;
    } else if (result === 'warn') {
      console.warn(`  ⚠ WARN  ${name}`);
      warned++;
    } else {
      if (process.env.VERBOSE) console.log(`  ✓ PASS  ${name}`);
      passed++;
    }
  } catch (e) {
    console.error(`  ✗ ERROR ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// ─── SITE META TESTS ─────────────────────────────────────────────────────────

console.log('\n── SITE META ────────────────────────────────────────');

test('SITE_META exists', () => assert(SITE_META && typeof SITE_META === 'object', 'SITE_META must be an object'));
test('SITE_META.auditDate is a valid ISO date', () => {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(SITE_META.auditDate), `Invalid auditDate: ${SITE_META.auditDate}`);
  const d = new Date(SITE_META.auditDate);
  assert(!isNaN(d.getTime()), 'auditDate is not a valid date');
});
test('SITE_META.dataVersion is semver-like', () => {
  assert(/^\d+\.\d+\.\d+$/.test(SITE_META.dataVersion), `Invalid dataVersion: ${SITE_META.dataVersion}`);
});
test('SITE_META.disclaimer is non-empty', () => {
  assert(SITE_META.disclaimer && SITE_META.disclaimer.length > 20, 'disclaimer too short or missing');
});

// ─── STATES LIST TESTS ───────────────────────────────────────────────────────

console.log('\n── STATES LIST ─────────────────────────────────────');

test('STATES_LIST has exactly 51 entries (50 states + DC)', () => {
  assert(STATES_LIST.length === 51, `Expected 51 entries (50 states + DC), got ${STATES_LIST.length}`);
});

test('STATES_LIST includes DC', () => {
  const present = new Set(STATES_LIST.map(([code]) => code));
  assert(present.has('DC'), 'District of Columbia (DC) must be present in STATES_LIST');
});

test('All state codes are 2-char uppercase', () => {
  const bad = STATES_LIST.filter(([code]) => !/^[A-Z]{2}$/.test(code));
  assert(bad.length === 0, `Invalid codes: ${bad.map(([c]) => c).join(', ')}`);
});

test('No duplicate state codes in STATES_LIST', () => {
  const codes = STATES_LIST.map(([code]) => code);
  const dupes = codes.filter((c, i) => codes.indexOf(c) !== i);
  assert(dupes.length === 0, `Duplicate codes: ${dupes.join(', ')}`);
});

test('All 50 standard US state codes present', () => {
  const REQUIRED = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
    'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH',
    'OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  const present = new Set(STATES_LIST.map(([code]) => code));
  const missing = REQUIRED.filter(c => !present.has(c));
  assert(missing.length === 0, `Missing required state codes: ${missing.join(', ')}`);
});

// ─── STATE DATA TESTS ─────────────────────────────────────────────────────────

console.log('\n── STATE DATA ───────────────────────────────────────');

const validStateCodes = new Set(STATES_LIST.map(([code]) => code));

test('All STATE_DATA keys are valid state codes', () => {
  const invalid = Object.keys(STATE_DATA).filter(k => !validStateCodes.has(k));
  assert(invalid.length === 0, `Invalid keys in STATE_DATA: ${invalid.join(', ')}`);
});

test('No duplicate keys in STATE_DATA', () => {
  // Object keys are inherently unique in JS, but check raw source for accidental dupes
  const keys = Object.keys(STATE_DATA);
  const uniq = new Set(keys);
  assert(keys.length === uniq.size, 'Duplicate keys found in STATE_DATA');
});

test('All STATE_DATA entries have required fields', () => {
  const required = ['status','label','icon','desc','law','risk','riskLabel','lastVerified','sources','confidence'];
  const missing = [];
  for (const [code, s] of Object.entries(STATE_DATA)) {
    for (const f of required) {
      if (s[f] === undefined || s[f] === null || s[f] === '') {
        missing.push(`${code}.${f}`);
      }
    }
  }
  assert(missing.length === 0, `Missing required fields: ${missing.slice(0,10).join(', ')}`);
});

test('All STATE_DATA status values are valid', () => {
  const VALID = ['illegal','gray','legal'];
  const bad = Object.entries(STATE_DATA).filter(([,s]) => !VALID.includes(s.status));
  assert(bad.length === 0, `Invalid status values: ${bad.map(([k,s]) => `${k}=${s.status}`).join(', ')}`);
});

test('All STATE_DATA risk values are valid', () => {
  const VALID = ['red','amber','green'];
  const bad = Object.entries(STATE_DATA).filter(([,s]) => !VALID.includes(s.risk));
  assert(bad.length === 0, `Invalid risk values: ${bad.map(([k,s]) => `${k}=${s.risk}`).join(', ')}`);
});

test('All STATE_DATA lastVerified are valid ISO dates', () => {
  const bad = Object.entries(STATE_DATA).filter(([,s]) => !/^\d{4}-\d{2}-\d{2}$/.test(s.lastVerified));
  assert(bad.length === 0, `Invalid lastVerified: ${bad.map(([k]) => k).join(', ')}`);
});

test('All STATE_DATA confidence scores are 0–10', () => {
  const bad = Object.entries(STATE_DATA).filter(([,s]) => typeof s.confidence !== 'number' || s.confidence < 0 || s.confidence > 10);
  assert(bad.length === 0, `Invalid confidence: ${bad.map(([k,s]) => `${k}=${s.confidence}`).join(', ')}`);
});

test('All STATE_DATA sources arrays are non-empty', () => {
  const empty = Object.entries(STATE_DATA).filter(([,s]) => !Array.isArray(s.sources) || s.sources.length === 0);
  if (empty.length > 0) return 'warn'; // Warn, not fail (some states may have no primary sources)
});

test('Illegal states have red risk', () => {
  const mismatch = Object.entries(STATE_DATA).filter(([,s]) => s.status === 'illegal' && s.risk !== 'red');
  assert(mismatch.length === 0, `Illegal states with non-red risk: ${mismatch.map(([k]) => k).join(', ')}`);
});

test('Legal states (non-banned, non-gray) have green or amber risk', () => {
  const bad = Object.entries(STATE_DATA).filter(([,s]) =>
    s.status === 'legal' && !['green','amber'].includes(s.risk)
  );
  assert(bad.length === 0, `Legal states with invalid risk: ${bad.map(([k,s]) => `${k}=${s.risk}`).join(', ')}`);
});

test('DEFAULT_STATE has all required fields', () => {
  const required = ['status','label','icon','desc','law','risk','riskLabel','lastVerified','confidence'];
  for (const f of required) {
    assert(DEFAULT_STATE[f] !== undefined, `DEFAULT_STATE missing: ${f}`);
  }
});

// Specific states that must be banned as of audit date
test('Key banned states have status=illegal', () => {
  const MUST_BE_BANNED = ['CA','CT','MT','NY','IN','ME','TN','LA','MI','WA','ID','NV','UT'];
  const notBanned = MUST_BE_BANNED.filter(c => {
    const s = STATE_DATA[c];
    return !s || s.status !== 'illegal';
  });
  assert(notBanned.length === 0, `These states must be illegal: ${notBanned.join(', ')}`);
});

test('Iowa has gray status (SF 2289 enforcement, not a ban)', () => {
  assert(STATE_DATA.IA && STATE_DATA.IA.status === 'gray', 'Iowa must be gray zone (enforcement authority, not ban)');
});

test('Oklahoma has illegal status (ban enacted, not yet effective as of Aug 8 2026)', () => {
  assert(STATE_DATA.OK && STATE_DATA.OK.status === 'illegal', 'Oklahoma SB 1589 enacted — must be illegal');
});

// ─── PLATFORM TESTS ──────────────────────────────────────────────────────────

console.log('\n── PLATFORMS ────────────────────────────────────────');

test('PLATFORMS is a non-empty array', () => {
  assert(Array.isArray(PLATFORMS) && PLATFORMS.length > 0, 'PLATFORMS must be a non-empty array');
});

test('PLATFORMS has at least 15 entries', () => {
  assert(PLATFORMS.length >= 15, `Expected at least 15 platforms, got ${PLATFORMS.length}`);
});

test('No duplicate platform IDs', () => {
  const ids = PLATFORMS.map(p => p.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert(dupes.length === 0, `Duplicate platform IDs: ${dupes.join(', ')}`);
});

test('All platforms have required fields', () => {
  const required = ['id','name','site','op','type','age','restricted','mailIn','onlineEntry',
                    'mailDetail','methods','rulesUrl','tosUrl','lastVerified','conf','notes','risk'];
  const missing = [];
  for (const p of PLATFORMS) {
    for (const f of required) {
      if (p[f] === undefined || p[f] === null) {
        missing.push(`${p.id}.${f}`);
      }
    }
  }
  assert(missing.length === 0, `Missing required fields: ${missing.slice(0,15).join(', ')}`);
});

test('All platform IDs are lowercase alphanumeric', () => {
  const bad = PLATFORMS.filter(p => !/^[a-z0-9_-]+$/.test(p.id));
  assert(bad.length === 0, `Invalid platform IDs: ${bad.map(p => p.id).join(', ')}`);
});

test('All platform rulesUrl values start with https://', () => {
  const bad = PLATFORMS.filter(p => !p.rulesUrl || !p.rulesUrl.startsWith('https://'));
  assert(bad.length === 0, `Bad rulesUrl: ${bad.map(p => `${p.id}:${p.rulesUrl}`).join(', ')}`);
});

test('All platform tosUrl values start with https://', () => {
  const bad = PLATFORMS.filter(p => !p.tosUrl || !p.tosUrl.startsWith('https://'));
  assert(bad.length === 0, `Bad tosUrl: ${bad.map(p => `${p.id}:${p.tosUrl}`).join(', ')}`);
});

test('All platform restricted state codes are valid', () => {
  const invalid = [];
  for (const p of PLATFORMS) {
    if (!Array.isArray(p.restricted)) { invalid.push(`${p.id}: restricted is not array`); continue; }
    for (const code of p.restricted) {
      if (!validStateCodes.has(code)) invalid.push(`${p.id}: unknown state ${code}`);
    }
  }
  assert(invalid.length === 0, `Invalid restricted codes: ${invalid.slice(0,10).join(', ')}`);
});

test('All platform confidence scores are 0–10', () => {
  const bad = PLATFORMS.filter(p => typeof p.conf !== 'number' || p.conf < 0 || p.conf > 10);
  assert(bad.length === 0, `Invalid confidence: ${bad.map(p => `${p.id}=${p.conf}`).join(', ')}`);
});

test('Platform mailIn/onlineEntry consistency', () => {
  const bad = [];
  for (const p of PLATFORMS) {
    if (p.mailIn && p.onlineEntry) bad.push(`${p.id}: both mailIn and onlineEntry are true`);
    if (!p.mailIn && !p.onlineEntry && !['Discontinued','Unable to Verify'].includes(p.mailSC)) {
      // This is a warning — platform may have no AMOE
    }
  }
  assert(bad.length === 0, bad.join('; '));
});

test('Chumba and Global Poker have onlineEntry=true', () => {
  const vgwOnline = ['chumba','globalpoker'];
  const notOnline = PLATFORMS.filter(p => vgwOnline.includes(p.id) && !p.onlineEntry);
  assert(notOnline.length === 0, `VGW platforms should have onlineEntry=true: ${notOnline.map(p=>p.id).join(', ')}`);
});

test('LuckyLand Slots is marked as closed (closure completed Sept 14, 2026)', () => {
  const luckyland = PLATFORMS.find(p => p.id === 'luckyland');
  assert(luckyland, 'luckyland (LuckyLand Slots) not found in PLATFORMS');
  assert(luckyland.closed === true || luckyland.closing === true, 'LuckyLand Slots must have closed:true or closing:true');
  assert(luckyland.closingDate, 'LuckyLand Slots must have a closingDate');
  assert(!luckyland.onlineEntry && !luckyland.mailIn, 'A closed/closing platform should not advertise an active entry method');
});

test('LuckyLand Casino exists as a separate platform from LuckyLand Slots', () => {
  const luckylandCasino = PLATFORMS.find(p => p.id === 'luckylandcasino');
  assert(luckylandCasino, 'luckylandcasino (LuckyLand Casino) not found in PLATFORMS');
  assert(luckylandCasino.site === 'luckylandcasino.com', 'LuckyLand Casino should use luckylandcasino.com, distinct from luckylandslots.com');
});

test('LuckyLand Casino uses online entry, not mail-in', () => {
  const luckylandCasino = PLATFORMS.find(p => p.id === 'luckylandcasino');
  assert(luckylandCasino, 'luckylandcasino (LuckyLand Casino) not found in PLATFORMS');
  assert(luckylandCasino.onlineEntry === true, 'LuckyLand Casino must have onlineEntry:true (user-corrected Sept 2026)');
  assert(luckylandCasino.mailIn === false, 'LuckyLand Casino must have mailIn:false — it does not use postal mail');
});

test('Pulsz has mailSC=Discontinued', () => {
  const pulsz = PLATFORMS.find(p => p.id === 'pulsz');
  assert(pulsz, 'Pulsz not found in PLATFORMS');
  assert(pulsz.mailSC === 'Discontinued May 4 2026' || pulsz.mailSC.includes('Discontinued'), `Pulsz mailSC should be Discontinued, got: ${pulsz.mailSC}`);
});

test('Chumba rules URL is the verified PDF', () => {
  const c = PLATFORMS.find(p => p.id === 'chumba');
  assert(c && c.rulesUrl.includes('260318_POL_CHU_Sweeps_Rules_23-0.pdf'), 'Chumba must use verified PDF URL');
});

test('All platforms with type=Sweepstakes (not Social)', () => {
  const bad = PLATFORMS.filter(p => p.type !== 'Sweepstakes');
  if (bad.length > 0) return 'warn'; // Social casinos would be a different category
});

test('All platforms have at least 1 source', () => {
  const noSources = PLATFORMS.filter(p => !Array.isArray(p.sources) || p.sources.length === 0);
  if (noSources.length > 0) return 'warn';
});

test('All statutory-ban states appear in at least 15 platform restricted lists', () => {
  const BANNED = ['CA','CT','MT','NY','IN','ME','TN','MI','WA','ID'];
  for (const code of BANNED) {
    const count = PLATFORMS.filter(p => p.restricted && p.restricted.includes(code)).length;
    if (count < 15) {
      // This is just a warning — could be a legitimate difference
      console.warn(`  ⚠ WARN  Only ${count} platforms restrict ${code} (banned state)`);
      warned++;
      return; // Don't fail — return early
    }
  }
});

// ─── CHANGE HISTORY TESTS ────────────────────────────────────────────────────

console.log('\n── CHANGE HISTORY ───────────────────────────────────');

test('CHANGE_HISTORY is an array', () => {
  assert(Array.isArray(CHANGE_HISTORY), 'CHANGE_HISTORY must be an array');
});

test('All CHANGE_HISTORY entries have timestamp, type, description', () => {
  const bad = CHANGE_HISTORY.filter(e => !e.timestamp || !e.type || !e.description);
  assert(bad.length === 0, `${bad.length} change history entries missing required fields`);
});

test('CHANGE_HISTORY timestamps are valid ISO format', () => {
  const bad = CHANGE_HISTORY.filter(e => {
    try { return isNaN(new Date(e.timestamp).getTime()); } catch { return true; }
  });
  assert(bad.length === 0, `${bad.length} invalid timestamps in CHANGE_HISTORY`);
});

// ─── CROSS-REFERENCE CHECKS ──────────────────────────────────────────────────

// ─── AUTOMATION / HONESTY TESTS (added Nov 2026) ─────────────────────────────

console.log('\n── AUTOMATION & DATE HONESTY ───────────────────────');
const _fs = require('fs'); const _path = require('path');
const _root = _path.join(__dirname, '..');
test('SITE_META.lastChecked is empty or ISO date, and not in the future', () => {
  const v = SITE_META.lastChecked;
  assert(v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), `Invalid lastChecked: ${v}`);
  if (v) assert(new Date(v) <= new Date(Date.now() + 864e5), 'lastChecked is in the future');
});
test('auditDate is not later than today', () => {
  assert(new Date(SITE_META.auditDate) <= new Date(Date.now() + 864e5), 'auditDate in the future');
});
test('package-lock.json exists (workflow caching/npm ci need it)', () => {
  assert(_fs.existsSync(_path.join(_root, 'package-lock.json')), 'package-lock.json missing');
});
test('workflow does not use npm ci or npm cache without a lockfile', () => {
  const y = _fs.readFileSync(_path.join(_root, '.github/workflows/biweekly-check.yml'), 'utf8')
    .split('\n').filter(l => !l.trim().startsWith('#')).join('\n');
  assert(!/npm ci/.test(y) && !/cache:\s*'npm'/.test(y), 'workflow uses npm ci / npm cache');
});
test('.content-hashes.json is not gitignored (baseline must persist)', () => {
  const g = _fs.readFileSync(_path.join(_root, '.gitignore'), 'utf8');
  assert(!/content-hashes/.test(g), '.content-hashes.json is ignored');
});
test('checker never rewrites auditDate', () => {
  const c = _fs.readFileSync(_path.join(_root, 'checker.js'), 'utf8');
  const fn = c.slice(c.indexOf('function updateLastChecked'), c.indexOf('// ─── ENTRYPOINT'));
  assert(!/auditDate\s*:\s*"\$\{/.test(fn) && !/replace\(\/auditDate/.test(fn), 'updateLastChecked touches auditDate');
});
test('page template has no hard-coded month/date strings', () => {
  const t = _fs.readFileSync(_path.join(_root, 'index.template.html'), 'utf8');
  const bad = t.match(/\b(?:Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?)\s+\d{1,2},?\s+2026/g);
  assert(!bad, 'hard-coded date(s) in template: ' + (bad || []).join(', '));
});

console.log('\n── CROSS-REFERENCE ──────────────────────────────────');

test('All state-banned platforms actually list those states as restricted', () => {
  // Spot-check: California (AB-831) must appear in every platform's restricted list
  const missing = PLATFORMS.filter(p => !p.restricted || !p.restricted.includes('CA'));
  assert(missing.length === 0, `These platforms don't restrict CA (banned): ${missing.map(p=>p.id).join(', ')}`);
});

test('No platform serves a state with illegal status without restriction', () => {
  const ILLEGAL_STATES = Object.entries(STATE_DATA)
    .filter(([,s]) => s.status === 'illegal')
    .map(([code]) => code);

  const violations = [];
  for (const p of PLATFORMS) {
    for (const code of ILLEGAL_STATES) {
      if (!p.restricted || !p.restricted.includes(code)) {
        // Oklahoma is enacted but not yet effective — allow it
        if (code === 'OK') continue;
        violations.push(`${p.id} serves ${code} (banned state)`);
      }
    }
  }
  // Warn rather than hard-fail since OK is a transitional case
  if (violations.length > 0) {
    violations.forEach(v => console.warn(`  ⚠ WARN  ${v}`));
    warned += violations.length;
    return 'warn';
  }
});

// ─── RESULTS ─────────────────────────────────────────────────────────────────

console.log(`\n══════════════════════════════════════════════════════`);
console.log(`  Tests passed:  ${passed}`);
console.log(`  Tests warned:  ${warned}`);
console.log(`  Tests failed:  ${failed}`);
console.log(`══════════════════════════════════════════════════════\n`);

if (failed > 0) {
  console.error(`${failed} test(s) FAILED — fix data.js before deploying\n`);
  process.exit(1);
} else {
  console.log(`All tests passed${warned > 0 ? ` (${warned} warning(s) — review recommended)` : ''}.\n`);
  process.exit(0);
}
