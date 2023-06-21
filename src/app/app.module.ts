import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { AngularPinturaModule } from '@pqina/angular-pintura';

import { FilePondModule, registerPlugin } from 'ngx-filepond';

import FilePondPluginFilePoster from 'filepond-plugin-file-poster';

import FilePondPluginImageEditor from '@pqina/filepond-plugin-image-editor';
import { FormsModule } from '@angular/forms';

registerPlugin(FilePondPluginFilePoster, FilePondPluginImageEditor);

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AngularPinturaModule, FilePondModule,FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
