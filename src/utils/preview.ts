/**
 * Resolve a preview_path value into a URL that can be passed to HTMLAudioElement.
 *
 * Supported formats:
 *   - Absolute URL  (https://cdn.example.com/file.mp3) → returned as-is
 *   - Root-relative (/previews/file.mp3)               → returned as-is
 *   - Relative path (previews/file.mp3)                → prepended with "/"
 */
export function resolvePreviewUrl(previewPath: string): string {
  if (/^https?:\/\//i.test(previewPath)) return previewPath;
  if (previewPath.startsWith('/')) return previewPath;
  return `/${previewPath}`;
}
