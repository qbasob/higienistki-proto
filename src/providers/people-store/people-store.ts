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
  people: Observable<Array<Person>>
  private _people: BehaviorSubject<Array<Person>>;
  private apiUrl: string;
  private dataStore: {  // This is where we will store our data in memory
    people: Array<Person>
  };

  constructor(
    public http: HttpClient,
    private storage: Storage
  ) {
    this.apiUrl = ENV.endpoint + '/people';
    this.dataStore = { people: [] };
    this._people = <BehaviorSubject<Array<Person>>>new BehaviorSubject([]);
    this.people = this._people.asObservable(); // żeby ukryć na zewnątrz metody Subjectu (np. next())
    this.initDataStore();
  }

  // metody prywatne, pomocnicze, trzeba wymyślić logikę całego tego store (kiedy wysyłac/pobierać online, ogarnięcie konfliktów itp.)

  private initDataStore() {
    // bierzemy dane lokalne
    this.getAllFromStorage()
      // jeżeli są to emitujemy
      .then((data: Array<Person>) => {
        this.dataStore.people = data;
        this._people.next(this.dataStore.people.concat());
      })
      // jeżeli nie ma to bierzemy z serwera
      .catch(() => {
        this.getAllFromServer()
          // emitujemy i zapisujemy lokalnie
          .subscribe((data: Array<Person>) => {
            this.dataStore.people = data;
            this.saveToStorage(this.dataStore.people);
            this._people.next(this.dataStore.people.concat());
          });
      });
  }

  // ładuje wszystkie osoby z serwera
  private getAllFromServer(): Observable<Array<Person>> {
    return this.http.get<Array<Person>>(this.apiUrl);
  }

  // ładuje jedną osobę po id z serwera
  /* private getOneFromServer(id: number) {
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

  // zapis wszystkich uczestników do storage
  private saveToStorage(people: Array<Person>): Promise<boolean> {
    return this.storage.set('people', people)
      .then( _ => true )
      .catch( _ => false );
  }

  // ładuje wszystkie osoby ze storage
  private getAllFromStorage(): Promise<Array<Person>> {
    return this.storage.get('people');
  }

  // TODO:
  // private sendToServer(person: Person): void; // zapisuje osobę na serwerze
  // private getOneFromStorage(id: number): Person; // pobiera osobę ze storage

  // metody publiczne:

  public getFilteredPeople(filter: string): Observable<Array<Person>> {
    return this.people
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
    return this.getAllFromServer()
      // emitujemy i zapisujemy lokalnie
      .do((data: Array<Person>) => {
        this.dataStore.people = data;
        this.saveToStorage(this.dataStore.people);
        this._people.next(this.dataStore.people.concat());
      });
  }

  // edytuje/dodaje lokalnie osobę, emituje zmianę
  editAddPersonLocal(person: Person) {
    // edycja
    if (person.id !== null) {
      this.dataStore.people.forEach((t, i) => {
        if (t.id === person.id) {
          this.dataStore.people[i] = person;
        }
      });
    }
    // dodawanie
    else {
      this.dataStore.people.push(person);
    }
    this.saveToStorage(this.dataStore.people)
      .then(res => {
        console.log("saveToStorage result:", true);
      });
    // Push a new copy of our people array to all Subscribers, to avoid mutations from subscriber
    // Object.assign({}, dataStore) will not work, bacause new object will still have reference to people array
    this._people.next(this.dataStore.people.concat());
  }

  // usuwa lokalnie osobę, emituję zmianę
  public removePersonLocal(person: Person): Promise<boolean> {
    this.dataStore.people.forEach((t, i) => {
      if (t.id === person.id) {
        this.dataStore.people.splice(i, 1);
      }
    });
    this._people.next(this.dataStore.people.concat());
    return this.saveToStorage(this.dataStore.people);
  }
}
