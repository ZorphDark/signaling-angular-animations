import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { SopaDeLetrasComponent } from './app/sopa-de-letras.component';

bootstrapApplication(SopaDeLetrasComponent, appConfig)
  .catch((err) => console.error(err));
