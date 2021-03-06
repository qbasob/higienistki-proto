import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service/auth-service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { ENV } from '@app/env';
import { EventsPage } from '../events/events';

import { PeopleStore } from '../../providers/people-store/people-store';
import { OfficesStore } from '../../providers/offices-store/offices-store';
import { EventsStore } from '../../providers/events-store/events-store';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  public isLoggedIn: boolean;
  private form: FormGroup;
  protected envMode: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastCtrl: ToastController,
    private peopleStore: PeopleStore,
    private officesStore: OfficesStore,
    private eventsStore: EventsStore,
  ) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.isLoggedIn = this.authService.isLoggedIn();
    this.envMode = ENV.mode;
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad LoginPage', ENV);

    if (this.isLoggedIn) {
      this.navCtrl.setRoot(EventsPage)
    }
  }

  login() {
    const val = this.form.value;

    this.authService.login(val.email, val.password)
      .subscribe(
        _data => {
          this.navCtrl.setRoot(EventsPage);

          // po zalogowaniu pobieramy dane z serwera
          this.peopleStore.refreshRecords()
            .subscribe();
          this.officesStore.refreshRecords()
            .subscribe();
          this.eventsStore.refreshRecords()
            .subscribe();
        },
        // jeśli złe dane, pokazujemy toast
        error => {
          // console.log("er", error);
          const toast = this.toastCtrl.create({
            message: (error.error && error.error.message) || error.message,
            duration: 3000,
            cssClass: `toast-warning`
          });
          toast.present();
        }
      );

  }
}
