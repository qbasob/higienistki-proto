import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
// import { Observable } from 'rxjs/Observable';
import { PEvent } from '../../../shared/event.model';
import { Office } from '../../../shared/office.model';
import { Person } from '../../../shared/person.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventsStore } from '../../../providers/events-store/events-store';
import { OfficesStore } from '../../../providers/offices-store/offices-store';
import { PeopleStore } from '../../../providers/people-store/people-store';
import 'rxjs/add/operator/finally';

import { OfficeViewPage } from '../../offices/office-view/office-view';
import { OfficeEditPage } from '../../offices/office-edit/office-edit';
import { PersonViewPage } from '../../people/person-view/person-view';
import { PersonViewAcceptPage } from '../../people/person-view-accept/person-view-accept';
import { PersonEditPage } from '../../people/person-edit/person-edit';

@Component({
  selector: 'page-event-edit',
  templateUrl: 'event-edit.html'
})
export class EventEditPage {
  public eventForm: FormGroup;
  public event: PEvent;
  public offices: Array<Office>;
  public people: Array<Person>;
  public eventRelations: {
    office?: Office,
    people?: Array<Person>
  };
  private _loading: Loading; // jeden wspólny loading, dla ułatwienia
  private _isLoading: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private eventsStore: EventsStore,
    private officesStore: OfficesStore,
    private peopleStore: PeopleStore
  ) {
    this.event = <PEvent>navParams.get('event');
    this.officesStore.records$.subscribe((offices) => {
      this.offices = offices;
    });
    this.peopleStore.records$.subscribe((people) => {
      this.people = people;
    });
  }

  ngOnInit(): void {
    this.eventForm = this.formBuilder.group({
      id: '',
      date: '',
      photoOutside: '',
      photoInsideWaiting: '',
      noPhotoInsideWaiting: '',
      noPhotoInsideWaitingWhy: '',
      photoInsideOffice: '',
      noPhotoInsideOffice: '',
      noPhotoInsideOfficeWhy: '',
      isOfficeNetwork: '',
      networkOfficesCount: '',
      chairsCount: '',
      doctorsCount: '',
      hasOfficeHigienists: '',
      higienistsCount: '',
      isBuyingSonicare: '',
      doQualify: ''
    });

    this.eventForm.patchValue(this.event);
    this.eventRelations = {};

    if (this.event.office) {
      this.eventRelations.office = Object.assign({}, this.event.office);
    }

    if (this.event.people) {
      this.eventRelations.people = this.event.people.concat();
    }
  }

  save() {
    if (this.eventForm.valid) {
      let loading = this.loadingCtrl.create({
        content: 'Zapisywanie...'
      });
      loading.present();

      // this.event = this.eventForm.value;
      const eventData = Object.assign(this.event, this.eventForm.value, this.eventRelations);

      this.eventsStore.editRecord(eventData)
        .finally(() => {
          loading.dismiss();
          this.navCtrl.popToRoot();
        })
        .subscribe()
    }
  }

  cancel() {
    const confirm = this.alertCtrl.create({
      title: 'Zmiany nie zostały zapisane',
      message: 'Czy na pewno wyjść z edycji wizyty bez zapisywania zmian?',
      buttons: [
        {
          text: 'Nie',
        },
        {
          text: 'Tak',
          cssClass: 'danger-button',
          handler: () => {
            this.navCtrl.popToRoot();
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

  addOffice() {
    const handler = (newOffice: Office) => {
      this.eventRelations.office = newOffice;
    }

    this.navCtrl.push(OfficeEditPage, {
      handler
    });
  }

  selectOffice(officeLocalId) {
    this.offices.some((office) => {
      if (office.localId === officeLocalId) {
        this.eventRelations.office = office;
        return true;
      }
    });
  }

  removeOffice(office) {
    const handler = () => {
      this.eventRelations.office = null;
    }

    const confirm = this.alertCtrl.create({
      title: 'Usuwanie gabinetu z wizyty',
      message: `Czy na pewno usunąć gabinet ${office.name} z tej wizyty?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button',
          handler
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

  addPerson() {
    const handler = (newPerson: Person) => {
      this.eventRelations.people.push(newPerson);
    }

    this.navCtrl.push(PersonEditPage, {
      handler
    });
  }

  selectPerson(personLocalId, peopleSelect) {
    console.log(peopleSelect);
    peopleSelect.value = "";
    this.people.some((person) => {
      if (person.localId === personLocalId) {
        this.eventRelations.people.push(person);
        return true;
      }
    });
  }

  removePerson(person: Person) {

    const handler = () => {
      this.eventRelations.people.some((eventPerson, index) => {
        console.log("some", eventPerson);
        if (eventPerson.localId === person.localId) {
          this.eventRelations.people.splice(index, 1);
          return true;
        }
      });
    }

    const confirm = this.alertCtrl.create({
      title: 'Usuwanie uczestnika z wizyty',
      message: `Czy na pewno usunąć uczestnika ${person.name} z tej wizyty??`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button',
          handler
        }
      ]
    });
    confirm.present();
  }

  // helpery

  private _showLoading() {
    if (this._loading && !this._isLoading) {
      this._isLoading = true;
      this._loading.present();
    }
  }
  private _hideLoading() {
    if (this._loading && this._isLoading) {
      this._isLoading = false;
      this._loading.dismiss();
    }
  }
}
