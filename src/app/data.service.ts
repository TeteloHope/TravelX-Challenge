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

  registerCustomer(client: Client, user: User): Observable<Client> {
    const userViewModel = {
      emailaddress: client.email,
      password: user.password // Set the password to an empty string
    };
    const customerViewModel = {
      First_Name: client.name,
      Last_Name: client.surname,
      ID_Number: client.idPassportNumber,
      Email_Address: client.email,
      Phone_Number: client.contact
    };
  
    const params = new HttpParams()
      .set('First_Name', client.name)
      .set('Last_Name', client.surname)
      .set('Date_of_Birth', client.idPassportNumber)
      .set('Email_Address', client.email)
      .set('Phone_Number', client.contact);
  
    return this.httpClient.post<Client>(`${this.apiUrl}register`, userViewModel, { params });
  }

  // Login a user
  login(user: User): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}auth/login`, user, this.httpOptions);
  }

  //Retrieves all clients
  getAllClients(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}Client/GetAllClientss`)
    .pipe(map(result => result));
  }

  getAllClient(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}Client/GetAllClient`)
    .pipe(map(result => result));
  }
}
