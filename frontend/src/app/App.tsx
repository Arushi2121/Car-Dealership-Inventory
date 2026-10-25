import { Route, Routes } from 'react-router';
import { StyleguidePage } from './StyleguidePage';

function PlaceholderHome() {
  return (
    <main className="grid min-h-screen place-content-center text-center">
      <h1 className="text-7xl">Marque</h1>
      <p className="mt-4 text-lg text-muted">Cars worth the drive.</p>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderHome />} />
      {import.meta.env.DEV && <Route path="/styleguide" element={<StyleguidePage />} />}
    </Routes>
  );
}
