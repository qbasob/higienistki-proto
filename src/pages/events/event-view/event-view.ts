import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController } from 'ionic-angular';
import { PEvent } from '../../../shared/event.model';
import { EventPopoverPage } from '../event-popover/event-popover';
import { EventEditPage } from '../event-edit/event-edit';
import { OfficeViewPage } from '../../offices/office-view/office-view';
import { OfficeEditPage } from '../../offices/office-edit/office-edit';
import { PersonViewPage } from '../../people/person-view/person-view';
import { PersonViewAcceptPage } from '../../people/person-view-accept/person-view-accept';
import { PersonEditPage } from '../../people/person-edit/person-edit';
import { EventsStore } from '../../../providers/events-store/events-store';

@Component({
  selector: 'page-event-view',
  templateUrl: 'event-view.html'
})
export class EventViewPage {
  public event: PEvent;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private eventsStore: EventsStore
  ) {
    this.event = navParams.get('event');
  }

  presentPopover(event, pevent: PEvent) {
    const popover = this.popoverCtrl.create(EventPopoverPage, { pevent });
    popover.present({
      ev: event //przekazujemy event, żeby popover wiedział skąd ma się wysunąć
    });
    popover.onDidDismiss((action: string) => {
      switch (action) {
        case 'edit':
          this.edit(this.event);
          break;
        case 'remove':
          this.remove(this.event);
          break;

        default:
          break;
      }
    });
  }

  // skopiowane z events.ts, pomyśleć nad sposobem DRY
  edit(event) {
    this.navCtrl.push(EventEditPage, {
      event
    });
  }
  // skopiowane z events.ts, pomyśleć nad sposobem DRY
  remove(event) {
    const confirm = this.alertCtrl.create({
      title: 'Usuwanie wizyty',
      message: `Czy na pewno usunąć wizytę ${event.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button',
          handler: () => {
            this.eventsStore.removeRecord(event)
              .finally(() => {
                this.navCtrl.popToRoot();
              })
              .subscribe();
          }
        }
      ]
    });
    confirm.present();
  }

  // opcje gabinetu
  detailsOffice(office) {
    this.navCtrl.push(OfficeViewPage, {
      office
    });
  }

  editOffice(office) {
    this.navCtrl.push(OfficeEditPage, {
      office
    });
  }

  removeOffice(office) {
    const confirm = this.alertCtrl.create({
      title: 'Usuwanie gabinetu',
      message: `Czy na pewno usunąć gabinet ${office.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button'
        }
      ]
    });
    confirm.present();
  }

  // opcje uczestnika
  detailsPerson(person) {
    this.navCtrl.push(PersonViewPage, {
      person
    });
  }

  acceptPerson(person) {
    this.navCtrl.push(PersonViewAcceptPage, {
      person
    });
  }

  editPerson(person) {
    this.navCtrl.push(PersonEditPage, {
      person
    });
  }

  removePerson(person) {
    const confirm = this.alertCtrl.create({
      title: 'Usuwanie uczestnika',
      message: `Czy na pewno usunąć uczestnika ${person.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button'
        }
      ]
    });
    confirm.present();
  }
}
