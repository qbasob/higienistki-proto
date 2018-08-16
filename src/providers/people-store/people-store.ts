import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { AbstractStore } from '../abstract-store/abstract-store';
import { Person } from '../../shared/person.model';
import { AuthService } from '../auth-service/auth-service';

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
    storage: Storage,
    authService: AuthService
  ) {
    const modelName = 'people';
    super(modelName, http, storage, authService);
  }
}
