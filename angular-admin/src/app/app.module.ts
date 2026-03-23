import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NotesListComponent } from './notes/notes-list/notes-list.component';
import { NoteDetailComponent } from './notes/note-detail/note-detail.component';
import { NoteFormComponent } from './notes/note-form/note-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryNotesService } from './in-memory-note-service';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    NotesListComponent,
    NoteDetailComponent,
    NoteFormComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    environment.production ? [] : InMemoryWebApiModule.forRoot(InMemoryNotesService, {
      delay: 300
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
