import { Route, Routes } from 'react-router';

function PlaceholderHome() {
  return (
    <main className="grid min-h-screen place-items-center">
      <h1 className="font-display text-6xl font-bold text-accent">Midnight Motors</h1>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PlaceholderHome />} />
    </Routes>
  );
}
