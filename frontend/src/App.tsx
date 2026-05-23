import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/Auth/AuthPage';
import HomePage from './pages/HomePage';
import PaintListPage from './pages/PaintLibrary/PaintListPage';
import MixPage from './pages/MixEngine/MixPage';
import PreviewPage from './pages/Preview3D/PreviewPage';
import RecipeListPage from './pages/Recipes/RecipeListPage';
import RecipeDetailPage from './pages/Recipes/RecipeDetailPage';
import PresetListPage from './pages/LightingPresets/PresetListPage';
import ColorWheelPage from './pages/ColorWheel/ColorWheelPage';

function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/paints" element={<PaintListPage />} />
          <Route path="/mix" element={<MixPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/recipes" element={<RecipeListPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/color-wheel" element={<ColorWheelPage />} />
          <Route path="/lighting-presets" element={<PresetListPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
