import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Client } from '../models/client';
import { User } from '../models/user';

@Component({
  selector: 'app-authentication',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatIconModule, MatCheckboxModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css',
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

  toggleForm(form: 'login' | 'register') {
    this.currentForm = form;
  }

  client: Client = new Client();
  user: User = { emailaddress: '', password: '' };
  confirmPassword: string = '';
  isLoading = false;
  loginFormGroup!: FormGroup;

  constructor(
    private dataService: DataService, 
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    public dialog: MatDialog, 
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initializing the login form inside ngOnInit
    this.loginFormGroup = this.formBuilder.group({
      emailaddress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
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

  //login
  onLoad() {
    localStorage.clear();
    //window.location.reload();
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
