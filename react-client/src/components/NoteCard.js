import React from 'react';

function NoteCard({ note }) {
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title mb-0">{note.title}</h5>
          <small className="text-muted">{note.createdAt ? formatDate(note.createdAt) : ''}</small>
        </div>

        {note.text ? (
          <p className="card-text flex-grow-1">{note.text}</p>
        ) : (
          <p className="text-muted">Нет текста</p>
        )}

      </div>
    </div>
  );
}

export default NoteCard;