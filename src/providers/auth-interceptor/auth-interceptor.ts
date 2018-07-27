import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth-service/auth-service';
import 'rxjs/add/operator/switchMap';

/**
  * AuthInterceptor
  *
  * Przechwytuje wszystkie requesty i jeżeli w localStorage znajduje się sesja,
  * to dokleja header Authorization do requesta
*/
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor (
    private authService: AuthService
  ) {}

  private setHeader(req: HttpRequest<any>): HttpRequest<any> {
    const idToken = this.authService.getToken();
    const cloned = req.clone({
      headers: req.headers.set("Authorization",
        "Bearer " + idToken)
    });
    return cloned;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // console.log("AuthInterceptor, intercept", req);
    // jeżeli niezalogowany puszczamy niezmieniony request
    if (!this.authService.isLoggedIn()) {
      return next.handle(req);
    }

    // jeżeli logowanie, to puszczamy niezmieniony request (pętliło się przy refreshTokenie)
    if (~req.url.indexOf('/auth/login')) {
      return next.handle(req);
    }

    // póki co wyłączone, jeszcze poczytać na ten temat:
    // jeżeli jest token, ale wygasł to refreshujemy
    /*if (this.authService.isTokenExpired()) {
      return this.authService.refreshToken()
        .switchMap(() => {
          const clonedReq = this.setHeader(req);
          return next.handle(clonedReq);
        })
    }*/

    // jeżeli jest token i nie wygasł to dodajemy header Authorization: Bearer
    const clonedReq = this.setHeader(req);
    return next.handle(clonedReq);
  }

}
