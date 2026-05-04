import { useState } from 'react';
import { useCustomDictionary } from '../hooks/useCustomDictionary';
import { BUILTIN_DICTIONARY, createPlaceholder } from '../utils/phonemeDictionary';
import type { PronunciationDictionaryEntry } from '../types/lyrics';

export default function DictionaryPage() {
  const { dictionary, saveEntry, deleteEntry } = useCustomDictionary();
  const [newWord, setNewWord] = useState('');
  const [newPronun, setNewPronun] = useState('');
  const [error, setError] = useState('');

  function handleAdd() {
    if (!newWord.trim()) { setError('Word is required.'); return; }
    if (!newPronun.trim()) { setError('Pronunciation spelling is required.'); return; }
    setError('');
    const base = createPlaceholder(newWord.trim().toLowerCase());
    const entry: PronunciationDictionaryEntry = {
      ...base,
      pronunciationSpelling: newPronun.trim().toUpperCase(),
      source: 'custom',
    };
    saveEntry(entry);
    setNewWord('');
    setNewPronun('');
  }

  const customEntries = Object.values(dictionary);
  const builtinEntries = Object.values(BUILTIN_DICTIONARY);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Pronunciation Dictionary</h1>
        <p className="text-gray-400 text-sm mb-8">
          Custom entries override the built-in dictionary when parsing lyrics.
        </p>

        {/* Add new entry */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">
            Add Custom Entry
          </h2>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Word"
              className="flex-1 min-w-[120px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-600"
            />
            <input
              type="text"
              value={newPronun}
              onChange={(e) => setNewPronun(e.target.value)}
              placeholder="Pronunciation (e.g. HEH-loh)"
              className="flex-1 min-w-[180px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-600"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {/* Custom entries */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">
            Custom Entries ({customEntries.length})
          </h2>
          {customEntries.length === 0 ? (
            <p className="text-gray-600 text-sm py-4 text-center">No custom entries yet.</p>
          ) : (
            <div className="space-y-1">
              {customEntries.map((entry) => (
                <div
                  key={entry.word}
                  className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5"
                >
                  <div>
                    <span className="text-white font-medium mr-3">{entry.word}</span>
                    <span className="text-emerald-400 text-sm font-mono">{entry.pronunciationSpelling}</span>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.word)}
                    className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Built-in dictionary */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Built-in Dictionary ({builtinEntries.length} words, read-only)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {builtinEntries.map((entry) => (
              <div
                key={entry.word}
                className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded px-3 py-1.5"
              >
                <span className="text-gray-400 text-sm">{entry.word}</span>
                <span className="text-gray-600 text-xs font-mono truncate">{entry.pronunciationSpelling}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
