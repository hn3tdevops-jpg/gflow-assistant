import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import SoundDetailPage from './pages/SoundDetailPage';
import CollectionsPage from './pages/CollectionsPage';
import CratesPage from './pages/CratesPage';
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
        </Routes>
      </Layout>
    </BrowserRouter>
    </AudioProvider>
  );
}

export default App;
