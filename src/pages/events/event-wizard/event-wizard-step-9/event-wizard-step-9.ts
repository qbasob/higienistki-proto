import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'page-event-wizard-step-9',
  templateUrl: 'event-wizard-step-9.html'
})
export class EventWizardStep9Page {
  public stepForm: FormGroup;
  private _stepData: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private tabEvents: Events,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.stepForm = this.formBuilder.group({
      additionalInfo: null
    });
  }

  finish() {
    if (this.stepForm.valid) {
      this._stepData = Object.assign({}, this.stepForm.value);
      this.tabEvents.publish('event-wizard-finish-tab', this._stepData);
    }

  }

  back() {
    // mógł być przeskok z innej strony, musimy to sprawdzić i ew. wstecz do strony skąd był przeskok
    const fromPage = this.navParams.get('from');
    this.tabEvents.publish('event-wizard-change-tab', 8, fromPage);
  }

  anotherPerson() {
    this.tabEvents.publish('event-wizard-change-tab', 8, 5);
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

  // ionViewDidEnter(): void {
  //   alert(this.navParams.get('from'));
  // }
}
