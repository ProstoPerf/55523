import React from 'react';
import NoteCard from './NoteCard';

function NotesList({ notes }) {
  if (!notes || notes.length === 0) {
    return (
      <div className="alert alert-info">
        Список заметок пуст. Добавьте заметку в админ-панели.
      </div>
    );
  }

  return (
    <div className="row">
      {notes.map(note => (
        <div className="col-md-6 mb-3" key={note.id}>
          <NoteCard note={note} />
        </div>
      ))}
    </div>
  );
}

export default NotesList;