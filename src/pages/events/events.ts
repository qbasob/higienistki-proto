import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import * as faker from 'faker';
import { PEvent } from '../../shared/event.model';
import { EventWizardPage } from './event-wizard/event-wizard';


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
      this.events.push({
        name: faker.company.companyName(),
        date: faker.date.recent()
      });
    }
  }

  details(event) {
    // this.navCtrl.push(EventViewPage, {
    //   event
    // });
  }

  add(event) {
    this.navCtrl.push(EventWizardPage, {
      event
    });
  }

  edit(event) {
    // this.navCtrl.push(EventEditPage, {
    //   event
    // });
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
