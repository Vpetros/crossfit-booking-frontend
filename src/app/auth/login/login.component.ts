import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { TokenStorage } from '../token.storage';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isSubmitting = false;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      username: this.form.controls.username.value!,
      password: this.form.controls.password.value!,
    };

    this.auth.login(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        console.log('Login success:', {
          username: res.username,
          role: res.role,
          storedUsername: TokenStorage.getUsername(),
          storedRoles: TokenStorage.getRoles(),
        });
        
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.isSubmitting = false;

        const msg = err?.error?.message || 'Login failed';
        console.error('Login failed:', msg, err);
        
        alert(msg);
      },
    });
  }

  get username() {
    return this.form.controls.username;
  }

  get password() {
    return this.form.controls.password;
  }
}