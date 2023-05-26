import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { WordSearchComponent } from './app/word-search.component';

bootstrapApplication(WordSearchComponent, appConfig)
  .catch((err) => console.error(err));
