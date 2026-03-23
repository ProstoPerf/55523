import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Note } from './notes/note.model';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private baseUrl = '/api/notes'; // adjust if your backend uses a different base URL

  constructor(private http: HttpClient) { }

  // Get all notes or search by query
  getNotes(query?: string): Observable<Note[]> {
    if (query && query.trim()) {
      const params = new HttpParams().set('q', query.trim());
      return this.http.get<Note[]>(this.baseUrl, { params });
    }
    return this.http.get<Note[]>(this.baseUrl);
  }

  // Get a single note by id
  getNote(id: number): Observable<Note> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<Note>(url);
  }

  // Create a new note
  createNote(note: Partial<Note>): Observable<Note> {
    return this.http.post<Note>(this.baseUrl, note);
  }

  // Update an existing note
  updateNote(id: number, note: Partial<Note>): Observable<Note> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<Note>(url, note);
  }

  // Delete a note
  deleteNote(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
