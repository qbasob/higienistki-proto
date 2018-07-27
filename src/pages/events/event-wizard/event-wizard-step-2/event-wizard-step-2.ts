import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { SafeUrl } from '@angular/platform-browser';
import { PhotoService } from '../../../../providers/photo-service/photo-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
    private formBuilder: FormBuilder
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
