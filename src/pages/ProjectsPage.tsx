import { Link } from 'react-router-dom';
import { useLyricsProjects } from '../hooks/useLyricsProjects';

function groupCount(values: string[]) {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((value) => {
    map.set(value, (map.get(value) ?? 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export default function ProjectsPage() {
  const { lyrics } = useLyricsProjects();

  const projectGroups = groupCount(lyrics.map((lyric) => lyric.projectName));
  const albumGroups = groupCount(lyrics.map((lyric) => lyric.albumName || lyric.collectionName));
  const artistGroups = groupCount(lyrics.map((lyric) => lyric.artistName || lyric.personaName));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-gray-400">Organize lyrics by project, album, collection, or artist persona.</p>
        </div>
        <Link to="/lyrics/new" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white">New Lyric</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="font-semibold mb-3">Projects</h2>
          {projectGroups.length === 0 ? <p className="text-sm text-gray-500">No projects yet.</p> : projectGroups.map(([name, count]) => (
            <div key={name} className="flex justify-between py-1 text-sm">
              <span>{name}</span>
              <span className="text-gray-500">{count}</span>
            </div>
          ))}
        </section>

        <section className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="font-semibold mb-3">Albums / Collections</h2>
          {albumGroups.length === 0 ? <p className="text-sm text-gray-500">No albums or collections yet.</p> : albumGroups.map(([name, count]) => (
            <div key={name} className="flex justify-between py-1 text-sm">
              <span>{name}</span>
              <span className="text-gray-500">{count}</span>
            </div>
          ))}
        </section>

        <section className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="font-semibold mb-3">Artists / Personas</h2>
          {artistGroups.length === 0 ? <p className="text-sm text-gray-500">No artists yet.</p> : artistGroups.map(([name, count]) => (
            <div key={name} className="flex justify-between py-1 text-sm">
              <span>{name}</span>
              <span className="text-gray-500">{count}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
