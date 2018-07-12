import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';

@Component({
  selector: 'page-event-wizard-step-6',
  templateUrl: 'event-wizard-step-6.html'
})
export class EventWizardStep6Page {
  doQualify: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private events: Events
  ) {
  }

  next() {
    if (this.doQualify === "yes") {
      this.events.publish('event-wizard-change-tab', 5, 6);
    } else {
      this.events.publish('event-wizard-change-tab', 5, 8);
    }
  }

  back() {
    this.events.publish('event-wizard-change-tab', 5, 4);
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
