import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/interfaces/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error: string | null = null;
  hidePassword = true;
  returnUrl = '/inbox';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to '/inbox'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/inbox';

    // Redirect to inbox if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
      return;
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Login successful:', response.user);
          this.router.navigate([this.returnUrl]);
        } else {
          this.error = response.message || 'Error en el login';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.error = error.error?.message || 'Error de conexión';
        this.loading = false;
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register'], { 
      queryParams: { returnUrl: this.returnUrl } 
    });
  }

  // Getters for form validation
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}