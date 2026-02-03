import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  template: `
    <p-toast [breakpoints]="{ '480px': { width: '80vw' } }" position="top-right" />
    <router-outlet />
  `,
  styles: ``
})
export class App {
  title = 'youth-ministry-attendance';
}
