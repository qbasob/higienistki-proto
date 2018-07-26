import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AbstractStore } from '../abstract-store/abstract-store';
import { PEvent } from '../../shared/event.model';
import { Office } from '../../shared/office.model';
import { Person } from '../../shared/person.model';
import { OfficesStore } from '../offices-store/offices-store';
import { PeopleStore } from '../people-store/people-store';

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

  private person$: Observable<Person>;
  private people$: Observable<Array<Person>>;

  constructor(
    public http: HttpClient,
    public storage: Storage,
    public officesStore: OfficesStore,
    public peopleStore: PeopleStore
  ) {
    super('events', http, storage);

    this.office$ = this.officesStore.record$;
    this.offices$ = this.officesStore.serverRecords$;
    this.office$
      // za każdym razem kiedy dodany/edytowany/usunięty office
      // musimy zaktualizować rekord wewnątrz eventu
      .subscribe((office) => {
        this._updateEventsOffice(office);
      })
    this.offices$
      // za każdym razem kiedy przychodzą z serwera office
      // musimy polecieć po wszystkich, jeżeli ich serverLastEditedDate jest większy niż aktualny, to update
      .subscribe((offices) => {
        this._updateEventsOffices(offices);
      })

    this.person$ = this.peopleStore.record$;
    this.people$ = this.peopleStore.serverRecords$;
    this.person$
      // za każdym razem kiedy dodany/edytowany/usunięty person
      // musimy zaktualizować rekord wewnątrz eventu
      .subscribe((person) => {
        this._updateEventsPerson(person);
      })
    this.people$
      // za każdym razem kiedy przychodzą z serwera person
      // musimy polecieć po wszystkich, jeżeli ich serverLastEditedDate jest większy niż aktualny, to update
      .subscribe((people) => {
        this._updateEventsPeople(people);
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

  // nowe metody, potrzebne do aktualizacji danych w relacjach

  // uczestnicy

  private _updateEventsPerson(person: Person) {
    const changedEvents: Array<PEvent> = [];
    this._dataStore.forEach((event, index) => {
      //lecimy po wszystkich person eventu
      event.people.some((eventPerson, eventPersonIndex) => {
        // szukamy po lokalnym id
        if (eventPerson && eventPerson.localId === person.localId) {
          // jeżeli isRemoved to usuwamy
          if (person.isRemoved) {
            this._dataStore[index].people[eventPersonIndex] = null;
          }
          // w p.p szukamy po lokalnym id i aktualizujemy
          else {
            this._dataStore[index].people[eventPersonIndex] = person;
          }
          changedEvents.push(this._dataStore[index]);
          return true;
        }
      });
    });

    // zapisujemy zmiany (wyemituje zmianę)
    changedEvents.forEach((changedEvent) => {
      this.editRecord(changedEvent).subscribe();
    });
  }

  private _updateEventsPeople(people: Array<Person>) {
    people.forEach((serverPerson) => {
      this._dataStore.forEach((event) => {
        event.people.some((eventPerson) => {
          if (serverPerson.localId === eventPerson.localId) {
            if (serverPerson.serverLastEditedDate > eventPerson.serverLastEditedDate) {
              this._updateEventsPerson(serverPerson);
            }
            return true;
          }
        });
      });
    });
  }

  // gabinety

  private _updateEventsOffice(office: Office) {
    const changedEvents: Array<PEvent> = [];
    this._dataStore.forEach((event, index) => {
      // szukamy po lokalnym id
      if (event.office && event.office.localId === office.localId) {
        // jeżeli isRemoved to usuwamy
        if (office.isRemoved) {
          this._dataStore[index].office = null;
        }
        // w p.p szukamy po lokalnym id i aktualizujemy
        else {
          this._dataStore[index].office = office;
        }
        changedEvents.push(this._dataStore[index]);
      }
    });

    // zapisujemy zmiany (wyemituje zmianę)
    changedEvents.forEach((changedEvent) => {
      this.editRecord(changedEvent).subscribe();
    });
  }

  private _updateEventsOffices(offices: Array<Office>) {
    offices.forEach((serverOffice) => {
      this._dataStore.forEach((event) => {
        if (serverOffice.localId === event.office.localId) {
          if (serverOffice.serverLastEditedDate > event.office.serverLastEditedDate) {
            this._updateEventsOffice(serverOffice);
          }
        }
      });
    });
  }

}
