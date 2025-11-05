import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../player/PlayerProvider.jsx';

export default function TrackPage() {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [followers, setFollowers] = useState(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    fetch(`http://localhost:4000/api/tracks/${id}`)
      .then(r => r.json())
      .then(t => { setTrack(t); setFollowers(t.artists?.[0]?.followerCount ?? 0); })
      .catch(console.error);
  }, [id]);

  if (!track) return <div style={{ padding: 40 }}>Loading…</div>;

  const mainArtist = track.artists?.[0];

  return (
    <div className="track-page">
      <div className="gradient-decor" />
      <div className="track-grid">
        {/* Left */}
        <div>
          <h1 className="title">
            {splitTitle(track.title).map((line, i) => <div key={i}>{line}</div>)}
          </h1>

          <p className="meta">{track.artists.map(a => a.name).join(', ')}</p>

          <div className="progress-stub" />

          <div className="author-row">
            <div className="author">
              <img src={mainArtist?.avatarUrl || 'https://i.pravatar.cc/32'} alt="" />
              <span className="name">{mainArtist?.name || 'Artist'}</span>
              <span className="dot-muted">• {nFormat(followers || 0)}</span>
            </div>
            <button
              onClick={async () => {
                if (!mainArtist?._id) return;
                const r = await fetch(`http://localhost:4000/api/artists/${mainArtist._id}/follow`, { method: 'POST' });
                const data = await r.json();
                setFollowers(data.followerCount);
              }}
              className="btn"
            >
              Follow
            </button>
          </div>

          <div className="chips">
            {track.tags.map((t) => (<span key={t} className="chip">#{t}</span>))}
          </div>

          <div className="actions">
            <button onClick={() => playTrack(track)} className="btn btn-accent">Play</button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
              }}
              className="btn"
            >
              Share
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="cover-wrap">
          <div className="cover-neon" />
          <img src={track.coverUrl} alt={track.title} className="cover-img" />
        </div>
      </div>
    </div>
  );
}

function splitTitle(title) {
  const words = title.split(' ');
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

function nFormat(n) {
  return Intl.NumberFormat('en', { notation: 'compact' }).format(n);
}