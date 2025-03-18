import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from './models/user';
import { Client } from './models/client';
import { map, catchError, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private httpClient = inject(HttpClient);
  apiUrl = 'http://localhost:7142/api/'; // Base API URL

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  private getHttpOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  private logIn = new BehaviorSubject<boolean>(false);

  get isLoggedIn() {
    return this.logIn.asObservable();
  }

  loggedIn() {
    this.logIn.next(true);
  }

  loggedOut() {
    this.logIn.next(false);
  }

  // Register a new user
  registerUser(user: User): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}auth/register`, user, this.httpOptions);
  }

  // Register a new client
  registerCustomer(client: Client, user: User): Observable<any> {
    const requestData = {
      first_Name: client.first_Name,
      last_Name: client.last_Name,
      id_Number: client.id_Number,
      email_Address: client.email_Address,
      phone_Number: client.phone_Number,
      password: user.password
    };

    return this.httpClient.post<any>(`${this.apiUrl}Authentication/RegisterClient`, requestData, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Error during registration:', error);
          return throwError(() => new Error('Failed to register client'));
        })
      );
  }

  // Login a user
  login(user: User): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}auth/login`, user, this.httpOptions);
  }

  // Check if an email is already registered
  checkEmailExists(email: string): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.apiUrl}Authentication/CheckEmail?email=${email}`)
      .pipe(
        catchError(error => {
          console.error('Error checking email:', error);
          return throwError(() => new Error('Failed to check email'));
        })
      );
  }

  // Retrieve all clients
  getAllClients(): Observable<Client[]> {
    return this.httpClient.get<Client[]>(`${this.apiUrl}Client/GetAllClients`)
      .pipe(map(result => result));
  }

  // Retrieve a single client (if applicable)
  getClientById(clientId: number): Observable<Client> {
    return this.httpClient.get<Client>(`${this.apiUrl}Client/GetClient/${clientId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching client:', error);
          return throwError(() => new Error('Failed to retrieve client'));
        })
      );
  }
}
