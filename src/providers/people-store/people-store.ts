import { HttpClient } from '@angular/common/http';
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
 * Np. lita uczestników jest podpięta pod {{ PersonStore.getFilteredPeople() | async }}
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
    public http: HttpClient
  ) {
    this.apiUrl = ENV.endpoint + '/people';
    this.dataStore = { people: [] };
    this._people = <BehaviorSubject<Array<Person>>>new BehaviorSubject([]);
    this.people = this._people.asObservable(); // żeby ukryć na zewnątrz metody Subjectu (np. next())

    this.getAllFromServer();
  }

  // metody prywatne, pomocnicze, trzeba wymyślić logikę całego tego store(kiedy wysyłac/pobierać online, ogarnięcie konfliktów itp.)

  // ładuje wszystkie z serwera
  private getAllFromServer() {
    this.http.get(this.apiUrl).subscribe((data: Array<Person>) => {
        this.dataStore.people = data;
        // Push a new copy of our people list to all Subscribers
        this._people.next(Object.assign({}, this.dataStore).people);
      }
    );
  }

  // ładuje jeden po id z serwera
  private getOneFromServer(id: number) {
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
      // Push a new copy of our people list to all Subscribers
      this._people.next(Object.assign({}, this.dataStore).people);
    }, error => console.log('Could not load todo.'));
  }

  // TODO:
  // private sendToServer(person: Person): void; // zapisuje osobę na serwerze
  // private getAllFromStorage(): Array<Person>; // pobiera osoby ze storage
  // private getOneFromStorage(id: number): Person; // pobiera osobę ze storage
  // private saveToStorage(Array<Person>): void; // zapisuje osoby do storage

  // metody publiczne:

  editPersonOffline(person: Person) {
    this.dataStore.people.forEach((t, i) => {
      if (t.id === person.id) {
        this.dataStore.people[i] = person;
      }
    });
    // Push a new copy of our people list to all Subscribers
    this._people.next(Object.assign({}, this.dataStore).people);
  }

  // TODO:
  // public addPersonOffline(person: Person): void; // dodaje osobę w _people, emituję zmianę
  // public removePersonOffline(person: Person): void; // usuwa osobę w _people, emituję zmianę

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
}
