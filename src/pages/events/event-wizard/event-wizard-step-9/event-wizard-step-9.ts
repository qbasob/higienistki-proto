import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';

@Component({
  selector: 'page-event-wizard-step-9',
  templateUrl: 'event-wizard-step-9.html'
})
export class EventWizardStep9Page {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private events: Events
  ) { }

  finish() {
    this.appCtrl.getRootNav().pop();
  }

  back() {
    // mógł być przeskok z innej strony, musimy to sprawdzić i ew. wstecz do strony skąd był przeskok
    const fromPage = this.navParams.get('from');
    this.events.publish('event-wizard-change-tab', 8, fromPage);
  }

  anotherPerson() {
    this.events.publish('event-wizard-change-tab', 8, 5);
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
