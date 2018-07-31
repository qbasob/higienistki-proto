import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'page-event-wizard-step-5',
  templateUrl: 'event-wizard-step-5.html'
})
export class EventWizardStep5Page implements OnInit {
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
      isOfficeNetwork: false,
      networkOfficesCount: null,
      chairsCount: null,
      doctorsCount: null,
      hasOfficeHigienists: false,
      higienistsCount: null,
      isBuyingSonicare: false
    });
  }

  next() {
    if (this.stepForm.valid) {
      this._stepData = Object.assign({}, this.stepForm.value);
      if (this.stepForm.value.isBuyingSonicare === "yes") {
        this.tabEvents.publish('event-wizard-change-tab', 4, 5, this._stepData);
      } else {
        const confirm = this.alertCtrl.create({
          title: 'Gabinet nie bierze udziału w akcji',
          message: 'Aby gabinet brał udział w akcji higienistki/higieniści muszą kupować produkty Sonicare na własny użytek',
          buttons: [
            {
              text: 'Zmień',
            },
            {
              text: 'Zakończ wizytę',
              cssClass: 'danger-button',
              handler: () => {
                this.tabEvents.publish('event-wizard-change-tab', 4, 8, this._stepData);
              }
            }
          ]
        });
        confirm.present();
      }
    }
  }

  back() {
    this.tabEvents.publish('event-wizard-change-tab', 4, 3);
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
