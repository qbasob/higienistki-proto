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
import 'rxjs/add/observable/of';

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

  private _addToServer(person: Person): Observable<Person> {
    // może się zdarzyć że mamy uczestnika z lokalnym id
    // musimy ten id usunąć przed wysłaniem danych, aby serwer stworzył swój własny id
    const clonePerson = Object.assign({}, person);
    delete clonePerson.id;

    return this.http.post<Person>(this._apiUrl, clonePerson);
  }

  private _editOnServer(person: Person): Observable<Person> {
    return this.http.patch<Person>(`${this._apiUrl}/${person.id}`, person);
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

  // edytuje osobę, emituje zmianę
  public editPerson(person: Person): Observable<Person> {
    return this._editOnServer(person)
      // jeżeli błąd serwera
      .catch<Person, never>((err) => {
        // ustawiamy flagę needSync na uczestniku
        person.needSync = true;
        // lokalnie aktualizujemy dane uczestnika
        this._dataStore.people.forEach((arrayPerson, index) => {
          if (arrayPerson.id === person.id) {
            this._dataStore.people[index] = person;
          }
        });

        // rethrow obsługiwany w AppErrorHandler
        throw err;
      })
      // zarówno w przypadku błędu serwera jak i powodzenia emitujemy nowe dane
      .finally(() => {
        // Push a new copy of our people array to all Subscribers, to avoid mutations from subscriber
        // Object.assign({}, dataStore) will not work, bacause new object will still have reference to people array
        this._saveAllToStorage(this._dataStore.people);
        this._people$.next(this._dataStore.people.concat());
      })
      // jeżeli sukces serwera
      .do((serverPerson: Person) => {
        // usuwamy isNew i needSync
        delete serverPerson.isNew;
        delete serverPerson.needSync;

        // edytujemy uczestnika zwróconego z serwera, z id serwerowym, w store
        this._dataStore.people.forEach((arrayPerson, index) => {
          // w store może nadal mieć lokalne id, więc szukamy po starym id i podmieniamy
          if (arrayPerson.id === person.id) {
            this._dataStore.people[index] = serverPerson;
          }
        });
      })
  }

  // dodaje osobę, emituje zmianę
  public addPerson(person: Person): Observable<Person> {
    return this._addToServer(person)
      // jeżeli błąd serwera
      .catch<Person, never>((err) => {
        // ustawiamy flagę needSync i isNew na uczestniku
        person.needSync = true;
        person.isNew = true;
        // dodajemy tymczasowy identyfikator, aktualny timestamp skonkatenowany z ilością uczestników; wystarczająco unikalny
        person.id = +('' + Date.now() + this._dataStore.people.length);
        // dodajemy aktualnego uczestnika z needSync i tymczasowym id do store
        this._dataStore.people.push(person);

        // rethrow obsługiwany w AppErrorHandler
        throw err;
      })
      // zarówno w przypadku błędu serwera jak i powodzenia emitujemy nowe dane
      .finally(() => {
        // Push a new copy of our people array to all Subscribers, to avoid mutations from subscriber
        // Object.assign({}, dataStore) will not work, bacause new object will still have reference to people array
        this._saveAllToStorage(this._dataStore.people);
        this._people$.next(this._dataStore.people.concat());
      })
      // jeżeli sukces serwera
      .do((serverPerson: Person) => {
        // usuwamy isNew i needSync
        delete serverPerson.isNew;
        delete serverPerson.needSync;

        // dodajemy uczestnika zwróconego z serwera, z id serwerowym, do store
        this._dataStore.people.push(serverPerson);
      })
  }

  // usuwa osobę, emituję zmianę
  public removePerson(person: Person): Observable<Person> {
    // jeżeli osoba jest lokalna, to usuwamy ją bez łączenia z serwerem
    if (person.isNew) {
      this._dataStore.people.forEach((arrayPerson, index) => {
        // szukamy po lokalnym id i ususwamy
        if (arrayPerson.id === person.id) {
          this._dataStore.people.splice(index, 1);
        }
      });
      this._saveAllToStorage(this._dataStore.people);
      this._people$.next(this._dataStore.people.concat());

      return Observable.of(person);
    }

    return this._removeFromServer(person)
      // jeżeli błąd serwera
      .catch<Person, never>((err) => {
        // ustawiamy flagę needSync i isRemoved na uczestniku
        person.needSync = true;
        person.isRemoved = true;
        // lokalnie aktualizujemy dane uczestnika
        this._dataStore.people.forEach((arrayPerson, index) => {
          if (arrayPerson.id === person.id) {
            this._dataStore.people[index] = person;
          }
        });

        // rethrow obsługiwany w AppErrorHandler
        throw err;
      })
      // zarówno w przypadku błędu serwera jak i powodzenia emitujemy nowe dane
      .finally(() => {
        // Push a new copy of our people array to all Subscribers, to avoid mutations from subscriber
        // Object.assign({}, dataStore) will not work, bacause new object will still have reference to people array
        this._saveAllToStorage(this._dataStore.people);
        this._people$.next(this._dataStore.people.concat());
      })
      // jeżeli sukces serwera
      .do((serverPerson: Person) => {
        // usuwamy całkowicie rekord
        this._dataStore.people.forEach((arrayPerson, index) => {
          // szukamy po lokalnym id i ususwamy
          if (arrayPerson.id === person.id) {
            this._dataStore.people.splice(index, 1);
          }
        });
      })
  }
}
