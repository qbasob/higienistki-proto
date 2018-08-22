import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading, ItemSliding, FabContainer } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { PEvent } from '../../shared/event.model';
import { EventWizardPage } from './event-wizard/event-wizard';
import { EventViewPage } from './event-view/event-view';
import { EventEditPage } from './event-edit/event-edit';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { EventsStore } from '../../providers/events-store/events-store';
import * as moment from 'moment';

@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage {
  public events$: Observable<Array<PEvent>>;
  public filter: string;
  public noname: string;
  public targetVal: number;
  private _loading: Loading; // jeden wspólny loading, dla ułatwienia
  private _isLoading: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private eventsStore: EventsStore,
    private storage: Storage
  ) {
    this.targetVal = 0;
    this.populateEvents();
    this.noname = '<brak gabinetu>';

    this.storage.get('hasSeenTutorial')
    .then((hasSeenTutorial) => {
      if (!hasSeenTutorial) {
        this.navCtrl.setRoot('WelcomeSlidesPage')
      }
    });
  }

  // dane

  populateEvents(): void {
    this._loading = this.loadingCtrl.create({
      content: 'Ładowanie...'
    });
    this._showLoading();

    this.events$ = this.eventsStore.getFilteredRecords(this.filter)
      .do(
        (events: Array<PEvent>) => {
          this.calculateTargetVal(events);
          this._hideLoading();
        },
        () => {
          this._hideLoading();
        }
      );
  }

  // nawigacja

  details(event) {
    this.navCtrl.push(EventViewPage, {
      event
    });
  }

  wizard(fab: FabContainer) {
    this.navCtrl.push(EventWizardPage);
    fab.close();
  }

  add(fab: FabContainer) {
    this.navCtrl.push(EventEditPage);
    fab.close();
  }

  edit(event) {
    this.navCtrl.push(EventEditPage, {
      event
    });
  }

  remove(event: PEvent, slidingItem: ItemSliding) {
    this._loading = this.loadingCtrl.create({
      content: 'Usuwanie...'
    });

    const confirm = this.alertCtrl.create({
      title: 'Usuwanie wizyty',
      message: `Czy na pewno usunąć wizytę  ${event.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button',
          handler: () => {
            this._showLoading();
            this.eventsStore.removeRecord(event)
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
    this.eventsStore.refreshRecords()
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

  private calculateTargetVal(events: Array<PEvent>) {
    const thisMonthEvents = events.filter((event) => {
      return moment(event.visitDate).isSame(moment.now(), 'month');
    });
    this.targetVal = thisMonthEvents.length / 50 * 100;
  }

}
