import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { AbstractStore } from '../abstract-store/abstract-store';
import { Person } from '../../shared/person.model';
// import { ENV } from '@app/env';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/filter';
// import 'rxjs/add/observable/throw';
// import 'rxjs/add/observable/fromPromise';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/observable/forkJoin';

/**
 * Observable Data Service, "PeopleStore"
 * zmiana danych emituje zmianę na wszystkich zasukbskrybowanych komponentach;
 *
 * Np. lista uczestników jest podpięta pod {{ PersonStore.getFilteredRecords() | async }}
 * wchodzimy w uczestnika, edytujemy, klikamy save
 * w edycji wykonuje się PersonStore.editPerson(formData.value) i NavController.pop()
 * wracamy na listę, lista jest aktualna bo BehaviourSubject wemitował zmianę po editPerson
 */

@Injectable()
export class PeopleStore extends AbstractStore<Person> {
  constructor(
    http: HttpClient,
    storage: Storage
  ) {
    const modelName = 'people';
    super(modelName, http, storage);
  }
}
