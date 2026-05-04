import { Link } from 'react-router-dom';
import { useLyricsProjects } from '../../hooks/useLyricsProjects';

export default function LyricsListPage() {
  const { projects, deleteProject } = useLyricsProjects();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Lyrics Projects</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your phonetic lyric maps</p>
          </div>
          <Link
            to="/lyrics/new"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">🎵</p>
            <p className="text-lg font-medium mb-2">No lyric projects yet</p>
            <p className="text-sm">Create a new project to start building phonetic maps.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h2 className="font-semibold text-white truncate">{project.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {project.sections.length} section{project.sections.length !== 1 ? 's' : ''} ·{' '}
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/lyrics/${project.id}`}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${project.title}"?`)) deleteProject(project.id);
                    }}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-300 rounded text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
