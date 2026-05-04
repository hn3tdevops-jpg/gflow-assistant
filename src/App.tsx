import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import SoundDetailPage from './pages/SoundDetailPage';
import CollectionsPage from './pages/CollectionsPage';
import CratesPage from './pages/CratesPage';
import LyricsListPage from './pages/lyrics/LyricsListPage';
import LyricsNewPage from './pages/lyrics/LyricsNewPage';
import LyricsDetailPage from './pages/lyrics/LyricsDetailPage';
import DictionaryPage from './pages/DictionaryPage';
import ExportsPage from './pages/ExportsPage';
import { AudioProvider } from './context/AudioContext';

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
          <Route path="/lyrics/new" element={<LyricsNewPage />} />
          <Route path="/lyrics/:id" element={<LyricsDetailPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/exports" element={<ExportsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
    </AudioProvider>
  );
}

export default App;
