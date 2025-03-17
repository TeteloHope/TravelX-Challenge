import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, map, BehaviorSubject } from 'rxjs';
import { User } from './models/user';
import { Client } from './models/client';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private httpClient = inject(HttpClient);
  apiUrl = 'http://localhost:7142/api/auth/'; // My API URL

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  //constructor(private httpClient: HttpClient) { }

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
    return this.httpClient.post<any>(`${this.apiUrl}register`, user, this.httpOptions);
  }

  registerCustomer(client: Client, user: User): Observable<Client> {
    const userViewModel = {
      emailaddress: client.email_Address,
      password: user.password // Set the password to an empty string
    };
    const customerViewModel = {
      First_Name: client.first_Name,
      Last_Name: client.last_Name,
      ID_Number: client.id_Number,
      Email_Address: client.email_Address,
      Phone_Number: client.phone_Number
    };
  
    const params = new HttpParams()
      .set('First_Name', client.first_Name)
      .set('Last_Name', client.last_Name)
      .set('Date_of_Birth', client.id_Number)
      .set('Email_Address', client.email_Address)
      .set('Phone_Number', client.phone_Number);
  
    return this.httpClient.post<Client>(`${this.apiUrl}Authentication/RegisterClient`, userViewModel, { params });
  }

  // Login a user
  login(user: User): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}login`, user, this.httpOptions);
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
