import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading, Refresher } from 'ionic-angular';
import { Person } from '../../shared/person.model';
import { PersonViewPage } from './person-view/person-view';
import { PersonEditPage } from './person-edit/person-edit';
import { PersonViewAcceptPage } from './person-view-accept/person-view-accept';
import { PeopleService } from '../../providers/people-service/people-service';
import 'rxjs/add/operator/finally';

@Component({
  selector: 'page-people',
  templateUrl: 'people.html'
})
export class PeoplePage {
  protected people: Array<Person>;
  protected filter: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private peopleService: PeopleService
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

    this.peopleService.getPeopleOnline(this.filter)
      .finally(() => {
        if (refresher) {
          refresher.complete();
        } else {
          loading.dismiss();
        }
      })
      .subscribe((people: Array<Person>) => {
        this.people = people;
      })
  }

  updatePerson(updatedPerson: Person) {
    const foundIndex = this.people.findIndex(oldPerson =>oldPerson.id === updatedPerson.id);
    this.people[foundIndex] = updatedPerson;
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
      person,
      cb: this.updatePerson.bind(this)
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
}
