import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Person, Gender } from '../../../shared/person.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PeopleStore } from '../../../providers/people-store/people-store';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/catch';


@Component({
  selector: 'page-person-edit',
  templateUrl: 'person-edit.html'
})
export class PersonEditPage implements OnInit {
  public personForm: FormGroup;
  public person: Person;
  private _isAdd: boolean;
  private _callbackHandler: Function;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private peopleStore: PeopleStore
  ) {
    if (navParams.get('person')) {
      this._isAdd = false;
      this.person = <Person>navParams.get('person');
    } else {
      this._isAdd = true;
      this.person = { id: null, name: '', gender: Gender.Pani };
    }

    if (navParams.get('handler')) {
      this._callbackHandler = navParams.get('handler');
    }
  }

  ngOnInit(): void {
    this.personForm = this.formBuilder.group({});
  }

  patchForm(formGroup: FormGroup) {
    this.personForm = formGroup;
  }

  save() {
    // po submicie odświeżamy wszystkie walidacje
    for (let i in this.personForm.controls) {
      this.personForm.controls[i].updateValueAndValidity();
    }

    if (this.personForm.valid) {
      let loading = this.loadingCtrl.create({
        content: 'Zapisywanie...'
      });
      loading.present();

      // this.person = this.personForm.value;
      const personData = Object.assign(this.person, this.personForm.value);

      if (this._isAdd) {
        this.peopleStore.addRecord(personData)
          .finally(() => {
            loading.dismiss();
            this.navCtrl.pop();
          })
          .subscribe((addedPerson) => {
            if (this._callbackHandler) {
              this._callbackHandler(addedPerson);
            }
          })
      } else {
        this.peopleStore.editRecord(personData)
          .finally(() => {
            loading.dismiss();
            this.navCtrl.pop();
          })
          .subscribe()
      }
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
