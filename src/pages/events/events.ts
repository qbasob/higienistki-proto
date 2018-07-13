import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import * as faker from 'faker';
import { PEvent } from '../../shared/event.model';
import { EventWizardPage } from './event-wizard/event-wizard';
import { Gender } from '../../shared/person.model';
import { EventViewPage } from './event-view/event-view';
import { EventEditPage } from './event-edit/event-edit';


@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage {
  events: Array<PEvent>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController
  ) {
    this.events = [];
    for (let i = 1; i < 11; i++) {
      let randomPeople = [];
      for (let i = 1; i <= 4; i++) {
        randomPeople.push({
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
          additionalData: faker.random.words(20)
        });
      }

      this.events.push({
        name: faker.company.companyName(),
        date: faker.date.recent(),
        photoOutside: null,
        photoInsideWaiting: null,
        noPhotoInsideWaiting: faker.random.boolean(),
        noPhotoInsideWaitingWhy: faker.random.words(5),
        photoInsideOffice: null,
        noPhotoInsideOffice: faker.random.boolean(),
        noPhotoInsideOfficeWhy: faker.random.words(5),
        isOfficeNetwork: faker.random.boolean(),
        networkOfficesCount: faker.random.number(10),
        chairsCount: faker.random.number(10),
        doctorsCount: faker.random.number(10),
        hasOfficeHigienists: faker.random.boolean(),
        higienistsCount: faker.random.number(10),
        isBuyingSonicare: faker.random.arrayElement(['no', 'yes', 'yes_sell']),
        doQualify: faker.random.arrayElement(['no', 'no_deny', 'yes']),

        office: {
          name: faker.company.companyName(),
          street: faker.address.streetName(),
          buildingNo: faker.random.number(100).toString(),
          localNo: faker.random.number(100).toString(),
          postal: faker.address.zipCode("##-###"),
          city: faker.address.city(),
          county: faker.address.county()
        },

        people: randomPeople
      });
    }
  }

  details(event) {
    this.navCtrl.push(EventViewPage, {
      event
    });
  }

  add(event) {
    this.navCtrl.push(EventWizardPage, {
      event
    });
  }

  edit(event) {
    this.navCtrl.push(EventEditPage, {
      event
    });
  }

  remove(event) {
    const confirm = this.alertCtrl.create({
      title: 'Usuwanie wizyty',
      message: `Czy na pewno usunąć wizytę ${event.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button'
        }
      ]
    });
    confirm.present();
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

}
