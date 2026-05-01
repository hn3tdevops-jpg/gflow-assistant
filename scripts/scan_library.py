#!/usr/bin/env python3
"""
scan_library.py — GFlow Sound Catalogue Library Scanner

Scans a local folder of audio files and generates a catalogue JSON
that can be merged into or replace data/catalogue.json.

Usage:
    python scripts/scan_library.py /path/to/audio/folder
    python scripts/scan_library.py /path/to/audio/folder --output data/scanned_catalogue.json
    python scripts/scan_library.py /path/to/audio/folder --merge data/catalogue.json

Detected fields:
    - id              : derived from relative file path
    - title           : cleaned filename (no extension)
    - type            : inferred from folder name
    - category        : top-level folder name
    - subcategory     : second-level folder name
    - file_path       : relative path from library root
    - format          : file extension (WAV, MP3, etc.)
    - date_added      : file modification date
    - bpm             : parsed from filename if pattern like _90bpm or _090BPM
    - key             : parsed from filename if pattern like _Am or _Fm
    - duration_seconds: read via mutagen if installed, else null
    - sample_rate     : read via mutagen if installed, else null
    - bit_depth       : read via mutagen if installed, else null
    - placeholder metadata for all other fields
"""

import os
import sys
import json
import re
import hashlib
import argparse
from datetime import datetime
from pathlib import Path

# Optional: mutagen for audio metadata
try:
    from mutagen import File as MutagenFile
    MUTAGEN_AVAILABLE = True
except ImportError:
    MUTAGEN_AVAILABLE = False


# ── Configuration ─────────────────────────────────────────────
AUDIO_EXTENSIONS = {
    '.wav', '.aiff', '.aif', '.flac', '.mp3',
    '.ogg', '.m4a', '.aac', '.opus', '.wma',
}

# Folder name → item type mapping
FOLDER_TYPE_MAP = {
    'drums':       'sample',
    'kicks':       'sample',
    'snares':      'sample',
    'hihats':      'sample',
    'hi-hats':     'sample',
    'claps':       'sample',
    'percs':       'sample',
    'percussion':  'sample',
    'fx':          'sample',
    'loops':       'loop',
    'drum loops':  'loop',
    'bass loops':  'loop',
    'melodic':     'loop',
    'vocals':      'loop',
    'instruments': 'instrument',
    'keys':        'instrument',
    'strings':     'instrument',
    'presets':     'preset',
    'patches':     'preset',
    'kits':        'kit',
    'drum kits':   'kit',
    'collections': 'collection',
    'bundles':     'collection',
    'references':  'reference',
    'refs':        'reference',
}

# Musical keys pattern
KEY_PATTERN = re.compile(r'[_\-\s]([A-G][b#]?m?)[_\-\s\.]', re.IGNORECASE)

# BPM pattern
BPM_PATTERN = re.compile(r'[_\-\s](\d{2,3})\s*bpm', re.IGNORECASE)

# ── Helpers ───────────────────────────────────────────────────

def make_id(relative_path: str) -> str:
    """Generate a stable short ID from the relative file path."""
    h = hashlib.md5(relative_path.encode()).hexdigest()[:8]
    stem = Path(relative_path).stem[:20].lower()
    stem = re.sub(r'[^a-z0-9]', '-', stem).strip('-')
    return f"{stem}-{h}"


def clean_title(filename: str) -> str:
    """Convert filename to a human-readable title."""
    stem = Path(filename).stem
    # replace common separators with spaces
    title = re.sub(r'[_\-]+', ' ', stem)
    # remove BPM suffix
    title = re.sub(r'\s*\d{2,3}\s*bpm\s*', ' ', title, flags=re.IGNORECASE)
    # remove key suffix
    title = re.sub(r'\s+[A-G][b#]?m?\s*$', '', title, flags=re.IGNORECASE)
    return title.strip().title()


def infer_type(parts: list) -> str:
    """Infer item type from folder hierarchy."""
    for part in reversed(parts):
        t = FOLDER_TYPE_MAP.get(part.lower())
        if t:
            return t
    return 'sample'


def parse_bpm(filename: str):
    """Extract BPM from filename if present."""
    m = BPM_PATTERN.search(filename)
    if m:
        val = int(m.group(1))
        if 50 <= val <= 300:
            return val
    return None


def parse_key(filename: str):
    """Extract musical key from filename if present."""
    padded = f'_{filename}_'  # pad so pattern anchors work on edges
    m = KEY_PATTERN.search(padded)
    if m:
        return m.group(1)
    return None


def get_audio_metadata(filepath: str) -> dict:
    """Use mutagen to extract audio technical metadata."""
    if not MUTAGEN_AVAILABLE:
        return {}
    try:
        audio = MutagenFile(filepath)
        if audio is None:
            return {}
        info = getattr(audio, 'info', None)
        if not info:
            return {}
        result = {}
        if hasattr(info, 'length'):
            result['duration_seconds'] = round(info.length, 2)
        if hasattr(info, 'sample_rate'):
            result['sample_rate'] = info.sample_rate
        if hasattr(info, 'bits_per_sample'):
            result['bit_depth'] = info.bits_per_sample
        return result
    except Exception:
        return {}


def scan_folder(root: str, library_root: str = None) -> list:
    """
    Recursively scan root for audio files and return a list of sound entries.

    :param root:         Absolute path to scan.
    :param library_root: Base path used to compute relative paths (defaults to root).
    """
    if library_root is None:
        library_root = root

    entries = []
    root_path    = Path(root).resolve()
    lib_path     = Path(library_root).resolve()

    for dirpath, dirnames, filenames in os.walk(root_path):
        # Skip hidden directories
        dirnames[:] = [d for d in dirnames if not d.startswith('.')]

        for filename in sorted(filenames):
            suffix = Path(filename).suffix.lower()
            if suffix not in AUDIO_EXTENSIONS:
                continue

            abs_path = Path(dirpath) / filename
            try:
                rel_path = str(abs_path.relative_to(lib_path))
            except ValueError:
                rel_path = str(abs_path)

            # Folder parts relative to library root (for category/type inference)
            parts = list(Path(rel_path).parent.parts)

            category    = parts[0] if len(parts) > 0 else 'uncategorised'
            subcategory = parts[1] if len(parts) > 1 else ''

            item_type = infer_type(parts)
            bpm       = parse_bpm(filename)
            key       = parse_key(filename)

            # File date
            try:
                mtime      = abs_path.stat().st_mtime
                date_added = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
            except OSError:
                date_added = datetime.now().strftime('%Y-%m-%d')

            # Audio metadata (mutagen)
            audio_meta = get_audio_metadata(str(abs_path))

            entry = {
                'id':               make_id(rel_path),
                'title':            clean_title(filename),
                'type':             item_type,
                'category':         category,
                'subcategory':      subcategory,
                'description':      '',
                'tags':             [category] + ([subcategory] if subcategory else []),
                'bpm':              bpm,
                'key':              key,
                'duration_seconds': audio_meta.get('duration_seconds'),
                'file_path':        rel_path,
                'preview_path':     None,
                'waveform_path':    None,
                'license':          'Unknown',
                'source':           'Scanned',
                'format':           suffix.lstrip('.').upper(),
                'sample_rate':      audio_meta.get('sample_rate'),
                'bit_depth':        audio_meta.get('bit_depth'),
                'favorite':         False,
                'production_notes': '',
                'date_added':       date_added,
            }
            entries.append(entry)
            print(f'  + {rel_path}  [{item_type}]')

    return entries


def merge_with_existing(existing_path: str, new_entries: list) -> list:
    """
    Merge new_entries into an existing catalogue.
    Entries with matching file_path are updated; new entries are appended.
    """
    with open(existing_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    existing = data.get('sounds', data) if isinstance(data, dict) else data
    existing_by_path = {e['file_path']: e for e in existing if 'file_path' in e}

    for entry in new_entries:
        fp = entry['file_path']
        if fp in existing_by_path:
            # Update only technical fields; preserve hand-edited metadata
            old = existing_by_path[fp]
            for field in ('duration_seconds', 'sample_rate', 'bit_depth', 'format'):
                if entry[field] is not None:
                    old[field] = entry[field]
        else:
            existing.append(entry)
            existing_by_path[fp] = entry

    return existing


# ── Main ──────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Scan a local audio library folder and generate GFlow catalogue JSON.'
    )
    parser.add_argument('folder', help='Path to the audio library folder to scan')
    parser.add_argument(
        '--output', '-o',
        default=None,
        help='Output JSON file path (default: data/scanned_YYYYMMDD.json)',
    )
    parser.add_argument(
        '--merge', '-m',
        default=None,
        metavar='EXISTING_JSON',
        help='Merge results into an existing catalogue JSON file',
    )
    parser.add_argument(
        '--library-root', '-r',
        default=None,
        help='Library root for computing relative paths (defaults to the scanned folder)',
    )
    args = parser.parse_args()

    folder = os.path.abspath(args.folder)
    if not os.path.isdir(folder):
        print(f'Error: "{folder}" is not a directory.', file=sys.stderr)
        sys.exit(1)

    print(f'\n🎵 GFlow Library Scanner')
    print(f'   Scanning: {folder}')
    if not MUTAGEN_AVAILABLE:
        print('   ⚠ mutagen not installed — duration/sample_rate/bit_depth will be null')
        print('     Install with: pip install mutagen\n')

    entries = scan_folder(folder, library_root=args.library_root)
    print(f'\n   Found {len(entries)} audio file(s).')

    if args.merge:
        merge_path = os.path.abspath(args.merge)
        if os.path.exists(merge_path):
            print(f'   Merging with {merge_path} …')
            sounds = merge_with_existing(merge_path, entries)
        else:
            print(f'   Merge target not found; creating new catalogue …')
            sounds = entries
    else:
        sounds = entries

    output_path = args.output
    if not output_path:
        date_str    = datetime.now().strftime('%Y%m%d')
        output_path = os.path.join('data', f'scanned_{date_str}.json')

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    catalogue = {
        'version':    '1.0.0',
        'updated_at': datetime.now().strftime('%Y-%m-%d'),
        'sounds':     sounds,
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(catalogue, f, indent=2, ensure_ascii=False)

    print(f'\n✅  Catalogue written to: {output_path}')
    print(f'   Total sounds: {len(sounds)}\n')


if __name__ == '__main__':
    main()
