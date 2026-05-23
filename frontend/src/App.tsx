import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthPage from './pages/Auth/AuthPage';

function HomePage() {
  return <h1 style={{ color: 'var(--text-primary)', padding: 32 }}>涂装工作站</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
