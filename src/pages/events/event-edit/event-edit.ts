import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController,/*, Loading*/
Platform} from 'ionic-angular';
// import { Observable } from 'rxjs/Observable';
import { PEvent } from '../../../shared/event.model';
import { Office } from '../../../shared/office.model';
import { Person } from '../../../shared/person.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; // FormControl
import { EventsStore } from '../../../providers/events-store/events-store';
import { OfficesStore } from '../../../providers/offices-store/offices-store';
import { PeopleStore } from '../../../providers/people-store/people-store';
import { PhotoService } from '../../../providers/photo-service/photo-service';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/mergeMap';

import { OfficeViewPage } from '../../offices/office-view/office-view';
import { OfficeEditPage } from '../../offices/office-edit/office-edit';
import { PersonViewPage } from '../../people/person-view/person-view';
import { PersonViewAcceptPage } from '../../people/person-view-accept/person-view-accept';
import { PersonEditPage } from '../../people/person-edit/person-edit';
import { SafeUrl } from '@angular/platform-browser';
import { CustomValidators } from '../../../validators/custom-validators';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { File as CFile, FileEntry, IFile } from '@ionic-native/file';

// import { CustomValidators } from '../../../validators/custom-validators';

@Component({
  selector: 'page-event-edit',
  templateUrl: 'event-edit.html'
})
export class EventEditPage {
  public eventForm: FormGroup;
  public event: PEvent;
  private _isAdd: boolean;
  public offices: Array<Office>;
  public people: Array<Person>;
  public filteredPeople: Array<Person>;
  public eventRelations: {
    office?: Office,
    people?: Array<Person>
  };
  public photosSrc: {
    photoOutside: SafeUrl,
    photoInsideWaiting: SafeUrl,
    photoInsideOffice: SafeUrl
  };

  // private _loading: Loading; // jeden wspólny loading, dla ułatwienia
  // private _isLoading: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private eventsStore: EventsStore,
    private officesStore: OfficesStore,
    private peopleStore: PeopleStore,
    private photoService: PhotoService,
    private platform: Platform,
    private camera: Camera,
    private file: CFile
  ) {

    if (navParams.get('event')) {
      this._isAdd = false;
      this.event = <PEvent>navParams.get('event');
    } else {
      this._isAdd = true;
      this.event = { id: null, name: ''};
    }

    this.officesStore.records$.subscribe((offices) => {
      this.offices = offices;
    });
    this.peopleStore.records$.subscribe((people) => {
      this.people = people;
      this.filteredPeople = people;
    });

    this.loadPhotos();
  }

  ngOnInit(): void {
    this.eventForm = this.formBuilder.group({
      id: null,
      // visitDate: [null, Validators.required],
      photoOutside: [null, Validators.required],
      photoInsideWaiting: [null, CustomValidators.requireIfOther('noPhotoInsideWaiting', false)],
      noPhotoInsideWaiting: false,
      noPhotoInsideWaitingWhy: [null, CustomValidators.requireIfOther('noPhotoInsideWaiting', true)],
      photoInsideOffice: [null, CustomValidators.requireIfOther('noPhotoInsideOffice', false)],
      noPhotoInsideOffice: false,
      noPhotoInsideOfficeWhy: [null, CustomValidators.requireIfOther('noPhotoInsideOffice', true)],
      isOfficeNetwork: false,
      networkOfficesCount: [null, CustomValidators.minAndRequireIfOther(1, 'isOfficeNetwork', true)],
      chairsCount: [null, [Validators.required, Validators.min(1)]],
      doctorsCount: [null, [Validators.required, Validators.min(1)]],
      hasOfficeHigienists: false,
      higienistsCount: [null, CustomValidators.minAndRequireIfOther(1, 'hasOfficeHigienists', true)],
      isBuyingSonicare: false,
      doQualify: null,
      additionalInfo: null
    });

    this.eventForm.patchValue(this.event);
    this.eventRelations = {};
    this.eventRelations.people = [];

    if (this.event.office) {
      this.eventRelations.office = Object.assign({}, this.event.office);
    }

    if (this.event.people) {
      this.eventRelations.people = this.event.people.concat();
    }
  }

  save() {
    // po submicie odświeżamy wszystkie walidacje
    for (let i in this.eventForm.controls) {
      this.eventForm.controls[i].updateValueAndValidity();
    }

    if (this.eventForm.valid) {
      let loading = this.loadingCtrl.create({
        content: 'Zapisywanie...'
      });
      loading.present();

      // this.event = this.eventForm.value;
      const eventData = Object.assign(this.event, this.eventForm.value, this.eventRelations);

      if (this._isAdd) {
        this.eventsStore.addRecord(eventData)
          .finally(() => {
            loading.dismiss();
            this.navCtrl.pop();
          })
          .subscribe()
      } else {
        this.eventsStore.editRecord(eventData)
          .finally(() => {
            loading.dismiss();
            this.navCtrl.pop();
          })
          .subscribe()
      }
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
            this.navCtrl.pop();
          }
        }
      ]
    });
    confirm.present();
  }

  // obsługa zdjęć

  public loadPhotos() {
    // na początek foty to placeholdery
    this.photosSrc = {
     photoOutside: 'assets/imgs/placeholder-image.jpg',
     photoInsideWaiting: 'assets/imgs/placeholder-image.jpg',
     photoInsideOffice: 'assets/imgs/placeholder-image.jpg'
    };

    // i bierzemy asynchronicznie foty z PhotoService, jeżeli event ma photoId
    for(let photoKey in this.photosSrc) {
      if (this.event[photoKey]) {
        this.photoService.getPhotoUrl(this.event[photoKey])
          .subscribe((photoUrl) => {
            this.photosSrc[photoKey] = photoUrl;
          });
      }
    }
  };

  public addPhotoClick(element, index) {
    // jeżeli appka
    console.log("PLATFORMS", this.platform.platforms());
    if (this.platform.is('cordova')) {
      this.addPhotoPlugin(index);
    }
    // jeżeli przeglądarka
    else {
      element.click();
    }
  }


  // wymaga pluginów Camera i File
  public addPhotoPlugin(index) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageURL) => {
      this.file.resolveLocalFilesystemUrl(imageURL)
        .then((fileEntry: FileEntry) => {
          console.log("got image file entry: " + fileEntry.fullPath);
          fileEntry.file((fileSelected: any) => {
            this.photoService.addPhoto(fileSelected)
              .mergeMap((photoId) => {
                this.eventForm.patchValue({ [index]: photoId });
                return this.photoService.getPhotoUrl(photoId);
              })
              .subscribe((photoUrl) => {
                this.photosSrc[index] = photoUrl;
              });
          });
        });
    });
  }


  public addPhoto($event, index) {
    const fileSelected: File = $event.target.files[0];
      this.photoService.addPhoto(fileSelected)
        .mergeMap((photoId) => {
          this.eventForm.patchValue({ [index]: photoId });
          return this.photoService.getPhotoUrl(photoId);
        })
        .subscribe((photoUrl) => {
          this.photosSrc[index] = photoUrl;
        });
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

  selectPerson(event, peopleSelect) {
    peopleSelect.value = "";

    if (event.value) {
      this.people.some((person) => {
        if (person.localId === event.value.localId) {
          this.eventRelations.people.push(person);
          return true;
        }
      });

      this.filterSelectPeople();
    }
  }

  removePerson(person: Person) {

    const handler = () => {
      this.eventRelations.people.some((eventPerson, index) => {
        if (eventPerson.localId === person.localId) {
          this.eventRelations.people.splice(index, 1);
          return true;
        }
      });
      this.filterSelectPeople();
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

  private filterSelectPeople() {
    this.filteredPeople = this.people.filter((person) => {
      return this.eventRelations.people.indexOf(person) === -1;
    });
  }

  // private _showLoading() {
  //   if (this._loading && !this._isLoading) {
  //     this._isLoading = true;
  //     this._loading.present();
  //   }
  // }
  // private _hideLoading() {
  //   if (this._loading && this._isLoading) {
  //     this._isLoading = false;
  //     this._loading.dismiss();
  //   }
  // }
}
