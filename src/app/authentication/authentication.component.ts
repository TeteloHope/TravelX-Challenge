import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Client } from '../models/client';
import { User } from '../models/user';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css'],
  animations: [
    trigger('formTransition', [
      state('login', style({ transform: 'translateX(0%)' })),
      state('register', style({ transform: 'translateX(-100%)' })),
      transition('login <=> register', animate('0.5s ease-in-out'))
    ])
  ]
})

export class AuthenticationComponent implements OnInit {
  currentForm: 'login' | 'register' = 'login';
  client: Client = new Client();
  user: User = { emailaddress: '', password: '' };
  confirmPassword: string = '';
  isLoading = false;
  loginFormGroup!: FormGroup;

  constructor(
    private dataService: DataService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize login form
    this.loginFormGroup = this.formBuilder.group({
      emailaddress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  toggleForm(form: 'login' | 'register') {
    this.currentForm = form;
  }

  hidePassword = true;
  clickEvent(event: MouseEvent) {
    this.hidePassword = !this.hidePassword;
    event.stopPropagation();
  }

  registerClient(): void {
    if (!this.client.first_Name || !this.client.last_Name || !this.client.email_Address ||
        !this.user.password || !this.client.id_Number || !this.client.phone_Number) {
      this.showSnackBar('Please fill out all required fields.');
      return;
    }

    if (this.user.password !== this.confirmPassword) {
      this.showSnackBar('Passwords do not match.');
      return;
    }

    this.isLoading = true;

    // Check if the email exists in the backend before registering the client
    this.dataService.checkEmailExists(this.client.email_Address).subscribe({
      next: (exists) => {
        if (exists) {
          this.showSnackBar('Email already exists. Please use a different email.');
          this.isLoading = false;
        } else {
          this.createClient();
        }
      },
      error: () => {
        this.showSnackBar('Error checking email existence.');
        this.isLoading = false;
      }
    });
  }

  private createClient(): void {
    this.dataService.registerCustomer(this.client, this.user).subscribe({
      next: () => {
        this.showSnackBar('Registration Successful');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.showSnackBar('Failed to register client. Please try again.');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  login() {
    if (!this.loginFormGroup.valid) {
      this.showSnackBar('Username and Password are required');
      return;
    }

    this.isLoading = true;
    this.user = this.loginFormGroup.value;

    this.dataService.login(this.user).subscribe({
      next: response => {
        console.log('API Response:', response);
        this.isLoading = false;
        this.dataService.loggedIn();
        localStorage.setItem('email', this.user.emailaddress);
        localStorage.setItem('Token', JSON.stringify(response.token));

        this.showSnackBar('Successfully logged in');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading = false;
        this.showSnackBar('Invalid login credentials');
      }
    });
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['custom-snackbar']
    });
  }
}
