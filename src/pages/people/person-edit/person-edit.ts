import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Person, Gender } from '../../../shared/person.model';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'page-person-edit',
  templateUrl: 'person-edit.html'
})
export class PersonEditPage implements OnInit {
  public personForm: FormGroup;
  public person: Person;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder
  ) {
    this.person = <Person>navParams.get('person') || { name: '', gender: Gender.Pani };
  }

  ngOnInit(): void {
    this.personForm = this.formBuilder.group({});
  }

  save() {
    if (this.personForm.valid) {
      this.navCtrl.pop();
    }
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
