import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { AbstractStore } from '../abstract-store/abstract-store';
import { Office } from '../../shared/office.model';
import { AuthService } from '../auth-service/auth-service';
import { Events } from 'ionic-angular';

/**
 * Observable Data Service, "OfficesStore"
 * zmiana danych emituje zmianę na wszystkich zasukbskrybowanych komponentach;
 */

@Injectable()
export class OfficesStore extends AbstractStore<Office> {
  constructor(
    http: HttpClient,
    storage: Storage,
    authService: AuthService,
    events: Events
  ) {
    const modelName = 'offices';
    super(modelName, http, storage, authService, events);
  }
}
