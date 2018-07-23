import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { Person, Gender } from '../../../../shared/person.model';
import * as faker from 'faker';

@Component({
  selector: 'page-event-wizard-step-8',
  templateUrl: 'event-wizard-step-8.html'
})
export class EventWizardStep8Page {
  public person: Person;
  public Gender = Gender; // do używania w template

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private events: Events
  ) {
    this.person = {
      id: null,
      name: faker.name.firstName() + " " + faker.name.lastName(),
      gender: faker.random.arrayElement([Gender.Pani, Gender.Pan]),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber(),
      officesNo: faker.random.number(5),
      sonicareUser: faker.random.boolean(),
      sonicareRecom: faker.random.boolean(),
      wantCodes: faker.random.boolean(),
      gotStarter: faker.random.boolean(),
      starterNo: faker.random.number({ min: 10000, max: 99999 }).toString(),
      gotExpositor: faker.random.boolean(),
      agreeReg: true,
      agreeMark1: faker.random.boolean(),
      agreeMark2: faker.random.boolean(),
      agreeMark3: faker.random.boolean(),
      agreeMark4: faker.random.boolean(),
      additionalData: faker.random.words(20),
      needSync: false
    }
  }

  next() {
    this.events.publish('event-wizard-change-tab', 7, 8);
  }

  back() {
    this.events.publish('event-wizard-change-tab', 7, 6);
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
