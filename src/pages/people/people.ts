import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading, Refresher } from 'ionic-angular';
import { Person } from '../../shared/person.model';
import { PersonViewPage } from './person-view/person-view';
import { PersonEditPage } from './person-edit/person-edit';
import { PersonViewAcceptPage } from './person-view-accept/person-view-accept';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/do';
import { PeopleStore } from '../../providers/people-store/people-store';


@Component({
  selector: 'page-people',
  templateUrl: 'people.html'
})
export class PeoplePage {
  protected people: Observable<Array<Person>>;
  protected filter: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private peopleStore: PeopleStore
  ) {
    this.getPeopleOnline();
  }

  // dane

  getPeopleOnline(refresher?: Refresher) {
    let loading: Loading;
    if (!refresher) {
      loading = this.loadingCtrl.create({
        content: 'Ładowanie...'
      });
      loading.present();
    }
    this.people = this.peopleStore.getFilteredPeople(this.filter)
      .do(
        () => {
          console.log("next do");
          this._viewCleanup(refresher, loading);
        },
        () => {
          console.log("err do");
          this._viewCleanup(refresher, loading);
        }
      )
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
          cssClass: 'danger-button'
        }
      ]
    });
    confirm.present();
  }

  doRefresh(refresher) {
    this.getPeopleOnline(refresher);
  }

  // helpery

  private _viewCleanup(refresher: Refresher, loading: Loading) {
    if (refresher) {
      refresher.complete();
    } else {
      loading.dismiss();
    }
  }
}
