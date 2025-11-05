import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TrackPage from './pages/TrackPage.jsx';
import PlayerProvider from './player/PlayerProvider.jsx';

export default function App() {
  return (
    <PlayerProvider>
      <div className="min-h-screen">
        <header className="app-header">
          <Link to="/" className="brand">Filmy Covers</Link>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track/:id" element={<TrackPage />} />
        </Routes>
      </div>
    </PlayerProvider>
  );
}

function Home() {
  const [tracks, setTracks] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/api/tracks')
      .then(r => r.json())
      .then(setTracks)
      .catch(console.error);
  }, []);

  return (
    <div className="home-grid">
      {tracks.map(t => (
        <button
          key={t._id}
          onClick={() => nav(`/track/${t._id}`)}
          className="card"
        >
          <img src={t.coverUrl} alt={t.title} className="card-img" />
          <div className="card-body">
            <div className="card-title">{t.title}</div>
            <div className="card-sub">{(t.artists || []).map(a => a.name).join(', ')}</div>
          </div>
        </button>
      ))}
    </div>
  );
}