import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { SafeUrl } from '@angular/platform-browser';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PhotoService } from '../../../../providers/photo-service/photo-service';


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
    private formBuilder: FormBuilder
  ) {
    this.photosSrc = {
      photoInsideWaiting: 'assets/imgs/placeholder-image.jpg',
      photoInsideOffice: 'assets/imgs/placeholder-image.jpg',
    };
  }

  ngOnInit(): void {
    this.stepForm = this.formBuilder.group({
      photoInsideWaiting: null,
      noPhotoInsideWaiting: false,
      noPhotoInsideWaitingWhy: null,
      photoInsideOffice: null,
      noPhotoInsideOffice: false,
      noPhotoInsideOfficeWhy: null,
    });
  }

  public addPhotoClick(element) {
    element.click();
  }

  public addPhoto($event, index) {
    const fileSelected: File = $event.target.files[0];
    this.photoService.addPhoto(fileSelected)
      .mergeMap((photoId) => {
        this.stepForm.patchValue({ [index]: photoId });
        return this.photoService.getPhotoUrl(photoId);
      })
      .subscribe((photoUrl) => {
        this.photosSrc[index] = photoUrl;
      });
  }

  next() {
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
