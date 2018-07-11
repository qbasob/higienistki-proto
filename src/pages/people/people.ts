import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Person, Gender } from '../../shared/person.model';
import * as faker from 'faker';
import { PersonViewPage } from './person-view/person-view';
import { PersonEditPage } from './person-edit/person-edit';
import { PersonViewAcceptPage } from './person-view-accept/person-view-accept';

@Component({
  selector: 'page-people',
  templateUrl: 'people.html'
})
export class PeoplePage {
  public people: Array<Person>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController
  ) {
    this.people = [];
    for (let i = 1; i < 11; i++) {
      this.people.push({
        name: faker.name.firstName() + " " + faker.name.lastName(),
        gender: faker.random.arrayElement([Gender.Pani, Gender.Pan]),
        email: faker.internet.email(),
        phone: faker.phone.phoneNumber(),
        officesNo: faker.random.number(5),
        sonicareUser: faker.random.boolean(),
        sonicareRecom: faker.random.boolean(),
        wantCodes: faker.random.boolean(),
        gotStarter: faker.random.boolean(),
        starterNo: faker.random.number({min: 10000, max: 99999}).toString(),
        gotExpositor: faker.random.boolean(),
        agreeReg: true,
        agreeMark1: faker.random.boolean(),
        agreeMark2: faker.random.boolean(),
        agreeMark3: faker.random.boolean(),
        agreeMark4: faker.random.boolean(),
        additionalData: faker.random.words(20)
      });
    }
  }

  details(person) {
    this.navCtrl.push(PersonViewPage, {
      person
    });
  }

  accept(person) {
    this.navCtrl.push(PersonViewAcceptPage, {
      person
    });
  }

  edit(person) {
    this.navCtrl.push(PersonEditPage, {
      person
    });
  }

  remove(person) {
    const confirm = this.alertCtrl.create({
      title: 'Usuwanie uczestnika',
      message: `Czy na pewno usunąć uczestnika ${person.name}?`,
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
