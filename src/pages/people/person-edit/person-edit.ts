import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Person, Gender } from '../../../shared/person.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PeopleStore } from '../../../providers/people-store/people-store';
import 'rxjs/add/operator/finally';


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
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private peopleStore: PeopleStore
  ) {
    this.person = <Person>navParams.get('person') || { id: null, name: '', gender: Gender.Pani };
  }

  ngOnInit(): void {
    this.personForm = this.formBuilder.group({});
  }

  patchForm(formGroup: FormGroup) {
    this.personForm = formGroup;
  }

  save() {
    if (this.personForm.valid) {
      let loading = this.loadingCtrl.create({
        content: 'Zapisywanie...'
      });
      loading.present();

      this.person = this.personForm.value;
      /*this.peopleService.putPersonOnline(this.person)
        .finally(() => {
          loading.dismiss();
        })
        .subscribe(() => {
          this.popCb(this.person);
          this.navCtrl.pop();
        });*/
      this.peopleStore.editPersonOffline(this.person);
      loading.dismiss();
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
