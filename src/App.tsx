import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AudioProvider } from './context/AudioContext';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import SoundDetailPage from './pages/SoundDetailPage';
import CollectionsPage from './pages/CollectionsPage';
import CratesPage from './pages/CratesPage';
import DictionaryPage from './pages/DictionaryPage';
import ExportsPage from './pages/ExportsPage';
import ProjectsPage from './pages/ProjectsPage';
import ImportLyricsPage from './pages/ImportLyricsPage';
import SettingsPage from './pages/SettingsPage';
import LyricsListPage from './pages/lyrics/LyricsListPage';
import LyricsNewPage from './pages/lyrics/LyricsNewPage';
import LyricsDetailPage from './pages/lyrics/LyricsDetailPage';
import LyricsWorkspacePage from './pages/lyrics/LyricsWorkspacePage';

function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/sounds/:id" element={<SoundDetailPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/crates" element={<CratesPage />} />

            <Route path="/lyrics" element={<LyricsListPage />} />
            <Route path="/lyrics/favorites" element={<LyricsListPage />} />
            <Route path="/lyrics/archived" element={<LyricsListPage />} />
            <Route path="/lyrics/new" element={<LyricsNewPage />} />
            <Route path="/lyrics/:id" element={<LyricsDetailPage />} />
            <Route path="/lyrics/:id/workspace" element={<LyricsWorkspacePage />} />

            <Route path="/projects" element={<ProjectsPage />} />

            <Route path="/tools/import-lyrics" element={<ImportLyricsPage />} />
            <Route path="/tools/export-lyrics" element={<ExportsPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AudioProvider>
  );
}

export default App;
