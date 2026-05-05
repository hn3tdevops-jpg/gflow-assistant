#!/usr/bin/env node
/**
 * scan-library.js — Audio Library Scanner
 *
 * Usage:
 *   node scripts/scan-library.js <directory>
 *
 * Description:
 *   Recursively scans the given directory for audio files (.wav, .mp3, .aif, .aiff, .flac, .ogg, .m4a).
 *   Generates catalogue.json entries from file metadata derived from filenames and folder structure.
 *   Outputs a JSON array to stdout which can be redirected to data/catalogue.json.
 *
 * Example:
 *   node scripts/scan-library.js ./library > data/catalogue.json
 *   # Then copy to public:
 *   cp data/catalogue.json public/data/catalogue.json
 *
 * Naming conventions for best results:
 *   - Files: <title>_<key>_<bpm>bpm.<ext> (e.g. deep_house_kick_C_120bpm.wav)
 *   - Folder structure: library/<category>/<subcategory>/<file>
 */

import { readdirSync } from 'fs';
import { join, extname, basename, relative, sep } from 'path';
import { randomUUID } from 'crypto';

const AUDIO_EXTENSIONS = new Set(['.wav', '.mp3', '.aif', '.aiff', '.flac', '.ogg', '.m4a']);
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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
    } else if (entry.isFile() && AUDIO_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Extract BPM from filename (e.g. "120bpm" or "_120_") */
function extractBpm(filename) {
  const match = filename.match(/[_\s-](\d{2,3})bpm/i) ?? filename.match(/[_\s-](\d{2,3})[_\s-]/);
  if (!match) return null;
  const bpm = parseInt(match[1], 10);
  return bpm >= 40 && bpm <= 300 ? bpm : null;
}

/** Extract musical key from filename */
function extractKey(filename) {
  for (const key of KEYS) {
    const escaped = key.replace('#', '\\#');
    const regex = new RegExp(`[_\\s-](${escaped})[_\\s-m]`, 'i');
    if (regex.test(filename)) return key;
  }
  return null;
}

/** Infer item type from category/path */
function inferType(category, subcategory) {
  const lower = (category + ' ' + (subcategory ?? '')).toLowerCase();
  if (lower.includes('loop')) return 'loop';
  if (lower.includes('kit')) return 'kit';
  if (lower.includes('preset')) return 'preset';
  if (lower.includes('instrument')) return 'instrument';
  if (lower.includes('collection')) return 'collection';
  return 'sample';
}

/** Build a human-readable title from a filename */
function buildTitle(filename) {
  return filename
    .replace(/[_-]/g, ' ')
    .replace(/\b\d{2,3}bpm\b/gi, '')
    .replace(/\b(wav|mp3|aiff|flac|ogg)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const rootDir = process.argv[2];
if (!rootDir) {
  console.error('Usage: node scripts/scan-library.js <directory>');
  process.exit(1);
}

const audioFiles = findAudioFiles(rootDir);
const rootName = basename(rootDir);
const entries = audioFiles.map((filePath) => {
  const nativeRel = relative(rootDir, filePath);
  const rel = sep === '\\' ? nativeRel.replace(/\\/g, '/') : nativeRel;
  const nativeFilePath = join(rootName, nativeRel);
  const webFilePath = sep === '\\' ? nativeFilePath.replace(/\\/g, '/') : nativeFilePath;
  const parts = rel.split('/');
  const category = parts.length > 1 ? parts[0] : 'Uncategorized';
  const subcategory = parts.length > 2 ? parts[1] : null;
  const filename = basename(filePath, extname(filePath));
  const ext = extname(filePath).replace('.', '').toUpperCase();

  return {
    id: `scan-${randomUUID().split('-')[0]}`,
    title: buildTitle(filename),
    type: inferType(category, subcategory),
    category: category.charAt(0).toUpperCase() + category.slice(1),
    subcategory: subcategory ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1) : null,
    description: null,
    tags: [category.toLowerCase(), ext.toLowerCase()].filter(Boolean),
    bpm: extractBpm(filename),
    key: extractKey(filename),
    duration_seconds: null,
    file_path: webFilePath,
    preview_path: null,
    waveform_path: null,
    license: null,
    source: null,
    format: ext || null,
    sample_rate: null,
    bit_depth: null,
    favorite: false,
    production_notes: null,
  };
});

console.log(JSON.stringify(entries, null, 2));
