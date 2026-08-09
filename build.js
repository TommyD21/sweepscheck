#!/usr/bin/env node
/**
 * SweepsCheck — Build Script
 *
 * Regenerates index.html by inlining data.js into index.template.html.
 * This is the missing link between the automated checker (which updates
 * data.js timestamps, and which humans update with verified legal changes)
 * and the deployed site (which has data inlined for zero-dependency hosting).
 *
 * Run: node build.js
 * Runs automatically on Netlify via netlify.toml's build command.
 *
 * IMPORTANT: This script does NOT modify legal data. It only reads data.js
 * and injects it into the HTML template. All legal-data edits happen in
 * data.js itself (by a human, or via the checker's flagged-for-review process).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_FILE     = path.join(__dirname, 'data.js');
const TEMPLATE_FILE = path.join(__dirname, 'index.template.html');
const OUTPUT_FILE   = path.join(__dirname, 'index.html');

function build() {
  console.log('[build] Reading data.js…');
  if (!fs.existsSync(DATA_FILE)) {
    console.error('[build] FATAL: data.js not found');
    process.exit(1);
  }
  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error('[build] FATAL: index.template.html not found');
    process.exit(1);
  }

  // Strip the module.exports block — the browser doesn't need it,
  // and leaving it in would throw a ReferenceError for `module`.
  let dataJs = fs.readFileSync(DATA_FILE, 'utf8')
    .replace(/if\s*\(typeof module[\s\S]+$/m, '')
    .trim();

  // Sanity check: the data actually parses as valid JS before we inline it.
  try {
    new Function(dataJs);
  } catch (e) {
    console.error('[build] FATAL: data.js has a syntax error —', e.message);
    console.error('[build] Refusing to build with broken data. Fix data.js and re-run.');
    process.exit(1);
  }

  console.log('[build] Reading template…');
  const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

  if (!template.includes('{{DATA_JS}}')) {
    console.error('[build] FATAL: template is missing the {{DATA_JS}} placeholder');
    process.exit(1);
  }

  console.log('[build] Inlining data into template…');
  const output = template.replace('{{DATA_JS}}', dataJs);

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`[build] Wrote ${OUTPUT_FILE} (${(output.length / 1024).toFixed(1)} KB)`);

  // Basic post-build sanity checks
  const checks = [
    ['DOCTYPE present',       output.startsWith('<!DOCTYPE html>')],
    ['Data inlined',          output.includes('const STATE_DATA')],
    ['No leftover placeholder', !output.includes('{{DATA_JS}}')],
    ['Closing html tag',      output.trim().endsWith('</html>')],
  ];
  const failed = checks.filter(([, ok]) => !ok);
  if (failed.length > 0) {
    console.error('[build] FATAL: post-build checks failed:', failed.map(([label]) => label).join(', '));
    process.exit(1);
  }

  console.log('[build] ✓ Build succeeded — index.html is ready to deploy.');
}

build();
