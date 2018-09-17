import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events, Platform, LoadingController } from 'ionic-angular';
import { SafeUrl } from '@angular/platform-browser';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PhotoService } from '../../../../providers/photo-service/photo-service';
import { CustomValidators } from '../../../../validators/custom-validators';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Component({
  selector: 'page-event-wizard-step-4',
  templateUrl: 'event-wizard-step-4.html'
})
export class EventWizardStep4Page implements OnInit {
  public photosSrc: {
    photoInsideWaiting: SafeUrl,
    photoInsideOffice: SafeUrl
  };
  public stepForm: FormGroup;
  private _stepData: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private tabEvents: Events,
    private photoService: PhotoService,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    private camera: Camera
  ) {
    this.photosSrc = {
      photoInsideWaiting: 'assets/imgs/placeholder-image.jpg',
      photoInsideOffice: 'assets/imgs/placeholder-image.jpg',
    };
  }

  ngOnInit(): void {
    this.stepForm = this.formBuilder.group({
      photoInsideWaiting: [null, CustomValidators.requireIfOther('noPhotoInsideWaiting', false)],
      noPhotoInsideWaiting: false,
      noPhotoInsideWaitingWhy: [null, CustomValidators.requireIfOther('noPhotoInsideWaiting', true)],
      photoInsideOffice: [null, CustomValidators.requireIfOther('noPhotoInsideOffice', false)],
      noPhotoInsideOffice: false,
      noPhotoInsideOfficeWhy: [null, CustomValidators.requireIfOther('noPhotoInsideOffice', true)],
    });
  }

  public addPhotoClick(element, index) {
    // jeżeli appka
    if (this.platform.is('cordova')) {
      this.addPhotoCordova(index);
    }
    // jeżeli przeglądarka
    else {
      element.click();
    }
  }

  // wymaga pluginów Camera i File
  public addPhotoCordova(index) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    let loading = this.loadingCtrl.create({
      content: 'Przetwarzanie...'
    });
    loading.present();

    this.camera.getPicture(options).then((imageURL) => {
      this.photoService.addPhotoCordova(imageURL)
        .mergeMap((photoId) => {
          this.stepForm.patchValue({ [index]: photoId });
          return this.photoService.getPhotoUrl(photoId);
        })
        .subscribe(
          (photoUrl) => {
            this.photosSrc[index] = photoUrl;
            loading.dismiss();
          }
        );
    });
  }

  public addPhoto($event, index) {
    const fileSelected: File = $event.target.files[0];

    let loading = this.loadingCtrl.create({
      content: 'Przetwarzanie...'
    });
    loading.present();

    this.photoService.addPhoto(fileSelected)
      .mergeMap((photoId) => {
        this.stepForm.patchValue({ [index]: photoId });
        return this.photoService.getPhotoUrl(photoId);
      })
      .subscribe((photoUrl) => {
        this.photosSrc[index] = photoUrl;
        loading.dismiss();
      });
  }

  next() {
    // po submicie odświeżamy wszystkie walidacje
    for (let i in this.stepForm.controls) {
      this.stepForm.controls[i].updateValueAndValidity();
    }

    if (this.stepForm.valid) {
      this._stepData = Object.assign({}, this.stepForm.value);
      this.tabEvents.publish('event-wizard-change-tab', 3, 4, this._stepData);
    }
  }

  back() {
    this.tabEvents.publish('event-wizard-change-tab', 3, 2);
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
