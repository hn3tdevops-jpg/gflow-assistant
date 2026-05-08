export interface DiffLine {
  kind: 'added' | 'removed' | 'unchanged';
  text: string;
}

export function compareTextLines(previous: string, current: string): DiffLine[] {
  const prevLines = previous.split(/\r?\n/);
  const curLines = current.split(/\r?\n/);
  const max = Math.max(prevLines.length, curLines.length);
  const lines: DiffLine[] = [];

  for (let i = 0; i < max; i += 1) {
    const prev = prevLines[i];
    const cur = curLines[i];

    if (prev === cur) {
      lines.push({ kind: 'unchanged', text: cur ?? '' });
      continue;
    }

    if (prev !== undefined) {
      lines.push({ kind: 'removed', text: prev });
    }
    if (cur !== undefined) {
      lines.push({ kind: 'added', text: cur });
    }
  }

  return lines;
}
