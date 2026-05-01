#!/usr/bin/env node
/**
 * scan-library.mjs — Audio Library Scanner
 *
 * Usage:
 *   node scripts/scan-library.mjs <directory>
 *
 * Description:
 *   Recursively scans the given directory for audio files
 *   (.wav, .aif, .aiff, .flac, .mp3, .ogg, .m4a).
 *   Generates catalogue.json entries from file metadata derived from
 *   filenames and folder structure. Outputs a JSON array to stdout.
 *
 * Example:
 *   node scripts/scan-library.mjs ./library > data/catalogue.json
 *   cp data/catalogue.json public/data/catalogue.json
 *
 * Naming conventions for best results:
 *   Files: <title>_<key>_<bpm>bpm.<ext>  (e.g. deep_house_kick_C_120bpm.wav)
 *   Folder structure: library/<category>/<subcategory>/<file>
 */

import { readdirSync, statSync } from 'fs';
import { join, extname, basename, dirname, relative } from 'path';
import { randomUUID } from 'crypto';

const AUDIO_EXTENSIONS = new Set([
  '.wav', '.aif', '.aiff', '.flac', '.mp3', '.ogg', '.m4a',
]);

const FORMAT_MAP = {
  '.wav': 'wav',
  '.aif': 'aiff',
  '.aiff': 'aiff',
  '.flac': 'flac',
  '.mp3': 'mp3',
  '.ogg': 'ogg',
  '.m4a': 'm4a',
};

const KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
const KEY_RE = new RegExp(`\\b(${KEYS.map((k) => k.replace('#', '\\#')).join('|')})(m(?:aj)?|min(?:or)?)?\\b`, 'i');
const BPM_RE = /\b(\d{2,3})\s*bpm\b/i;

/** Recursively find all audio files under rootDir */
function findAudioFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findAudioFiles(fullPath));
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (AUDIO_EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/** Convert a snake/kebab/space-cased string to Title Case */
function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Derive category and subcategory from folder path relative to library root */
function parseFolderPath(filePath, rootDir) {
  const rel = relative(rootDir, dirname(filePath));
  const parts = rel.split(/[\\/]/).filter(Boolean);
  return {
    category: parts[0] ?? 'uncategorised',
    subcategory: parts[1] ?? null,
  };
}

/** Try to extract key signature from filename */
function parseKey(name) {
  const m = KEY_RE.exec(name);
  if (!m) return null;
  const note = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
  const qual = m[2] ? (m[2].toLowerCase().startsWith('m') && !m[2].toLowerCase().startsWith('maj') ? 'm' : '') : '';
  return note + qual;
}

/** Try to extract BPM from filename */
function parseBpm(name) {
  const m = BPM_RE.exec(name);
  return m ? parseInt(m[1], 10) : null;
}

/** Derive the item type from category name */
function inferType(category) {
  const c = category.toLowerCase();
  if (c.includes('loop')) return 'loop';
  if (c.includes('drum') || c.includes('kit') || c.includes('perc')) return 'kit';
  if (c.includes('preset') || c.includes('patch') || c.includes('synth')) return 'preset';
  if (c.includes('instrument') || c.includes('vst') || c.includes('plugin')) return 'instrument';
  if (c.includes('sample')) return 'sample';
  return 'sample';
}

function buildEntry(filePath, rootDir) {
  const ext = extname(filePath).toLowerCase();
  const name = basename(filePath, ext);
  const { category, subcategory } = parseFolderPath(filePath, rootDir);
  const relPath = relative(rootDir, filePath).replace(/\\/g, '/');

  return {
    id: randomUUID(),
    title: toTitleCase(name),
    type: inferType(category),
    category: toTitleCase(category),
    subcategory: subcategory ? toTitleCase(subcategory) : null,
    description: null,
    tags: [category.toLowerCase()].filter(Boolean),
    bpm: parseBpm(name),
    key: parseKey(name),
    duration_seconds: null,
    file_path: relPath,
    preview_path: null,
    waveform_path: null,
    license: null,
    source: null,
    format: FORMAT_MAP[ext] ?? ext.slice(1),
    sample_rate: null,
    bit_depth: null,
    favorite: false,
    production_notes: null,
  };
}

// --- Main ---

const args = process.argv.slice(2);
const rootDir = args[0];

if (!rootDir) {
  console.error('Usage: node scripts/scan-library.mjs <directory>');
  console.error('Example: node scripts/scan-library.mjs ./library > data/catalogue.json');
  process.exit(1);
}

let stat;
try {
  stat = statSync(rootDir);
} catch {
  console.error(`Error: directory not found: ${rootDir}`);
  process.exit(1);
}

if (!stat.isDirectory()) {
  console.error(`Error: not a directory: ${rootDir}`);
  process.exit(1);
}

const files = findAudioFiles(rootDir);

if (files.length === 0) {
  process.stderr.write(`Warning: no audio files found in ${rootDir}\n`);
}

const entries = files.map((f) => buildEntry(f, rootDir));
process.stdout.write(JSON.stringify(entries, null, 2) + '\n');
process.stderr.write(`Scanned ${files.length} file(s) → ${entries.length} catalogue entr${entries.length === 1 ? 'y' : 'ies'}\n`);
