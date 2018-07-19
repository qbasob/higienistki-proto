import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController } from 'ionic-angular';
import { Person } from '../../../shared/person.model';
import { PersonPopoverPage } from '../person-popover/person-popover';
import { PersonEditPage } from '../person-edit/person-edit';
import { PeopleStore } from '../../../providers/people-store/people-store';

@Component({
  selector: 'page-person-view',
  templateUrl: 'person-view.html'
})
export class PersonViewPage {
  public person: Person;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private peopleStore: PeopleStore
  ) {
    this.person = navParams.get('person');
  }

  presentPopover(event, person: Person) {
    const popover = this.popoverCtrl.create(PersonPopoverPage, { person });
    popover.present({
      ev: event //przekazujemy event, żeby popover wiedział skąd ma się wysunąć
    });
    popover.onDidDismiss((action: string) => {
      switch (action) {
        case 'edit':
          this.edit(this.person);
          break;
        case 'remove':
          this.remove(this.person);
          break;

        default:
          break;
      }
    });
  }

  // skopiowane z persons.ts, pomyśleć nad sposobem DRY
  edit(person) {
    this.navCtrl.push(PersonEditPage, {
      person
    });
  }
  // skopiowane z persons.ts, pomyśleć nad sposobem DRY
  remove(person) {
    const confirm = this.alertCtrl.create({
      title: 'Usuwanie uczestnika',
      message: `Czy na pewno usunąć uczestnika ${person.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button',
          handler: () => {
            this.peopleStore.removePersonLocal(person);
            this.navCtrl.popToRoot();
          }
        }
      ]
    });
    confirm.present();
  }
}
