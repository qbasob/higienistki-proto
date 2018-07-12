import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import * as faker from 'faker';
import { Office } from '../../../../shared/office.model';

@Component({
  selector: 'page-event-wizard-step-3',
  templateUrl: 'event-wizard-step-3.html'
})
export class EventWizardStep3Page {
  office: Office;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private events: Events
  ) {
    this.office = {
      name: faker.company.companyName(),
      street: faker.address.streetName(),
      buildingNo: faker.random.number(100).toString(),
      localNo: faker.random.number(100).toString(),
      postal: faker.address.zipCode("##-###"),
      city: faker.address.city(),
      county: faker.address.county()
    }
  }

  next() {
    this.events.publish('event-wizard-change-tab', 2, 3);
  }

  back() {
    this.events.publish('event-wizard-change-tab', 2, 1);
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
