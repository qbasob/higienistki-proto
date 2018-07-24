import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
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
    let loading: Loading;
    if (!this._isLoading) {
      loading = this.loadingCtrl.create({
        content: 'Ładowanie...'
      });
      this._isLoading = true;
      loading.present();
    }

    this.people$ = this.peopleStore.getFilteredRecords(this.filter)
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

  remove(person) {
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
            this.peopleStore.removeRecord(person)
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

  private _viewCleanup( loading?: Loading) {
    if (loading && this._isLoading) {
      this._isLoading = false;
      loading.dismiss();
    }
  }
}
