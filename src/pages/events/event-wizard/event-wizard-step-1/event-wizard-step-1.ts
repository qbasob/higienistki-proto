import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import * as faker from 'faker';

@Component({
  selector: 'page-event-wizard-step-1',
  templateUrl: 'event-wizard-step-1.html'
})
export class EventWizardStep1Page {
  cities: string[];
  offices: string[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private events: Events
  ) {
    this.cities = [];
    for (let i = 1; i < 11; i++) {
      this.cities.push(
        faker.address.city()
      );
    }

    this.offices = [];
    for (let i = 1; i < 11; i++) {
      this.offices.push(
        faker.company.companyName()
      );
    }
  }

  next() {
    this.events.publish('event-wizard-change-tab', 0, 1);
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
