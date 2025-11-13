import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LoginInput } from '../../models/login/loginInput';
import { LoginService } from '../../services/login/login.service';
import { LoginOutput } from '../../models/login/loginOutput';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  formLogin!: FormGroup;
  errorMessages: string[] = [];
  successfullyRegisteredUser: string = '';

  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  constructor(private formBuilder: FormBuilder, private loginService: LoginService, private route: Router) {
    this.formLogin = this.formBuilder.group({
      email: ['', [Validators.required, Validators.maxLength(320), Validators.pattern("^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$")]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255), Validators.pattern("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")]]
    });
    const currentNavigation = route.getCurrentNavigation();
    if (currentNavigation?.extras?.state?.['successData']) {
      this.successfullyRegisteredUser = currentNavigation?.extras?.state?.['successData'];
      setTimeout(() => {
        this.successfullyRegisteredUser = "";
      }, 3000);
    }
  }

  ngOnInit(): void {
  }

  submitForm(): void {
    this.errorMessages = [];

    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const loginInput: LoginInput = {
      email: this.formLogin.value.email,
      senha: this.formLogin.value.password
    };

    this.loginService.auth(loginInput).subscribe({
      next: (data: LoginOutput) => {
        localStorage.setItem('token', data.token);
        this.route.navigate(["home"]);
      },
      error: (error) => {
        if (error.error && error.error.message) {
          this.errorMessages.push(error.error.message);
        } else {
          this.errorMessages.push('Ocorreu um erro inesperado. Tente mais tarde, por favor!');
        }
      }
    }
    );
  }
}
