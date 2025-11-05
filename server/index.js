const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Mongo connected'))
  .catch((e) => console.error('Mongo error', e));

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatarUrl: String,
  followerCount: { type: Number, default: 0 }
}, { timestamps: true });

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
  coverUrl: String,
  audioUrl: String,         // can be a remote URL for dev
  tags: [String],
  durationSec: Number,      // optional, client can compute if missing
  playCount: { type: Number, default: 0 },
}, { timestamps: true });

const playlistSchema = new mongoose.Schema({
  name: String,
  userId: String,             // keep it simple for now
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
}, { timestamps: true });

const Artist = mongoose.model('Artist', artistSchema);
const Track = mongoose.model('Track', trackSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);

// health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// list tracks
app.get('/api/tracks', async (req, res) => {
  const tracks = await Track.find().populate('artists').sort({ createdAt: -1 });
  res.json(tracks);
});

// get one track
app.get('/api/tracks/:id', async (req, res) => {
  const track = await Track.findById(req.params.id).populate('artists');
  if (!track) return res.status(404).json({ error: 'Track not found' });
  res.json(track);
});

// simple follow toggle (no auth yet, just increments for demo)
app.post('/api/artists/:id/follow', async (req, res) => {
  const artist = await Artist.findById(req.params.id);
  if (!artist) return res.status(404).json({ error: 'Artist not found' });
  artist.followerCount += 1;
  await artist.save();
  res.json({ followerCount: artist.followerCount });
});

// playlists
app.post('/api/playlists', async (req, res) => {
  const playlist = await Playlist.create({ name: req.body.name, userId: 'demo', tracks: [] });
  res.status(201).json(playlist);
});
app.post('/api/playlists/:id/add', async (req, res) => {
  const pl = await Playlist.findById(req.params.id);
  if (!pl) return res.status(404).json({ error: 'Playlist not found' });
  pl.tracks.addToSet(req.body.trackId);
  await pl.save();
  res.json(pl);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));