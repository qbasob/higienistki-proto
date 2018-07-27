import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import * as faker from 'faker';
import { Office } from '../../../../shared/office.model';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'page-event-wizard-step-3',
  templateUrl: 'event-wizard-step-3.html'
})
export class EventWizardStep3Page implements OnInit {
  office: Office;
  public stepForm: FormGroup;
  private _stepData: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private tabEvents: Events,
    private formBuilder: FormBuilder
  ) {
    if (this.navParams.get('office')) {
      this.office = this.navParams.get('office');
    } else {
      this.office = { id: null, name: '' };
    }
  }

  ngOnInit(): void {
    this.stepForm = this.formBuilder.group({});
    this.stepForm.patchValue(this.office);
  }

  patchForm(formGroup: FormGroup) {
    this.stepForm = formGroup;
  }

  showHelp(fieldName: string) {
    const helps = {
      name: {
        title: 'Nazwa',
        helpText: 'Nazwa pod jaką występuje gabinet, szyld gabinetu'
      }
    }

    const alert = this.alertCtrl.create({
      title: "Pole: " + helps[fieldName].title,
      subTitle: helps[fieldName].helpText,
      buttons: ['OK']
    });
    alert.present();
  }

  next() {
    if (this.stepForm.valid) {
      this._stepData = Object.assign({}, this.office, this.stepForm.value);
      this.tabEvents.publish('event-wizard-change-tab', 2, 3, { office: this._stepData });
    }
  }

  back() {
    this.tabEvents.publish('event-wizard-change-tab', 2, 1);
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
