import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Note } from '../../notes/note.model';
import { NotesService } from '../../notes.service';

@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.css']
})
export class NoteFormComponent implements OnInit {
  @Input() note?: Note;
  @Output() formSubmitted = new EventEmitter<Note>();
  @Output() formCancelled = new EventEmitter<void>();

  noteForm: FormGroup;
  isEditMode = false;
  submitting = false;
  error?: string;

  constructor(private fb: FormBuilder, private notesService: NotesService) {
    this.noteForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.note?.id) {
      this.isEditMode = true;
      this.noteForm.patchValue({
        title: this.note.title,
        content: this.note.content
      });
    }
  }

  get f() {
    return this.noteForm.controls;
  }

  onSubmit(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = undefined;

    const formValue = this.noteForm.value as Partial<Note>;

    if (this.isEditMode && this.note?.id != null) {
      // Update existing note
      const updated: Partial<Note> = {
        title: formValue.title,
        content: formValue.content
      };
      this.notesService.updateNote(this.note.id, updated).subscribe({
        next: (note: any) => {
          this.submitting = false;
          this.formSubmitted.emit(note);
        },
        error: (err: any) => {
          this.submitting = false;
          this.error = this.extractError(err);
        }
      });
    } else {
      // Create new note
      const newNote: Partial<Note> = {
        title: formValue.title,
        content: formValue.content
      };
      this.notesService.createNote(newNote).subscribe({
        next: (note: any) => {
          this.submitting = false;
          this.formSubmitted.emit(note);
          this.noteForm.reset();
        },
        error: (err: any) => {
          this.submitting = false;
          this.error = this.extractError(err);
        }
      });
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  private extractError(err: any): string {
    // Basic error extraction; adapt to your API error shape
    if (err?.error?.message) {
      return err.error.message;
    }
    if (typeof err?.message === 'string') {
      return err.message;
    }
    return 'An error occurred. Please try again.';
  }
}
