import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading, ItemSliding } from 'ionic-angular';
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
  private _loading: Loading; // jeden wspólny loading, dla ułatwienia
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
    this._loading = this.loadingCtrl.create({
      content: 'Ładowanie...'
    });
    this._showLoading();

    this.offices$ = this.officesStore.getFilteredRecords(this.filter)
      .do(
        () => {
          this._hideLoading();
        },
        () => {
          this._hideLoading();
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

  remove(office: Office, slidingItem: ItemSliding) {
    this._loading = this.loadingCtrl.create({
      content: 'Usuwanie...'
    });

    const confirm = this.alertCtrl.create({
      title: 'Usuwanie gabinetu',
      message: `Czy na pewno usunąć gabinet ${office.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button',
          handler: () => {
            this._showLoading();
            this.officesStore.removeRecord(office)
              .do(
                () => {
                  this._hideLoading();
                  slidingItem.close(); // po delete chowamy sliding, bo chowają się akcje, a slider się nie zwęża
                },
                () => {
                  this._hideLoading();
                  slidingItem.close(); // po delete chowamy sliding, bo chowają się akcje, a slider się nie zwęża
                }
              )
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
