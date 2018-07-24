import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading, ItemSliding } from 'ionic-angular';
import { Person } from '../../shared/person.model';
import { PersonViewPage } from './person-view/person-view';
import { PersonEditPage } from './person-edit/person-edit';
import { PersonViewAcceptPage } from './person-view-accept/person-view-accept';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { PeopleStore } from '../../providers/people-store/people-store';


@Component({
  selector: 'page-people',
  templateUrl: 'people.html'
})
export class PeoplePage {
  public people$: Observable<Array<Person>>;
  public filter: string;
  private _loading: Loading; // jeden wspólny loading, dla ułatwienia
  private _isLoading: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private peopleStore: PeopleStore
  ) {
    this.populatePeople();
  }

  // dane

  populatePeople(): void {
    this._loading = this.loadingCtrl.create({
      content: 'Ładowanie...'
    });
    this._showLoading();

    this.people$ = this.peopleStore.getFilteredRecords(this.filter)
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

  details(person) {
    this.navCtrl.push(PersonViewPage, {
      person
    });
  }

  accept(person) {
    this.navCtrl.push(PersonViewAcceptPage, {
      person
    });
  }

  edit(person) {
    this.navCtrl.push(PersonEditPage, {
      person
    });
  }

  remove(person: Person, slidingItem: ItemSliding) {
    this._loading = this.loadingCtrl.create({
      content: 'Usuwanie...'
    });

    const confirm = this.alertCtrl.create({
      title: 'Usuwanie uczestnika',
      message: `Czy na pewno usunąć uczestnika ${person.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button',
          handler: () => {
            this._showLoading();
            this.peopleStore.removeRecord(person)
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
    this.peopleStore.refreshRecords()
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
