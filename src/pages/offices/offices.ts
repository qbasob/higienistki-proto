import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { OfficeViewPage } from './office-view/office-view';
import { Office } from '../../shared/office.model';
import { OfficeEditPage } from './office-edit/office-edit';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { OfficesStore } from '../../providers/offices-store/offices-store';

@Component({
  selector: 'page-offices',
  templateUrl: 'offices.html'
})
export class OfficesPage {
  offices$: Observable<Array<Office>>;
  public filter: string;
  private _isLoading: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private officesStore: OfficesStore
  ) {
    this.populateOffices();
  }

  // dane

  populateOffices(): void {
    let loading: Loading;
    if (!this._isLoading) {
      loading = this.loadingCtrl.create({
        content: 'Ładowanie...'
      });
      this._isLoading = true;
      loading.present();
    }

    this.offices$ = this.officesStore.getFilteredRecords(this.filter)
      .do(
        () => {
          this._viewCleanup(loading);
        },
        () => {
          this._viewCleanup(loading);
        }
      );
  }

  // nawigacja

  details(office) {
    this.navCtrl.push(OfficeViewPage, {
      office
    });
  }

  edit(office) {
    this.navCtrl.push(OfficeEditPage, {
      office
    });
  }

  remove(office) {
    const confirm = this.alertCtrl.create({
      title: 'Usuwanie gabinet',
      message: `Czy na pewno usunąć gabinet ${office.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button',
          handler: () => {
            this.officesStore.removeRecord(office)
              .subscribe();
          }
        }
      ]
    });
    confirm.present();
  }

  doRefresh(refresher) {
    this.officesStore.refreshRecords()
      .finally(
        () => {
          refresher.complete();
        }
      )
      .subscribe();
  }

  // helpery

  private _viewCleanup(loading?: Loading) {
    if (loading && this._isLoading) {
      this._isLoading = false;
      loading.dismiss();
    }
  }
}
