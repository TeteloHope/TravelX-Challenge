import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
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
    this.isLoading = true; 

    this.dataService.registerCustomer(this.client, this.user).subscribe({
      next: (response) => {
        this.snackBar.open('Registration Successful', 'Ok', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error registering client profile:', err);
        this.snackBar.open('Failed to register client profile. Please try again.', 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  login() {
    this.isLoading = true;
    this.user = this.loginFormGroup.value;

    this.dataService.login(this.user).subscribe({
      next: response => {
        console.log('API Response:', response);
        this.isLoading = false;
        this.dataService.loggedIn();
        localStorage.setItem('email', this.user.emailaddress);
        localStorage.setItem('Token', JSON.stringify(response.token));

        this.snackBar.open('Successfully logged in', 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });

        this.router.navigate(['/home']); // Redirect to home page for logic
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Invalid login credentials', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }
}
