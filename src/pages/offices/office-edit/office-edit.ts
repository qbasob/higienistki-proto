import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController  } from 'ionic-angular';
import { Office } from '../../../shared/office.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OfficesStore } from '../../../providers/offices-store/offices-store';
import 'rxjs/add/operator/finally';

@Component({
  selector: 'page-office-edit',
  templateUrl: 'office-edit.html'
})
export class OfficeEditPage implements OnInit {
  public officeForm: FormGroup;
  public office: Office;
  private _isAdd: boolean;
  private _callbackHandler: Function;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private officesStore: OfficesStore
  ) {
    if (navParams.get('office')) {
      this._isAdd = false;
      this.office = <Office>navParams.get('office');
    } else {
      this._isAdd = true;
      this.office = { id: null, name: '' };
    }

    if (navParams.get('handler')) {
      this._callbackHandler = navParams.get('handler');
    }
  }

  ngOnInit(): void {
    this.officeForm = this.formBuilder.group({});
  }

  patchForm(formGroup: FormGroup) {
    this.officeForm = formGroup;
  }

  save() {
    if (this.officeForm.valid) {
      let loading = this.loadingCtrl.create({
        content: 'Zapisywanie...'
      });
      loading.present();

      const officeData = Object.assign(this.office, this.officeForm.value);

      if (this._isAdd) {
        this.officesStore.addRecord(officeData)
          .finally(() => {
            loading.dismiss();
            this.navCtrl.pop();
          })
          .subscribe((addedOffice) => {
            if (this._callbackHandler) {
              this._callbackHandler(addedOffice);
            }
          })
      } else {
        this.officesStore.editRecord(officeData)
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
      message: 'Czy na pewno wyjść z edycji gabinetu bez zapisywania zmian?',
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
}
