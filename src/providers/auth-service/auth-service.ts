import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/shareReplay';
import { User } from '../../shared/user.model';
import * as moment from 'moment';
import * as jwt_decode from 'jwt-decode';
import { ENV } from '@app/env';

/*
  Generated class for the AuthService provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthService {
  private _endpoint: string;

  constructor(public http: HttpClient) {
    this._endpoint = ENV.endpoint;
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this._endpoint}/auth/login`, { email, password })
      .do(res => this.setSession(res))
      .shareReplay();
      // We are calling shareReplay to prevent the receiver of this Observable from accidentally
      // triggering multiple POST requests due to multiple subscriptions
  }

  public refreshToken(): Observable<User> {
    const token = this.getToken();
    return this.http.post<User>(`${this._endpoint}/auth/login`, { token })
      .do(res => this.setSession(res))
      .shareReplay();
  }

  private setSession(authResult) {
    const decoded = jwt_decode(authResult.access_token);
    const expiresAt = moment.unix(decoded.exp).format('x');

    localStorage.setItem('access_token', authResult.access_token);
    localStorage.setItem('expires_at', expiresAt);
  }

  private getExpiration() {
    const expiration = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
  }

  public isLoggedIn(): boolean {
    return localStorage.getItem('access_token') !== null;
  }

  public isTokenExpired(): boolean {
    return !moment().isBefore(this.getExpiration());
  }

  public getToken(): string {
    return localStorage.getItem('access_token');
  }

}
