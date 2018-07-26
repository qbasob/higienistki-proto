import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { Person, Gender } from '../../../../shared/person.model';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'page-event-wizard-step-7',
  templateUrl: 'event-wizard-step-7.html'
})
export class EventWizardStep7Page {
  public personForm: FormGroup;
  public person: Person;

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
      gender: Gender.Pani,
      needSync: false
    }
  }

  ngOnInit(): void {
    this.personForm = this.formBuilder.group({});
  }

  patchForm(formGroup: FormGroup) {
    this.personForm = formGroup;
  }


  next() {
    this.events.publish('event-wizard-change-tab', 6, 7);
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
