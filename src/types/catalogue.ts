export type ItemType =
  | 'instrument'
  | 'sample'
  | 'loop'
  | 'preset'
  | 'kit'
  | 'collection'
  | 'reference';

export interface SoundItem {
  id: string;
  title: string;
  type: ItemType;
  category: string;
  subcategory: string | null;
  description: string | null;
  tags: string[];
  bpm: number | null;
  key: string | null;
  duration_seconds: number | null;
  file_path: string;
  preview_path: string | null;
  waveform_path: string | null;
  license: string | null;
  source: string | null;
  format: string | null;
  sample_rate: number | null;
  bit_depth: number | null;
  favorite: boolean;
  production_notes: string | null;
}

export interface FilterState {
  query: string;
  type: ItemType | '';
  category: string;
  tags: string[];
  key: string;
  bpmMin: number | '';
  bpmMax: number | '';
  license: string;
  favoritesOnly: boolean;
}

export interface Crate {
  id: string;
  name: string;
  soundIds: string[];
  createdAt: string;
  updatedAt: string;
}
