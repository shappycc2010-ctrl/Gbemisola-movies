// server/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cron = require('node-cron');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 4000;

// lowdb setup (server/db.json)
const dbFile = path.join(__dirname, 'db.json');
const adapter = new FileSync(dbFile);
const db = low(adapter);
db.defaults({ users: [], videos: [], settings: {} }).write();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Simple quick-login endpoint (frontend uses this)
app.post('/api/auth/quick', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send({ message: 'Missing name' });
  let user = db.get('users').find({ name }).value();
  if (!user) {
    const role = name.toLowerCase().includes('gbemisola')
      ? 'boss'
      : (name.toLowerCase().includes('shalom') || name.toLowerCase().includes('shappycc'))
        ? 'bossboss'
        : 'viewer';
    user = { id: Date.now().toString(), name, role, banned: false, youtube: {} };
    db.get('users').push(user).write();
  }
  if (user.banned) return res.status(403).send({ message: 'Banned' });
  res.send({ user });
});

// List videos (public)
app.get('/api/videos', (req, res) => {
  const videos = db.get('videos').filter(v => !v.banned).value();
  res.send(videos);
});

// Get video and increment views
app.get('/api/videos/:id', (req, res) => {
  const v = db.get('videos').find({ id: req.params.id }).value();
  if (!v) return res.status(404).send({ message: 'Not found' });
  v.views = (v.views || 0) + 1;
  db.get('videos').find({ id: req.params.id }).assign(v).write();
  res.send(v);
});

// Uploads (multer)
const multer = require('multer');
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Simple auth middleware for demo (header: X-User-Name)
function auth(req, res, next) {
  const name = req.headers['x-user-name'];
  if (!name) return res.status(401).send({ message: 'Missing X-User-Name header' });
  const user = db.get('users').find({ name }).value();
  if (!user) return res.status(401).send({ message: 'Unknown user' });
  if (user.banned) return res.status(403).send({ message: 'Banned' });
  req.user = user;
  next();
}

// Upload video (only boss)
app.post('/api/videos/upload', auth, upload.single('video'), (req, res) => {
  if (req.user.role !== 'boss') return res.status(403).send({ message: 'Only boss can upload' });
  const file = req.file;
  if (!file) return res.status(400).send({ message: 'No file' });
  const { title, description, duration } = req.body;
  const video = {
    id: Date.now().toString(),
    title: title || file.originalname,
    description: description || '',
    filename: file.filename,
    thumbnail: '', // placeholder
    duration: Number(duration) || 0,
    uploader: req.user.name,
    views: 0,
    banned: false,
    youtubeId: null,
    publishedAt: new Date().toISOString()
  };
  db.get('videos').push(video).write();
  console.log('Mock notify: New video uploaded', video.title);
  res.send(video);
});

// Delete video (boss deletes own; bossboss deletes any)
app.delete('/api/videos/:id', auth, (req, res) => {
  const v = db.get('videos').find({ id: req.params.id }).value();
  if (!v) return res.status(404).send({ message: 'Not found' });
  if (req.user.role === 'bossboss' || (req.user.role === 'boss' && req.user.name === v.uploader)) {
    try { fs.unlinkSync(path.join(uploadDir, v.filename)); } catch (e) { /* ignore */ }
    db.get('videos').remove({ id: req.params.id }).write();
    return res.send({ message: 'Deleted' });
  }
  return res.status(403).send({ message: 'Forbidden' });
});

// Admin ban user (bossboss only)
app.post('/api/admin/ban/:userId', auth, (req, res) => {
  if (req.user.role !== 'bossboss') return res.status(403).send({ message: 'Forbidden' });
  const u = db.get('users').find({ id: req.params.userId }).value();
  if (!u) return res.status(404).send({ message: 'User not found' });
  db.get('users').find({ id: req.params.userId }).assign({ banned: true }).write();
  res.send({ message: 'User banned' });
});

/* ---------------------------
   YouTube sync placeholder
   - To enable, set YOUTUBE_CLIENT_ID/SECRET and complete OAuth flow
   - This placeholder shows where to add cron job calls
   --------------------------- */
function mockYouTubeSync() {
  // Example: import the boss's uploaded YouTube videos by youtubeId
  const bosses = db.get('users').filter(u => ['boss','bossboss'].includes(u.role) && u.youtube && u.youtube.refreshToken).value();
  if (!bosses.length) return;
  console.log('Running mock YouTube sync (placeholder)');
  // Implement real YouTube API usage here
}
cron.schedule('0 */6 * * *', mockYouTubeSync); // every 6 hours

// Serve frontend static build
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => console.log('🎬 Gbemisola Movies server listening on', PORT));
