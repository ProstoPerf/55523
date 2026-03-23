import { Component, OnInit } from '@angular/core';
import { NotesService, Note } from '../../notes.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css']
})
export class NotesListComponent implements OnInit {
  notes: Note[] = [];
  loading: boolean = false;
  error: string | null = null;
  deletingId: string | null = null;

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.loading = true;
    this.error = null;
    this.notesService.getNotes().subscribe({
      next: (data: Note[]) => {
        this.notes = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load notes', err);
        this.error = 'Failed to load notes';
        this.loading = false;
      }
    });
  }

  onNoteAdded(): void {
    // called when NoteFormComponent emits noteAdded
    this.loadNotes();
  }

  refresh(): void {
    this.loadNotes();
  }

  deleteNote(id: string): void {
    if (!confirm('Удалить заметку?')) return;

    this.deletingId = id;
    this.notesService.deleteNote(id).subscribe({
      next: () => {
        // после удаления обновим список
        this.deletingId = null;
        this.loadNotes();
      },
      error: (err: any) => {
        console.error('Failed to delete note', err);
        this.error = 'Failed to delete note';
        this.deletingId = null;
      }
    });
  }
}