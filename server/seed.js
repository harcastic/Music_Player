const mongoose = require('mongoose');
require('dotenv').config();

const artistSchema = new mongoose.Schema({ name: String, avatarUrl: String, followerCount: Number });
const trackSchema = new mongoose.Schema({
  title: String, artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
  coverUrl: String, audioUrl: String, tags: [String], durationSec: Number
});
const Artist = mongoose.model('Artist', artistSchema);
const Track = mongoose.model('Track', trackSchema);

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const a1 = await Artist.create({ name: 'Artist One', followerCount: 208000 });
  const a2 = await Artist.create({ name: 'Artist Two', followerCount: 50200 });

  await Track.create({
    title: 'Hai Apna Dil To Awara (Cover)',
    artists: [a1._id, a2._id],
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    tags: ['love', 'hindi pop'],
    durationSec: 356
  });

  await Track.create({
    title: 'Night Drive',
    artists: [a1._id],
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    tags: ['chill', 'synthwave'],
    durationSec: 412
  });

  console.log('Seeded. Ctrl+C to exit.');
})();