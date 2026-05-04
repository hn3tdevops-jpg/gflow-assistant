import { useLocalStorage } from './useLocalStorage';
import type { PronunciationDictionaryEntry } from '../types/lyrics';

const DICT_KEY = 'gflow:lyrics:v1:dictionary';

export function useCustomDictionary() {
  const [dictionary, setDictionary] = useLocalStorage<Record<string, PronunciationDictionaryEntry>>(
    DICT_KEY,
    {},
  );

  function saveEntry(entry: PronunciationDictionaryEntry): void {
    setDictionary((prev) => ({ ...prev, [entry.word.toLowerCase()]: entry }));
  }

  function deleteEntry(word: string): void {
    setDictionary((prev) => {
      const next = { ...prev };
      delete next[word.toLowerCase()];
      return next;
    });
  }

  return { dictionary, saveEntry, deleteEntry };
}
