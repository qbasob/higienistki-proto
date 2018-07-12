import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Person, Gender } from '../../../shared/person.model';

@Component({
  selector: 'page-person-edit',
  templateUrl: 'person-edit.html'
})
export class PersonEditPage {
  public person: Person;
  public Gender = Gender; // do używania w template

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController
  ) {
    this.person = <Person>navParams.get('person') || { name: '', gender: Gender.Pani };
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
