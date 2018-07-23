import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Person } from '../../shared/person.model';
import { ENV } from '@app/env';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';

/**
 * Observable Data Service, "PeopleStore"
 * zmiana danych emituje zmianę na wszystkich zasukbskrybowanych komponentach;
 *
 * Np. lista uczestników jest podpięta pod {{ PersonStore.getFilteredPeople() | async }}
 * wchodzimy w uczestnika, edytujemy, klikamy save
 * w edycji wykonuje się PersonStore.editPerson(formData.value) i NavController.pop()
 * wracamy na listę, lista jest aktualna bo BehaviourSubject wemitował zmianę po editPerson
 */

@Injectable()
export class PeopleStore {
  public people$: Observable<Array<Person>>
  private _people$: BehaviorSubject<Array<Person>>;
  private _apiUrl: string;
  private _dataStore: {  // This is where we will store our data in memory
    people: Array<Person>
  };

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this._apiUrl = ENV.endpoint + '/people';
    this._dataStore = { people: [] };
    this._people$ = <BehaviorSubject<Array<Person>>>new BehaviorSubject([]);
    this.people$ = this._people$.asObservable(); // żeby ukryć na zewnątrz metody Subjectu (np. next())
    this._initDataStore();
  }

  // metody prywatne, pomocnicze, trzeba wymyślić logikę całego tego store (kiedy wysyłac/pobierać online, ogarnięcie konfliktów itp.)

  private _initDataStore(): void {
    // bierzemy dane lokalne
    this._getAllFromStorage()
      .subscribe(
        (data: Array<Person>) => {
          // jeżeli są to emitujemy
          if (data) {
            this._dataStore.people = data;
            this._people$.next(this._dataStore.people.concat());
          }
          // jeżeli nie ma to bierzemy z serwera
          else {
            this._getAllFromServer()
              // emitujemy i zapisujemy lokalnie
              .subscribe((data: Array<Person>) => {
                this._dataStore.people = data;
                this._saveAllToStorage(this._dataStore.people);
                this._people$.next(this._dataStore.people.concat());
              });
          }
        }

      );
  }

  // ładuje wszystkie osoby z serwera
  private _getAllFromServer(): Observable<Array<Person>> {
    if (this._dataStore.people) {
      const doNeedSync = this._dataStore.people.map(person => person.needSync).filter(needSync => needSync);
      if (doNeedSync.length > 0) {
        return Observable.throw("Istnieją niezsynchronizowane osoby. Nie można pobrać danych z serwera.");
      }
    }
    return this.http.get<Array<Person>>(this._apiUrl);
  }

  private _sendToServer(person: Person): Observable<Person> {
    if (person.id) {
      return this.http.patch<Person>(`${this._apiUrl}/${person.id}`, person);
    } else {
      return this.http.post<Person>(this._apiUrl, person);
    }
  }

  private _removeFromServer(person: Person): Observable<Person> {
    return this.http.delete<Person>(`${this._apiUrl}/${person.id}`);
  }

  // zapis wszystkich uczestników do storage
  private _saveAllToStorage(people: Array<Person>): Observable<Array<Person>> {
    return Observable.fromPromise(this.storage.set('people', people)
      .then((data) => {
        return data;
      })
    );
  }

  // ładuje wszystkie osoby ze storage
  private _getAllFromStorage(): Observable<Array<Person>> {
    return Observable.fromPromise(this.storage.get('people')
      .then((data) => {
        return data;
      })
    );
  }

  // metody publiczne:

  public getFilteredPeople(filter: string): Observable<Array<Person>> {
    return this.people$
      .map((people) => {
        if (filter) {
          return people.filter(person => {
            return person.name.includes(filter);
          })
        } else {
          return people;
        }
      });
  }

  public refreshPeople(): Observable<Array<Person>>  {
    // bierzemy wszystkich z serwera
    return this._getAllFromServer()
      // emitujemy i zapisujemy lokalnie
      .do((data: Array<Person>) => {
        this._dataStore.people = data;
        this._saveAllToStorage(this._dataStore.people);
        this._people$.next(this._dataStore.people.concat());
      });
  }

  // edytuje/dodaje lokalnie osobę, emituje zmianę
  public editAddPerson(person: Person): void {
    // edycja
    if (person.id !== null) {
      this._dataStore.people.forEach((t, i) => {
        if (t.id === person.id) {
          this._dataStore.people[i] = person;
        }
      });
    }
    // dodawanie
    else {
      this._dataStore.people.push(person);
    }

    this._sendToServer(person)
      // jeżeli błąd serwera to ustawiamy flagę needSync na uczestniku
      .catch((err) => {
        person.needSync = true;
        throw err;
      })
      // tak czy siak emitujemy nowe dane
      .finally(() => {
        // Push a new copy of our people array to all Subscribers, to avoid mutations from subscriber
        // Object.assign({}, dataStore) will not work, bacause new object will still have reference to people array
        this._saveAllToStorage(this._dataStore.people);
        this._people$.next(this._dataStore.people.concat());
      })
      .subscribe();
  }

  // usuwa osobę, emituję zmianę
  public removePerson(person: Person): void {
    this._dataStore.people.forEach((t, i) => {
      if (t.id === person.id) {
        this._dataStore.people.splice(i, 1);
      }
    });

    this._saveAllToStorage(this._dataStore.people);
    this._people$.next(this._dataStore.people.concat());

    // TODO:
    // UWAGA!!!!
    // ogarnąć usuwanie usera, po usunięciu nie może dostać flagi bo go już nie ma
    /*
    this._removeFromServer(person)
      // jeżeli błąd serwera to ustawiamy flagę needSync na uczestniku
      .catch((err) => {
        person.needSync = true;
        throw err;
      })
      // tak czy siak emitujemy nowe dane
      .finally(() => {
        // Push a new copy of our people array to all Subscribers, to avoid mutations from subscriber
        // Object.assign({}, dataStore) will not work, bacause new object will still have reference to people array
        this._saveAllToStorage(this._dataStore.people);
        this._people$.next(this._dataStore.people.concat());
      })
      .subscribe();
    */
  }
}
