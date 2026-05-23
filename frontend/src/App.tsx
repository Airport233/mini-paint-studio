import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/Auth/AuthPage';
import PaintListPage from './pages/PaintLibrary/PaintListPage';
import MixPage from './pages/MixEngine/MixPage';
import PreviewPage from './pages/Preview3D/PreviewPage';
import RecipeListPage from './pages/Recipes/RecipeListPage';
import RecipeDetailPage from './pages/Recipes/RecipeDetailPage';
import PresetListPage from './pages/LightingPresets/PresetListPage';
import ColorWheelPage from './pages/ColorWheel/ColorWheelPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', padding: 'var(--space-6)' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/paints" replace />} />
          <Route path="/paints" element={<PaintListPage />} />
          <Route path="/mix" element={<MixPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/recipes" element={<RecipeListPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/lighting-presets" element={<PresetListPage />} />
          <Route path="/color-wheel" element={<ColorWheelPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
