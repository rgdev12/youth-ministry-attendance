import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export default class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Icons
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly LoginIcon = LogIn;
  readonly AlertIcon = AlertCircle;
  readonly LoaderIcon = Loader2;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  // Form state
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Por favor ingresa tu correo y contraseña');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { error } = await this.authService.signIn(this.email, this.password);

    this.loading.set(false);

    if (error) {
      this.error.set(error);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
