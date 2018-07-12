import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';

@Component({
  selector: 'page-event-wizard-step-5',
  templateUrl: 'event-wizard-step-5.html'
})
export class EventWizardStep5Page {
  isOfficeNetwork: boolean;
  hasOfficeHigienists: boolean;
  isBuyingSonicare: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private events: Events
  ) {
  }

  next() {
    if (this.isBuyingSonicare === "yes") {
      this.events.publish('event-wizard-change-tab', 4, 5);
    } else {
      const confirm = this.alertCtrl.create({
        title: 'Gabinet nie bierze udziału w akcji',
        message: 'Aby gabinet brał udział w akcji higienistki/higieńiści muszą kupować produkty Sonicare na własny użytek',
        buttons: [
          {
            text: 'Zmień',
          },
          {
            text: 'Zakończ wizytę',
            cssClass: 'danger-button',
            handler: () => {
              this.events.publish('event-wizard-change-tab', 4, 8);
            }
          }
        ]
      });
      confirm.present();
    }
  }

  back() {
    this.events.publish('event-wizard-change-tab', 4, 3);
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
