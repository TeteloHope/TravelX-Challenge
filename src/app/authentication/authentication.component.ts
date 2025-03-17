import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Client } from '../models/client';
import { User } from '../models/user';

@Component({
  selector: 'app-authentication',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MatIconModule, MatCheckboxModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.css',
  // animations: [
  //   trigger('formAnimation', [
  //     state('login', style({ opacity: 1, transform: 'translateX(0)' })),
  //     state('register', style({ opacity: 1, transform: 'translateX(0)' })),
  //     transition('login <=> register', [
  //       style({ opacity: 0, transform: 'translateX(-20px)' }),
  //       animate('300ms ease-in-out')
  //     ])
  //   ])
  // ]
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
    // Initialize the form inside ngOnInit
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
    if (!this.client.first_Name || !this.client.last_Name || !this.client.email_Address || !this.user.password || !this.client.id_Number || !this.client.phone_Number ) {
      this.snackBar.open('Please fill out all required fields.', 'OK', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    if (this.user.password !== this.confirmPassword) {
      this.snackBar.open('Passwords do not match', 'OK', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['custom-snackbar']
      });
      return;
    }

    this.isLoading = true; 

    this.dataService.getAllClients().subscribe({
      next: (clients) => {
        const exists = clients.some((c: { email_Address: string; }) => c.email_Address === this.client.email_Address);

        if (exists) {
          this.snackBar.open('Customer with the provided email address already exists. Please register with a different email address.', 'OK', {
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['custom-snackbar']
          });
          this.isLoading = false; 
          return;
        } else {
          this.dataService.registerCustomer(this.client, this.user).subscribe({
            next: (response) => {
              this.snackBar.open('Registration Successful', 'Ok', {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
                panelClass: ['custom-snackbar']
              });
              this.router.navigate(['/login']);
            },
            error: (err) => {
              console.error('Error registering client profile:', err);
              this.snackBar.open('Failed to register client profile. Please try again.', 'OK', {
                duration: 5000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
                panelClass: ['custom-snackbar']
              });
              this.isLoading = false;
            },
            complete: () => {
              this.isLoading = false;
            }
          });
        }
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
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
    if (!this.loginFormGroup.valid) {
      this.snackBar.open('Username and Password are required', 'OK', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['custom-snackbar']
      });
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

        this.snackBar.open('Successfully logged in', 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['custom-snackbar']
        });

        this.router.navigate(['/dashboard']); // Redirect to the dashboard or any desired page
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Invalid login credentials', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['custom-snackbar']
        });
      }
    });
  }
}
