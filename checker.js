#!/usr/bin/env node
/**
 * SweepsCheck — Biweekly Automated Data Integrity & Staleness Checker
 *
 * Runs every 14 days via GitHub Actions (see .github/workflows/biweekly-check.yml).
 *
 * What this does:
 *  1. Loads current data.js
 *  2. Fetches key authoritative source pages (state law trackers, operator ToS)
 *  3. Compares content hashes against last-known values
 *  4. Flags records that are stale (> 30 days since lastVerified)
 *  5. Detects new state ban indicators in content
 *  6. Generates a change report (CHANGE-REPORT-{date}.json + markdown summary)
 *  7. Updates lastChecked timestamps
 *  8. NEVER auto-writes legal status changes without human review flag
 *
 * Requires: node >= 18 (built-in fetch), dotenv (optional)
 * Install:  npm install  (see package.json)
 *
 * Run manually: node checker.js
 * Run dry-run:  node checker.js --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE     = path.join(__dirname, 'data.js');
const HASHES_FILE   = path.join(__dirname, '.content-hashes.json');
const REPORT_DIR    = path.join(__dirname, 'reports');
const DRY_RUN       = process.argv.includes('--dry-run');
const VERBOSE       = process.argv.includes('--verbose');

// ─── STALENESS THRESHOLDS (days) ─────────────────────────────────────────────
const THRESHOLDS = {
  VERIFIED:     30,   // Under 30 days → current
  AGING:        45,   // 30–45 days → aging
  STALE:        60,   // 45–60 days → stale
  CRITICAL:     90,   // Over 60 days → critically stale
};

// ─── SOURCES TO MONITOR ───────────────────────────────────────────────────────
// These URLs are fetched each run and their content hashed.
// Changes trigger a review flag, NOT an automatic data update.
const MONITORED_SOURCES = [
  // State law trackers (authoritative secondary sources for signal)
  { id: "sweepsy-tracker",   url: "https://www.sweepsy.com/us/",                  label: "sweepsy.com legislative tracker" },
  { id: "lines-states",      url: "https://www.lines.com/sweepstakes-casinos/states", label: "lines.com state-by-state guide" },
  { id: "sweepcasinos-legal",url: "https://sweepcasinos.com/legal/",               label: "sweepcasinos.com 50-state guide" },
  { id: "infolaw-2026",      url: "https://www.infolawgroup.com/insights/2026/7/27/sweepstakes-casino-laws-in-2026-new-bans-proposed-legislation-and-regulatory-trends", label: "InfoLawGroup 2026 analysis" },
  // Operator rules pages (check for version changes)
  { id: "chumba-rules",      url: "https://www.chumbacasino.com/sweepstakes-rules", label: "Chumba sweeps rules page" },
  { id: "mcluck-home",       url: "https://www.mcluck.com/",                        label: "McLuck homepage (version signals)" },
  { id: "pulsz-rules",       url: "https://www.pulsz.com/sweepstakes-rules",        label: "Pulsz sweeps rules page" },
  { id: "stake-terms",       url: "https://stake.us/policies/terms",                label: "Stake.us ToS (Section 8.3 AMOE)" },
  { id: "megabonanza-rules", url: "https://www.megabonanza.com/sweepstakes-rules",  label: "MegaBonanza sweeps rules" },
  { id: "rolla-rules",       url: "https://www.rolla.com/sweepstakes-rules",        label: "Rolla sweeps rules" },
  { id: "wowvegas-rules",    url: "https://www.wowvegas.com/sweepstakes-rules",     label: "WOW Vegas sweeps rules" },
];

// ─── BAN SIGNAL KEYWORDS ──────────────────────────────────────────────────────
// If any of these appear in monitored source content, flag for human review.
const BAN_SIGNAL_PATTERNS = [
  /\bnew\s+(?:state|bill|law|ban|statute)\b/gi,
  /\bsigned\s+(?:into\s+)?law\b/gi,
  /\beffective\s+(?:immediately|[a-z]+ \d{1,2},? \d{4})\b/gi,
  /\b(?:prohibits?|outlaws?|bans?)\s+sweepstakes\b/gi,
  /\bceases?-?\s*and\s*-?desist\b/gi,
  /\bveto\s+override\b/gi,
  /\bracketeering\b/gi,
  /\bfelony\b/gi,
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function log(...args) {
  if (VERBOSE) console.log('[checker]', ...args);
}

function warn(...args) {
  console.warn('[checker WARNING]', ...args);
}

function err(...args) {
  console.error('[checker ERROR]', ...args);
}

function hashContent(str) {
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 16);
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function stalenessLevel(lastVerified) {
  const days = daysSince(lastVerified);
  if (days < THRESHOLDS.VERIFIED) return { level: 'current',  label: 'Current',          days };
  if (days < THRESHOLDS.AGING)    return { level: 'aging',    label: 'Aging (30–45 days)', days };
  if (days < THRESHOLDS.STALE)    return { level: 'stale',    label: 'Stale (45–60 days)', days };
  return                                  { level: 'critical', label: 'Critically stale (60+ days)', days };
}

async function fetchWithTimeout(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SweepsCheck-Bot/3.0 (legal-data-monitor; +https://github.com/sweepscheck)' }
    });
    const text = await res.text();
    clearTimeout(timer);
    return { ok: true, status: res.status, text, url };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, error: e.message, url };
  }
}

function loadHashes() {
  try {
    return JSON.parse(fs.readFileSync(HASHES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveHashes(hashes) {
  if (!DRY_RUN) {
    fs.writeFileSync(HASHES_FILE, JSON.stringify(hashes, null, 2));
  }
}

function extractSignals(text, sourceId) {
  const signals = [];
  for (const pattern of BAN_SIGNAL_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      signals.push({ pattern: pattern.toString(), matches: [...new Set(matches)].slice(0, 5) });
    }
  }
  return signals;
}

// ─── MAIN RUNNER ─────────────────────────────────────────────────────────────

async function run() {
  const runDate = new Date().toISOString().split('T')[0];
  const runTs   = new Date().toISOString();

  console.log(`\n╔═══════════════════════════════════════════════════╗`);
  console.log(`║  SweepsCheck biweekly checker — ${runDate}       ║`);
  console.log(`║  ${DRY_RUN ? 'DRY RUN — no files will be written' : 'LIVE RUN'  }                     ║`);
  console.log(`╚═══════════════════════════════════════════════════╝\n`);

  // Load current data
  let data;
  try {
    // Strip module.exports wrapper for direct eval in Node
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
      .replace(/^\/\*[\s\S]*?\*\//m, '')  // strip leading block comment
      .replace(/if\s*\(typeof module[\s\S]+$/m, ''); // strip module.exports
    data = eval(`(function() { ${raw}; return { SITE_META, STATES_LIST, STATE_DATA, DEFAULT_STATE, PLATFORMS, CHANGE_HISTORY }; })()`);
  } catch (e) {
    err('Failed to load data.js:', e.message);
    process.exit(1);
  }

  const { SITE_META, STATE_DATA, PLATFORMS } = data;

  const report = {
    runDate,
    runTimestamp: runTs,
    dataVersion: SITE_META.dataVersion,
    dryRun: DRY_RUN,
    stalenessAlerts: [],
    contentChanges: [],
    banSignals: [],
    missingData: [],
    urlErrors: [],
    summary: {},
    changeLogEntries: [],
  };

  // ── 1. STALENESS CHECK ──────────────────────────────────────────────────────

  console.log('▶ Checking staleness of state records…');
  for (const [code, state] of Object.entries(STATE_DATA)) {
    const s = stalenessLevel(state.lastVerified);
    if (s.level !== 'current') {
      report.stalenessAlerts.push({
        type: 'state',
        id: code,
        label: state.label,
        lastVerified: state.lastVerified,
        stalenessLevel: s.level,
        stalenessLabel: s.label,
        daysSince: s.days,
        reviewRequired: s.level === 'critical' || state.status === 'illegal',
      });
    }
    if (!state.sources || state.sources.length === 0) {
      report.missingData.push({ type: 'state', id: code, field: 'sources', message: 'No sources array' });
    }
  }

  console.log('▶ Checking staleness of platform records…');
  for (const p of PLATFORMS) {
    const s = stalenessLevel(p.lastVerified);
    if (s.level !== 'current') {
      report.stalenessAlerts.push({
        type: 'platform',
        id: p.id,
        label: p.name,
        lastVerified: p.lastVerified,
        stalenessLevel: s.level,
        stalenessLabel: s.label,
        daysSince: s.days,
        reviewRequired: s.level === 'critical',
      });
    }
    if (!p.sources || p.sources.length === 0) {
      report.missingData.push({ type: 'platform', id: p.id, field: 'sources', message: 'No sources array' });
    }
  }

  // ── 2. SOURCE CONTENT MONITORING ───────────────────────────────────────────

  console.log(`▶ Fetching ${MONITORED_SOURCES.length} monitored sources…`);
  const prevHashes = loadHashes();
  const newHashes  = { ...prevHashes };

  for (const source of MONITORED_SOURCES) {
    process.stdout.write(`  ${source.id}… `);
    const result = await fetchWithTimeout(source.url);

    if (!result.ok) {
      console.log(`FETCH FAILED (${result.error})`);
      report.urlErrors.push({ sourceId: source.id, url: source.url, error: result.error });
      continue;
    }
    if (result.status >= 400) {
      console.log(`HTTP ${result.status}`);
      report.urlErrors.push({ sourceId: source.id, url: source.url, error: `HTTP ${result.status}` });
      continue;
    }

    const newHash = hashContent(result.text);
    const oldHash = prevHashes[source.id];
    newHashes[source.id] = newHash;

    if (oldHash && oldHash !== newHash) {
      console.log(`CHANGED ⚠`);
      const signals = extractSignals(result.text, source.id);
      report.contentChanges.push({
        sourceId: source.id,
        label: source.label,
        url: source.url,
        previousHash: oldHash,
        currentHash: newHash,
        banSignalCount: signals.length,
        signals,
        reviewRequired: signals.length > 0,
        message: signals.length > 0
          ? `Content changed AND contains ban/enforcement signal words — HUMAN REVIEW REQUIRED`
          : `Content changed — review for legal status updates`,
      });
    } else if (!oldHash) {
      console.log(`NEW (baseline saved)`);
    } else {
      console.log(`unchanged`);
    }

    // Always check ban signals on current content regardless of hash change
    const signals = extractSignals(result.text, source.id);
    if (signals.length > 2) { // Threshold to avoid noise
      report.banSignals.push({
        sourceId: source.id,
        url: source.url,
        signalCount: signals.length,
        note: 'Elevated ban/enforcement signal density detected — verify manually',
      });
    }
  }

  saveHashes(newHashes);

  // ── 3. INTEGRITY CHECKS ─────────────────────────────────────────────────────

  console.log('▶ Running data integrity checks…');
  const { findings: integrityFindings } = runIntegrityChecks(data);
  report.integrityFindings = integrityFindings;

  // ── 4. GENERATE REPORT ──────────────────────────────────────────────────────

  const reviewRequired = [
    ...report.stalenessAlerts.filter(a => a.reviewRequired),
    ...report.contentChanges.filter(c => c.reviewRequired),
    ...report.integrityFindings.filter(f => f.severity === 'error'),
  ];

  report.summary = {
    totalStates:        Object.keys(STATE_DATA).length,
    totalPlatforms:     PLATFORMS.length,
    stalenessAlerts:    report.stalenessAlerts.length,
    contentChanges:     report.contentChanges.length,
    urlErrors:          report.urlErrors.length,
    banSignals:         report.banSignals.length,
    integrityErrors:    report.integrityFindings.filter(f => f.severity === 'error').length,
    integrityWarnings:  report.integrityFindings.filter(f => f.severity === 'warn').length,
    reviewRequiredCount: reviewRequired.length,
    overallStatus:      reviewRequired.length > 0 ? 'REVIEW_REQUIRED' : 'OK',
  };

  // ── 5. WRITE OUTPUTS ────────────────────────────────────────────────────────

  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

  const reportFile = path.join(REPORT_DIR, `check-${runDate}.json`);
  const summaryFile = path.join(REPORT_DIR, `check-${runDate}-summary.md`);

  if (!DRY_RUN) {
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    fs.writeFileSync(summaryFile, generateMarkdownSummary(report, reviewRequired));
    // Update the "last checked" in data.js (only the timestamp field, not legal data)
    updateLastChecked(runTs);
  }

  // ── 6. CONSOLE SUMMARY ──────────────────────────────────────────────────────

  console.log('\n══ SUMMARY ══════════════════════════════════════════');
  console.log(`  States tracked:      ${report.summary.totalStates}`);
  console.log(`  Platforms tracked:   ${report.summary.totalPlatforms}`);
  console.log(`  Staleness alerts:    ${report.summary.stalenessAlerts}`);
  console.log(`  Content changes:     ${report.summary.contentChanges}`);
  console.log(`  URL errors:          ${report.summary.urlErrors}`);
  console.log(`  Integrity errors:    ${report.summary.integrityErrors}`);
  console.log(`  Integrity warnings:  ${report.summary.integrityWarnings}`);
  console.log(`  ────────────────────────────────────────────────`);
  console.log(`  REVIEW REQUIRED:     ${report.summary.reviewRequiredCount}`);
  console.log(`  OVERALL STATUS:      ${report.summary.overallStatus}`);
  console.log('═════════════════════════════════════════════════════\n');

  if (report.summary.reviewRequiredCount > 0) {
    console.log('⚠  ITEMS REQUIRING HUMAN REVIEW:');
    for (const item of reviewRequired) {
      console.log(`   • ${item.type || item.sourceId || item.id}: ${item.message || item.stalenessLabel || item.label}`);
    }
    console.log();
  }

  if (!DRY_RUN) {
    console.log(`  Report saved: ${reportFile}`);
    console.log(`  Summary saved: ${summaryFile}`);
  }

  // Exit with error code if review required (causes GitHub Actions to flag the run)
  process.exit(report.summary.overallStatus === 'REVIEW_REQUIRED' ? 1 : 0);
}

// ─── INTEGRITY CHECKS ────────────────────────────────────────────────────────

function runIntegrityChecks(data) {
  const { STATES_LIST, STATE_DATA, DEFAULT_STATE, PLATFORMS } = data;
  const findings = [];
  const allStateCodes = new Set(STATES_LIST.map(([code]) => code));

  // All 50 states in STATES_LIST
  if (STATES_LIST.length < 50) {
    findings.push({ severity: 'error', message: `STATES_LIST has ${STATES_LIST.length} entries — expected 50` });
  }

  // No duplicate state codes
  const seenStates = new Set();
  for (const [code] of STATES_LIST) {
    if (seenStates.has(code)) {
      findings.push({ severity: 'error', message: `Duplicate state code in STATES_LIST: ${code}` });
    }
    seenStates.add(code);
  }

  // All STATE_DATA keys are valid state codes
  for (const code of Object.keys(STATE_DATA)) {
    if (!allStateCodes.has(code)) {
      findings.push({ severity: 'error', message: `STATE_DATA contains unknown state code: ${code}` });
    }
    const s = STATE_DATA[code];
    if (!['illegal','gray','legal'].includes(s.status)) {
      findings.push({ severity: 'error', message: `State ${code} has invalid status: ${s.status}` });
    }
    if (!s.lastVerified) {
      findings.push({ severity: 'warn', message: `State ${code} missing lastVerified` });
    }
    if (typeof s.confidence !== 'number' || s.confidence < 0 || s.confidence > 10) {
      findings.push({ severity: 'warn', message: `State ${code} has invalid confidence: ${s.confidence}` });
    }
  }

  // Platform checks
  const seenPlatformIds = new Set();
  for (const p of PLATFORMS) {
    if (seenPlatformIds.has(p.id)) {
      findings.push({ severity: 'error', message: `Duplicate platform ID: ${p.id}` });
    }
    seenPlatformIds.add(p.id);

    if (!p.name || !p.site || !p.op) {
      findings.push({ severity: 'error', message: `Platform ${p.id} missing required fields (name/site/op)` });
    }
    if (!p.rulesUrl || !p.rulesUrl.startsWith('http')) {
      findings.push({ severity: 'warn', message: `Platform ${p.id} has missing or invalid rulesUrl` });
    }
    if (!p.tosUrl || !p.tosUrl.startsWith('http')) {
      findings.push({ severity: 'warn', message: `Platform ${p.id} has missing or invalid tosUrl` });
    }
    if (!p.lastVerified) {
      findings.push({ severity: 'warn', message: `Platform ${p.id} missing lastVerified` });
    }
    if (typeof p.conf !== 'number' || p.conf < 0 || p.conf > 10) {
      findings.push({ severity: 'warn', message: `Platform ${p.id} has invalid confidence: ${p.conf}` });
    }
    // Restricted states are all valid
    if (p.restricted) {
      for (const code of p.restricted) {
        if (!allStateCodes.has(code)) {
          findings.push({ severity: 'error', message: `Platform ${p.id} references unknown state in restricted: ${code}` });
        }
      }
    }
    // AMOE consistency
    if (p.mailIn === false && p.onlineEntry === false && p.mailSC !== 'Discontinued') {
      // Platform offers no free entry method — flag for awareness
      findings.push({ severity: 'warn', message: `Platform ${p.id} has mailIn=false, onlineEntry=false but mailSC is not 'Discontinued' — verify` });
    }
  }

  return { findings, errorCount: findings.filter(f => f.severity === 'error').length };
}

// ─── MARKDOWN SUMMARY GENERATOR ──────────────────────────────────────────────

function generateMarkdownSummary(report, reviewItems) {
  const date = report.runDate;
  const lines = [
    `# SweepsCheck — Biweekly Check Report`,
    `**Run date:** ${date}  |  **Status:** ${report.summary.overallStatus}  |  **Data version:** ${report.dataVersion || '—'}`,
    ``,
    `## Summary`,
    `| Metric | Count |`,
    `|---|---|`,
    `| States tracked | ${report.summary.totalStates} |`,
    `| Platforms tracked | ${report.summary.totalPlatforms} |`,
    `| Staleness alerts | ${report.summary.stalenessAlerts} |`,
    `| Content changes detected | ${report.summary.contentChanges} |`,
    `| URL fetch errors | ${report.summary.urlErrors} |`,
    `| Integrity errors | ${report.summary.integrityErrors} |`,
    `| Integrity warnings | ${report.summary.integrityWarnings} |`,
    `| **Items requiring review** | **${report.summary.reviewRequiredCount}** |`,
    ``,
  ];

  if (reviewItems.length > 0) {
    lines.push(`## ⚠ Items Requiring Human Review`, ``);
    for (const item of reviewItems) {
      lines.push(`- **${item.type || item.sourceId || item.id}**: ${item.message || item.stalenessLabel || ''}`);
    }
    lines.push(``);
  }

  if (report.contentChanges.length > 0) {
    lines.push(`## Content Changes Detected`, ``);
    for (const change of report.contentChanges) {
      lines.push(`### ${change.label}`);
      lines.push(`- URL: ${change.url}`);
      lines.push(`- Hash: \`${change.previousHash}\` → \`${change.currentHash}\``);
      lines.push(`- Ban signals: ${change.banSignalCount}`);
      lines.push(`- ${change.message}`);
      lines.push(``);
    }
  }

  if (report.urlErrors.length > 0) {
    lines.push(`## URL Fetch Errors`, ``);
    for (const e of report.urlErrors) {
      lines.push(`- **${e.sourceId}**: ${e.url} — ${e.error}`);
    }
    lines.push(``);
  }

  if (report.integrityFindings && report.integrityFindings.length > 0) {
    lines.push(`## Integrity Check Findings`, ``);
    for (const f of report.integrityFindings) {
      lines.push(`- [${f.severity.toUpperCase()}] ${f.message}`);
    }
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`*Generated by SweepsCheck checker.js at ${report.runTimestamp}*`);
  lines.push(`*This report is informational only. Do not update legal status data without manual verification.*`);

  return lines.join('\n');
}

// ─── UPDATE LAST CHECKED IN DATA FILE ────────────────────────────────────────

function updateLastChecked(ts) {
  // Only updates the SITE_META.lastChecked field — does NOT touch legal data
  let content = fs.readFileSync(DATA_FILE, 'utf8');
  const dateOnly = ts.split('T')[0];
  // Replace or insert lastChecked in SITE_META
  if (content.includes('lastChecked:')) {
    content = content.replace(/lastChecked:\s*"[^"]*"/, `lastChecked: "${dateOnly}"`);
  } else {
    content = content.replace(/auditDate:\s*"[^"]*"/, `auditDate: "${dateOnly}",\n  lastChecked: "${dateOnly}"`);
  }
  // Also update nextScheduled (14 days from now)
  const next = new Date(ts);
  next.setDate(next.getDate() + 14);
  const nextDate = next.toISOString().split('T')[0];
  content = content.replace(/nextScheduled:\s*"[^"]*"/, `nextScheduled: "${nextDate}"`);
  fs.writeFileSync(DATA_FILE, content);
}

// ─── ENTRYPOINT ──────────────────────────────────────────────────────────────

run().catch(e => {
  err('Unhandled error:', e);
  process.exit(2);
});
