import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';

@Component({
  selector: 'page-event-wizard-step-4',
  templateUrl: 'event-wizard-step-4.html'
})
export class EventWizardStep4Page {
  noPhoto1: boolean;
  noPhoto2: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private events: Events
  ) { }

  next() {
    this.events.publish('event-wizard-change-tab', 3, 4);
  }

  back() {
    this.events.publish('event-wizard-change-tab', 3, 2);
  }

  cancel() {
    const confirm = this.alertCtrl.create({
      title: 'Zmiany nie zostały zapisane',
      message: 'Czy na pewno wyjść z tworzenia wizyty bez zapisywania zmian?',
      buttons: [
        {
          text: 'Nie',
        },
        {
          text: 'Tak',
          cssClass: 'danger-button',
          handler: () => {
            this.appCtrl.getRootNav().pop();
          }
        }
      ]
    });
    confirm.present();
  }
}
