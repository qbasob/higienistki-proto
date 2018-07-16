import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Person, Gender } from '../../../shared/person.model';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'page-person-edit',
  templateUrl: 'person-edit.html'
})
export class PersonEditPage {
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
    this.personForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, this.customEmailValidator]],
      phone: '',
      officesNo: '',
      sonicareUser: '',
      sonicareRecom: '',
      wantCodes: '',
      gotStarter: '',
      starterNo: '',
      gotExpositor: '',
      agreeReg: '',
      agreeMark1: '',
      agreeMark2: '',
      agreeMark3: '',
      agreeMark4: '',
      additionalData: ''
    });
    this.personForm.patchValue(this.person);
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

  // fix, walidator emaila powinien przepuszczać puste pole, naprawione w Angularze 6
  private customEmailValidator(control: AbstractControl): ValidationErrors {
    if (!control.value) {
      return null;
    }

    return Validators.email(control);
  }
}
