import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { PEvent } from '../../../shared/event.model';
import { OfficeViewPage } from '../../offices/office-view/office-view';
import { OfficeEditPage } from '../../offices/office-edit/office-edit';
import { PersonViewPage } from '../../people/person-view/person-view';
import { PersonViewAcceptPage } from '../../people/person-view-accept/person-view-accept';
import { PersonEditPage } from '../../people/person-edit/person-edit';

@Component({
  selector: 'page-event-edit',
  templateUrl: 'event-edit.html'
})
export class EventEditPage {
  public event: PEvent;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController
  ) {
    this.event = navParams.get('event');
  }

  save() {
    this.navCtrl.pop();
  }

  cancel() {
    const confirm = this.alertCtrl.create({
      title: 'Zmiany nie zostały zapisane',
      message: 'Czy na pewno wyjść z edycji wizyty bez zapisywania zmian?',
      buttons: [
        {
          text: 'Nie',
        },
        {
          text: 'Tak',
          cssClass: 'danger-button',
          handler: () => {
            this.navCtrl.pop();
          }
        }
      ]
    });
    confirm.present();
  }

  // opcje gabinetu
  detailsOffice(office) {
    this.navCtrl.push(OfficeViewPage, {
      office
    });
  }

  editOffice(office) {
    this.navCtrl.push(OfficeEditPage, {
      office
    });
  }

  removeOffice(office) {
    const confirm = this.alertCtrl.create({
      title: 'Usuwanie gabinetu',
      message: `Czy na pewno usunąć gabinet ${office.name}?`,
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

  // opcje uczestnika
  detailsPerson(person) {
    this.navCtrl.push(PersonViewPage, {
      person
    });
  }

  acceptPerson(person) {
    this.navCtrl.push(PersonViewAcceptPage, {
      person
    });
  }

  editPerson(person) {
    this.navCtrl.push(PersonEditPage, {
      person
    });
  }

  removePerson(person) {
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
}
