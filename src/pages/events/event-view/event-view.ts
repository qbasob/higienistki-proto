import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController } from 'ionic-angular';
import { SafeUrl } from '@angular/platform-browser';
import { PEvent } from '../../../shared/event.model';
import { EventPopoverPage } from '../event-popover/event-popover';
import { EventEditPage } from '../event-edit/event-edit';
import { OfficeViewPage } from '../../offices/office-view/office-view';
import { OfficeEditPage } from '../../offices/office-edit/office-edit';
import { PersonViewPage } from '../../people/person-view/person-view';
import { PersonViewAcceptPage } from '../../people/person-view-accept/person-view-accept';
import { PersonEditPage } from '../../people/person-edit/person-edit';
import { EventsStore } from '../../../providers/events-store/events-store';
import { PhotoService } from '../../../providers/photo-service/photo-service';

@Component({
  selector: 'page-event-view',
  templateUrl: 'event-view.html'
})
export class EventViewPage {
  public event: PEvent;
  public photosSrc: {
    photoOutside: SafeUrl,
    photoInsideWaiting: SafeUrl,
    photoInsideOffice: SafeUrl
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private eventsStore: EventsStore,
    private photoService: PhotoService
  ) {
    this.event = navParams.get('event');

    //this.loadPhotos();
    this.initPhotos();
  }

  // ładowanie zdjęć na viewDidEnter - po powrocie z edycji oświezy zdjęcia
  ionViewDidEnter() {
    this.loadPhotos();
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

  // obsługa zdjęć

  public initPhotos() {
  // na początek foty to placeholdery
    this.photosSrc = {
      photoOutside: 'assets/imgs/placeholder-image.jpg',
      photoInsideWaiting: 'assets/imgs/placeholder-image.jpg',
      photoInsideOffice: 'assets/imgs/placeholder-image.jpg'
    };
  }

  public loadPhotos() {
    // i bierzemy asynchronicznie foty z PhotoService, jeżeli event ma photoId
    for (let photoKey in this.photosSrc) {
      if (this.event[photoKey]) {
        this.photoService.getPhotoUrl(this.event[photoKey])
          .subscribe((photoUrl) => {
            this.photosSrc[photoKey] = photoUrl;
          });
      }
    }
  };

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
