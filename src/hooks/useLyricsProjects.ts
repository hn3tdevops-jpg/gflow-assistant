import { useLocalStorage } from './useLocalStorage';
import type { LyricProject } from '../types/lyrics';

const PROJECTS_KEY = 'gflow:lyrics:v1:projects';

export function useLyricsProjects() {
  const [projects, setProjects] = useLocalStorage<LyricProject[]>(PROJECTS_KEY, []);

  function saveProject(project: LyricProject): void {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = project;
        return updated;
      }
      return [...prev, project];
    });
  }

  function deleteProject(id: string): void {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function getProject(id: string): LyricProject | undefined {
    return projects.find((p) => p.id === id);
  }

  return { projects, saveProject, deleteProject, getProject };
}
