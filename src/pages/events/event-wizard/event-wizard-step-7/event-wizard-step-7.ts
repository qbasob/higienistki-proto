import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { Person, Gender } from '../../../../shared/person.model';
import { FormGroup, FormBuilder, NgForm } from '@angular/forms';

@Component({
  selector: 'page-event-wizard-step-7',
  templateUrl: 'event-wizard-step-7.html'
})
export class EventWizardStep7Page {
  public stepForm: FormGroup;
  public needCleanStepForm: boolean;
  public cleanStepFormValue: any;
  private _stepData: any;
  public person: Person;

  @ViewChild('formDir') formDir: NgForm;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    private appCtrl: App,
    private events: Events
  ) {
    this.person = {
      id: null,
      name: '',
      gender: Gender.Pani
    }
    this.needCleanStepForm = true;
  }

  ionViewDidEnter() {
    if (this.navParams.get('person')) {
      this.person = this.navParams.get('person');
      this.stepForm.patchValue(this.person);
    }

    if (this.navParams.get('clear') === true) {
      this.person = {
        id: null,
        name: '',
        gender: Gender.Pani
      }
      this.stepForm.reset();
      this.formDir.resetForm();
      this.stepForm.patchValue(this.person);
      this.stepForm.patchValue(this.cleanStepFormValue);
    }
  }

  ngOnInit(): void {
    this.stepForm = this.formBuilder.group({});
  }

  patchForm(formGroup: FormGroup) {
    this.stepForm = formGroup;
    if (this.needCleanStepForm) {

      this.cleanStepFormValue = Object.assign({}, formGroup.value);
      this.needCleanStepForm = false;
    }
  }


  next() {
    // po submicie odświeżamy wszystkie walidacje
    for (let i in this.stepForm.controls) {
      this.stepForm.controls[i].updateValueAndValidity();
    }

    if (this.stepForm.valid) {
      this._stepData = Object.assign({}, this.person, this.stepForm.value);
      this.events.publish('event-wizard-change-tab', 6, 7, { person: this._stepData });
    }
  }

  back() {
    this.events.publish('event-wizard-change-tab', 6, 5);
  }

  cancel() {
    const confirm = this.alertCtrl.create({
      title: 'Zmiany nie zostały zapisane',
      message: 'Czy na pewno wyjść z tworzenia wizyty bez zapisywania zmian?',
      buttons: [
        {
          text: 'Nie',
        },
        {
          text: 'Tak',
          cssClass: 'danger-button',
          handler: () => {
            this.appCtrl.getRootNav().pop();
          }
        }
      ]
    });
    confirm.present();
  }
}
