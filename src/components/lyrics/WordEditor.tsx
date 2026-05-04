import { useState } from 'react';
import type { LyricWord } from '../../types/lyrics';

interface WordEditorProps {
  word: LyricWord;
  onChange: (w: LyricWord) => void;
  onSaveToDict?: () => void;
}

export default function WordEditor({ word, onChange, onSaveToDict }: WordEditorProps) {
  const [expanded, setExpanded] = useState(false);

  function update(patch: Partial<LyricWord>) {
    onChange({ ...word, ...patch });
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 text-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div>
          <span className="font-semibold text-white">{word.original}</span>
          <span className="ml-2 text-emerald-400 text-xs">{word.pronunciationSpelling}</span>
        </div>
        <span className="text-gray-500 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-700 pt-3">
          {/* Pronunciation Spelling */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Pronunciation Spelling</label>
            <input
              type="text"
              value={word.pronunciationSpelling}
              onChange={(e) => update({ pronunciationSpelling: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Phonemes */}
          {word.phonemes.length > 0 && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Phonemes</label>
              <div className="flex flex-wrap gap-1">
                {word.phonemes.map((p, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 text-xs font-mono"
                  >
                    {p.token}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stress */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Stress</label>
            <select
              value={word.stress ?? ''}
              onChange={(e) =>
                update({
                  stress: (e.target.value as LyricWord['stress']) || undefined,
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="">— none —</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="unstressed">Unstressed</option>
            </select>
          </div>

          {/* Vowel Stretch */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Vowel Stretch: {(word.vowelStretch ?? 1).toFixed(1)}x
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={word.vowelStretch ?? 1}
              onChange={(e) => update({ vowelStretch: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Consonant Softness */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Consonant Softness: {(word.consonantSoftness ?? 1).toFixed(1)}
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={word.consonantSoftness ?? 1}
              onChange={(e) => update({ consonantSoftness: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Breath Before */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`breath-${word.id}`}
              checked={word.breathBefore ?? false}
              onChange={(e) => update({ breathBefore: e.target.checked })}
              className="accent-emerald-500"
            />
            <label htmlFor={`breath-${word.id}`} className="text-xs text-gray-400">
              Breath Before
            </label>
          </div>

          {/* Pause After */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Pause After (ms)
            </label>
            <input
              type="number"
              min={0}
              max={2000}
              step={50}
              value={word.pauseAfter ?? 0}
              onChange={(e) => update({ pauseAfter: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Performance Notes */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Performance Notes</label>
            <textarea
              value={word.performanceNotes ?? ''}
              onChange={(e) => update({ performanceNotes: e.target.value })}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Save to Dictionary */}
          {onSaveToDict && (
            <button
              onClick={onSaveToDict}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline"
            >
              Save to custom dictionary
            </button>
          )}
        </div>
      )}
    </div>
  );
}
