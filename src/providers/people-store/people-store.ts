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
      // jeżeli są to emitujemy
      .then((data: Array<Person>) => {
        this._dataStore.people = data;
        this._people$.next(this._dataStore.people.concat());
      })
      // jeżeli nie ma to bierzemy z serwera
      .catch(() => {
        this._getAllFromServer()
          // emitujemy i zapisujemy lokalnie
          .subscribe((data: Array<Person>) => {
            this._dataStore.people = data;
            this._saveAllToStorage(this._dataStore.people);
            this._people$.next(this._dataStore.people.concat());
          });
      });
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
      return this.http.put<Person>(this._apiUrl, person);
    }
  }

  // zapis wszystkich uczestników do storage
  private _saveAllToStorage(people: Array<Person>): Promise<boolean> {
    return this.storage.set('people', people)
      .then( _ => true )
      .catch( _ => false );
  }

  // ładuje wszystkie osoby ze storage
  private _getAllFromStorage(): Promise<Array<Person>> {
    return this.storage.get('people');
  }

  // TODO:
  // private _sendToServer(person: Person): void; // zapisuje osobę na serwerze
  // private getOneFromStorage(id: number): Person; // pobiera  jedną osobę po id ze storage
  /* private getOneFromServer(id: number) {  // ładuje jedną osobę po id z serwera
    this.http.get(`${this.apiUrl}/${id}`).subscribe((data: Person) => {
      let notFound = true;

      this.dataStore.people.forEach((item, index) => {
        if (item.id === data.id) {
          this.dataStore.people[index] = data;
          notFound = false;
        }
      });

      if (notFound) {
        this.dataStore.people.push(data);
      }
      // Push a new copy of our people array to all Subscribers, to avoid mutations from subscriber
      // Object.assign({}, dataStore) will not work, bacause new object will still have reference to people array
      this._people.next(this.dataStore.people.concat());
    });
  } */


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
    // return Observable.throw(new Error('ojoj'));
    return this._getAllFromServer()
      // emitujemy i zapisujemy lokalnie
      .do((data: Array<Person>) => {
        this._dataStore.people = data;
        this._saveAllToStorage(this._dataStore.people);
        this._people$.next(this._dataStore.people.concat());
      });
  }

  // edytuje/dodaje lokalnie osobę, emituje zmianę
  editAddPerson(person: Person): void {
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
      // jeżeli błąd serwera to ustawiamy flagę needSync uczestniku
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

  // usuwa lokalnie osobę, emituję zmianę
  public removePersonLocal(person: Person): Promise<boolean> {
    this._dataStore.people.forEach((t, i) => {
      if (t.id === person.id) {
        this._dataStore.people.splice(i, 1);
      }
    });
    this._people$.next(this._dataStore.people.concat());
    return this._saveAllToStorage(this._dataStore.people);
  }
}
