import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  isSubmitting = false;

   submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.form.controls.confirmPassword.setErrors({ mismatch: true });
      return;
    }

    this.isSubmitting = true;

    const payload = {
      username: this.username.value!,
      email: this.email.value!,
      password: this.password.value!,
    };

    this.auth.register(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        console.log('Register status:', res.status);
        console.log('Register success:', res.body?.message);

        alert(res.body?.message ?? 'User created');
        this.router.navigateByUrl('/auth/login');
      },
      error: (err) => {
        this.isSubmitting = false;

        const msg = err?.error?.message || 'Register failed';

        console.log('Register status:', err.status);
        console.error('Register failed:', msg, err);

        alert(msg);
      },
    });
  }


  
  get username() {
  return this.form.controls.username;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }
}