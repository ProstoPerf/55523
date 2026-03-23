const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'notes.json');

// Разрешить CORS только для Angular и React (локально)
const allowedOrigins = ['http://localhost:4200', 'http://localhost:3000'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like curl or mobile apps)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

// Helper: read notes
async function readNotes() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist — return empty array
      return [];
    }
    throw err;
  }
}

// Helper: write notes
async function writeNotes(notes) {
  await fs.writeFile(DATA_FILE, JSON.stringify(notes, null, 2), 'utf8');
}

// GET /notes
app.get('/notes', async (req, res) => {
  try {
    const notes = await readNotes();
    res.json(notes);
  } catch (err) {
    console.error('Failed to read notes:', err);
    res.status(500).json({ error: 'Failed to read notes' });
  }
});

// POST /notes
app.post('/notes', async (req, res) => {
  try {
    const { title, text } = req.body || {};
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const notes = await readNotes();
    const newNote = {
      id: Date.now().toString(),
      title: title.trim(),
      text: (text && String(text)) || '',
      createdAt: new Date().toISOString()
    };
    notes.unshift(newNote); // add to start
    await writeNotes(notes);
    res.status(201).json(newNote);
  } catch (err) {
    console.error('Failed to add note:', err);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// DELETE /notes/:id
app.delete('/notes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const notes = await readNotes();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
    notes.splice(idx, 1);
    await writeNotes(notes);
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});