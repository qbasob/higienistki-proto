import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Person } from '../../../shared/person.model';

@Component({
  selector: 'page-person-view-accept',
  templateUrl: 'person-view-accept.html'
})
export class PersonViewAcceptPage {
  public person: Person;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController
  ) {
    this.person = navParams.get('person');
  }

  save() {
    this.navCtrl.pop();
  }

  cancel() {
    const confirm = this.alertCtrl.create({
      title: 'Zmiany nie zostały zapisane',
      message: 'Czy na pewno wyjść z edycji uczestnika bez zapisywania zmian?',
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
}
