import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AbstractStore } from '../abstract-store/abstract-store';
import { PEvent } from '../../shared/event.model';
import { Office } from '../../shared/office.model';
import { OfficesStore } from '../offices-store/offices-store';

/**
 * Observable Data Service, "EventsStore"
 * zmiana danych emituje zmianę na wszystkich zasukbskrybowanych komponentach;
 *
 * ten store jest bardziej skomplikowany od People i Offices, ma relacje itp.
 * więc tu będą rózne dodatkowe metody i nadpisane metody AbstractStore
 *
 * musi nasłuchiwać zmian gabinetów i uczestników
 *
 */

@Injectable()
export class EventsStore extends AbstractStore<PEvent> {
  private office$: Observable<Office>;
  private offices$: Observable<Array<Office>>;

  constructor(
    public http: HttpClient,
    public storage: Storage,
    public officesStore: OfficesStore
  ) {
    super('events', http, storage);

    this.office$ = this.officesStore.record$;
    this.offices$ = this.officesStore.serverRecords$;

    this.office$
      // za każdym razem kiedy dodany/edytowany/usunięty office
      // musimy zaktualizować rekord wewnątrz eventu
      .subscribe((office) => {
        this.updateEventsOffice(office);
      })

    this.offices$
      // za każdym razem kiedy przychodzą z serwera office
      .subscribe((offices) => {

      })
  }

  // overwrite

  /**
   * @override
   */
  public getFilteredRecords(filter: string): Observable<Array<PEvent>> {
    return this.records$
      .map((records) => {
        if (filter) {
          return records.filter(record => {
            return record.office.name.toLowerCase().includes(filter.toLowerCase());
          })
        } else {
          return records;
        }
      });
  }

  /**
   * @override
   * ładuje wszystkie rekordy z serwera
   */

  protected _getAllFromServer(): Observable<Array<PEvent>> {
    if (this._dataStore) {
      const doNeedSync = this._dataStore.filter(record => record.needSync);
      if (doNeedSync.length > 0) {
        return Observable.throw("Nie można pobrać danych z serwera, dopóki istnieją lokalne dane niezsynchronizowane z serwerem.");
      }
    }
    return this.http.get<Array<PEvent>>(this._apiUrl + this._apiSuffix)
      // dane pobierane z serwera mogą nie mieć localId (np. jeżeli nigdy nie były edytowane lokalnie)
      // w takiej sytuacji musimy go przypisać
      .map((serverRecords: PEvent[]) => {
        serverRecords.forEach((serverRecord) => {
          if (!serverRecord.localId) {
            // serverRecord.localId = this._generateObjectId();
            serverRecord.localId = 'FirstCreatedOnServ_' + serverRecord.id;
          }

          // jeżeli office eventu nie ma localId to generujemy z serwerowego
          if (serverRecord.office && !serverRecord.office.localId) {
            serverRecord.office.localId = 'FirstCreatedOnServ_' + serverRecord.office.id;
          }

          if (serverRecord.people) {
            serverRecord.people.map((serverPerson) => {
              if (!serverPerson.localId) {
                serverPerson.localId = 'FirstCreatedOnServ_' + serverPerson.id;
              }
            })
          }
        });
        return serverRecords;
      })
  }

  // nowe metody

  updateEventsOffice(office: Office) {
    let changedEvent: PEvent;
    this._dataStore.forEach((arrayRecord, index) => {
      // szukamy po lokalnym id i aktualizujemy
      if (arrayRecord.office && arrayRecord.office.localId === office.localId) {
        this._dataStore[index].office = office;
        changedEvent = this._dataStore[index];
      }
    });

    // zapisujemy zmianę (wyemituje zmianę)
    if (changedEvent) {
      console.log("changedEvent", changedEvent);
      this.editRecord(changedEvent).subscribe();
    }
  }

}
