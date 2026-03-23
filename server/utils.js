function get(obj, path, defaultValue) {
  if (obj == null) return defaultValue;

  const pathArr = Array.isArray(path) ? path : String(path).split('.').filter(Boolean);
  let current = obj;
  for (let i = 0; i < pathArr.length; i++) {
    if (current == null) return defaultValue;
    current = current[pathArr[i]];
  }
  return current === undefined ? defaultValue : current;
}

function set(obj, path, value) {
  if (obj == null) return;

  const pathArr = Array.isArray(path) ? path : String(path).split('.').filter(Boolean);
  let current = obj;
  for (let i = 0; i < pathArr.length; i++) {
    const key = pathArr[i];
    if (i === pathArr.length - 1) {
      current[key] = value;
    } else {
      if (typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }
  }
  return obj;
}

function validateNote(note) {
  const errors = [];

  if (!note) {
    errors.push('Note is required.');
    return { valid: false, errors };
  }

  const hasTitle = typeof note.title === 'string' && note.title.trim().length > 0;
  if (!hasTitle) errors.push('title: required string.');

  if (note.content != null && typeof note.content !== 'string') {
    errors.push('content: must be a string if provided.');
  }

  if (note.archived != null && typeof note.archived !== 'boolean') {
    errors.push('archived: must be a boolean if provided.');
  }

  if (note.pinned != null && typeof note.pinned !== 'boolean') {
    errors.push('pinned: must be a boolean if provided.');
  }

  if (note.id != null && typeof note.id !== 'string') {
    errors.push('id: must be a string if provided.');
  }

  if (note.createdAt != null && isNaN(Date.parse(note.createdAt))) {
    errors.push('createdAt: must be a valid date string if provided.');
  }

  if (note.updatedAt != null && isNaN(Date.parse(note.updatedAt))) {
    errors.push('updatedAt: must be a valid date string if provided.');
  }

  return { valid: errors.length === 0, errors };
}

// Normalize error payloads for API responses
function apiError(message, code = 500, details = null) {
  const err = {
    error: {
      message,
      code,
    },
  };
  if (details) err.error.details = details;
  return err;
}

function createNote(db, partial) {
  const now = new Date().toISOString();
  const id = typeof partial?.id === 'string' && partial.id.trim() !== '' ? partial.id : `n_${Date.now()}`;
  const note = {
    id,
    title: (partial?.title ?? 'Untitled').toString(),
    content: partial?.content ?? '',
    archived: !!partial?.archived,
    pinned: !!partial?.pinned,
    createdAt: now,
    updatedAt: now,
  };
  // basic validation
  const { valid, errors } = validateNote(note);
  if (!valid) return { ok: false, errors };

  db.push(note);
  return { ok: true, note };
}

function readNote(db, id) {
  const note = db.find((n) => n.id === id);
  if (!note) return { ok: false, error: apiError('Note not found', 404) };
  return { ok: true, note };
}

function updateNote(db, id, updates) {
  const idx = db.findIndex((n) => n.id === id);
  if (idx === -1) return { ok: false, error: apiError('Note not found', 404) };

  const existing = db[idx];
  const updated = {
    ...existing,
    ...updates,
    id: existing.id, // ensure id isn't changed
    updatedAt: new Date().toISOString(),
  };

  const { valid, errors } = validateNote(updated);
  if (!valid) return { ok: false, errors };

  db[idx] = updated;
  return { ok: true, note: updated };
}

function deleteNote(db, id) {
  const idx = db.findIndex((n) => n.id === id);
  if (idx === -1) return { ok: false, error: apiError('Note not found', 404) };
  const [deleted] = db.splice(idx, 1);
  return { ok: true, note: deleted };
}

function queryNotes(db, opts = {}) {
  const { q, archived, pinned, limit = 20, offset = 0 } = opts;

  let results = [...db];

  if (typeof archived === 'boolean') {
    results = results.filter((n) => n.archived === archived);
  }
  if (typeof pinned === 'boolean') {
    results = results.filter((n) => n.pinned === pinned);
  }
  if (typeof q === 'string' && q.trim()) {
    const term = q.toLowerCase();
    results = results.filter(
      (n) => (n.title || '').toLowerCase().includes(term) || (n.content || '').toLowerCase().includes(term)
    );
  }

  const start = Math.max(0, Number(offset) || 0);
  const end = start + Math.max(0, Number(limit) || 20);
  return results.slice(start, end);
}

function getPortFromEnv(defaultPort = 3000) {
  const p = process.env.PORT;
  const parsed = p ? parseInt(p, 10) : NaN;
  return Number.isNaN(parsed) ? defaultPort : parsed;
}

function logInfo(...args) {
  if (typeof console !== 'undefined' && console.info) {
    console.info('[notes-api]', ...args);
  }
}
function logWarn(...args) {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('[notes-api]', ...args);
  }
}
function logError(...args) {
  if (typeof console !== 'undefined' && console.error) {
    console.error('[notes-api]', ...args);
  }
}

module.exports = {
  get,
  set,
  validateNote,
  apiError,
  createNote,
  readNote,
  updateNote,
  deleteNote,
  queryNotes,
  getPortFromEnv,
  logInfo,
  logWarn,
  logError,
};
