import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'page-event-wizard-step-6',
  templateUrl: 'event-wizard-step-6.html'
})
export class EventWizardStep6Page implements OnInit {
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
      doQualify: [null, Validators.required]
    });
  }

  next() {
    if (this.stepForm.valid) {
      this._stepData = Object.assign({}, this.stepForm.value);
      if (this.stepForm.value.doQualify === "yes") {
        this.tabEvents.publish('event-wizard-change-tab', 5, 6, this._stepData);
      } else {
        this.tabEvents.publish('event-wizard-change-tab', 5, 8, this._stepData);
      }
    }
  }

  back() {
    this.tabEvents.publish('event-wizard-change-tab', 5, 4);
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
