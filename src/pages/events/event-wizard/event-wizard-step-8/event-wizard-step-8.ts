import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { Person, Gender } from '../../../../shared/person.model';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'page-event-wizard-step-8',
  templateUrl: 'event-wizard-step-8.html'
})
export class EventWizardStep8Page {
  public person: Person;
  public stepForm: FormGroup;
  private _stepData: any;

  public Gender = Gender; // do używania w template

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private tabEvents: Events,
    private formBuilder: FormBuilder
  ) {

    if (this.navParams.get('person')) {
      this.person = this.navParams.get('person');
    } else {
      this.person = { id: null, name: '', gender: Gender.Pani };
    }
  }

  ngOnInit(): void {
    this.stepForm = this.formBuilder.group({
      agreeReg: null,
      agreeMark1: null,
      agreeMark2: null,
      agreeMark3: null,
      agreeMark4: null,
    });
    this.stepForm.patchValue(this.person);
  }

  ionViewDidEnter() {
    console.log("paramperson", this.navParams.get('person'));
    if (this.navParams.get('person')) {
      this.person = this.navParams.get('person');
    } else {
      this.person = { id: null, name: '', gender: Gender.Pani };
    }
    this.stepForm.patchValue(this.person);
  }


  next() {
    if (this.stepForm.valid) {
      this._stepData = Object.assign({}, this.person, this.stepForm.value);
      this.tabEvents.publish('event-wizard-change-tab', 7, 8, { person: this._stepData });
    }
  }

  back() {
    this.tabEvents.publish('event-wizard-change-tab', 7, 6);
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
