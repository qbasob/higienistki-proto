import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events, Platform, LoadingController } from 'ionic-angular';
import { SafeUrl } from '@angular/platform-browser';
import { PhotoService } from '../../../../providers/photo-service/photo-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Component({
  selector: 'page-event-wizard-step-2',
  templateUrl: 'event-wizard-step-2.html'
})
export class EventWizardStep2Page implements OnInit {
  public photosSrc: {
    photoOutside: SafeUrl,
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
      photoOutside: 'assets/imgs/placeholder-image.jpg',
    };
  }

  ngOnInit(): void {
    this.stepForm = this.formBuilder.group({
      photoOutside: [null, Validators.required]
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
    if (this.stepForm.valid) {
      this._stepData = Object.assign({}, this.stepForm.value);
      this.tabEvents.publish('event-wizard-change-tab', 1, 2, this._stepData);
    }
  }

  back() {
    this.tabEvents.publish('event-wizard-change-tab', 1, 0);
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
