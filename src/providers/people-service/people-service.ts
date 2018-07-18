import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ENV } from '@app/env';
import { Person } from '../../shared/person.model';

/*
  Generated class for the UsersServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PeopleService {

  constructor(public http: HttpClient) {
    console.log('Hello PeopleService Provider');
  }

  getPeopleOnline(filter?: string): Observable<Array<Person>> {
    let urlFilter = '';
    if (filter) {
      urlFilter = `?q=${filter}`;
    }
    return this.http.get<Array<Person>>(`${ENV.endpoint}/people${urlFilter}`);
  }

  putPersonOnline(person: Person): Observable<Array<Person>> {
    const personId = person.id;
    return this.http.put<Array<Person>>(`${ENV.endpoint}/people/${personId}`, person);
  }
}
