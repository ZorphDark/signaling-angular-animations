import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { CrosswordComponent } from './app/crossword.component';

bootstrapApplication(CrosswordComponent, appConfig)
  .catch((err) => console.error(err));
