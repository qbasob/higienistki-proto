import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Events } from 'ionic-angular';
// import Rollbar from 'rollbar';

/*
  Generated class for the AppErrorHandler provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppErrorHandler implements ErrorHandler {

  constructor(
    private events: Events,
    private toastCtrl: ToastController
    // private rollbar: Rollbar,
  ) {}

  handleError(error: Error | HttpErrorResponse) {
    // Server error happened
    if (error instanceof HttpErrorResponse) {
      if (!navigator.onLine) {
        // No Internet connection
        const toast = this.toastCtrl.create({
          message: 'No Internet Connection',
          duration: 3000,
          cssClass: `toast-warning`
        });
        toast.present();
        return;
      }
      // Send the error to the server
      // this.rollbar.error(error);
      // Show notification to the user
      console.error('AppErrorHandler', error);
      if (error.status === 401) {
        // token umarł, przekeirowanie na logowanie
        return this.events.publish('TOKEN_ERROR', error);
      }
      const toast = this.toastCtrl.create({
        message: 'Błąd serwera: ' + ((error.error && error.error.message) || error.message),
        duration: 3000,
        cssClass: `toast-warning`
      });
      toast.present();
    }
    // Client Error Happend
    else {
      // Send the error to the server and then
      // this.rollbar.error(error);
      // and then publish error:
      console.error('AppErrorHandler', error);
      const toast = this.toastCtrl.create({
        message: error.message,
        duration: 3000,
        cssClass: `toast-warning`
      });
      toast.present();
      return this.events.publish('UNHANDLED_ERROR', error);
    }
  }

  // TODO:
  // łapanie wyjątków ionic routera (NavControllera)

}
