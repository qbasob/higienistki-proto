import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ENV } from '@app/env';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import { LocalModel } from '../../shared/local.model';

/**
 * Observable Data Service, "PeopleStore"
 * zmiana danych emituje zmianę na wszystkich zasukbskrybowanych komponentach;
 */
export abstract class AbstractStore<T extends LocalModel> {
  public records$: Observable<Array<T>>;
  private _apiUrl: string;
  private _storageKey: string;
  private _records$: BehaviorSubject<Array<T>>;
  private _dataStore: Array<T>;

  constructor(
    modelName: string,
    public http: HttpClient,
    public storage: Storage
  ) {
    this._apiUrl = `${ENV.endpoint}/${modelName}`;
    this._storageKey = modelName;
    this._dataStore = [];
    this._records$ = <BehaviorSubject<Array<T>>>new BehaviorSubject([]);
    this.records$ = this._records$.asObservable(); // żeby ukryć na zewnątrz metody Subjectu (np. next())
    this._initDataStore();
  }

  // metody prywatne, pomocnicze, trzeba wymyślić logikę całego tego store (kiedy wysyłac/pobierać online, ogarnięcie konfliktów itp.)
  private _generateObjectId(): string {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
      return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
  }

  private _initDataStore(): void {
    // bierzemy dane lokalne
    this._getAllFromStorage()
      .subscribe(
        (data: Array<T>) => {
          // jeżeli są to emitujemy
          if (data) {
            this._dataStore = data;
            this._records$.next(this._dataStore.concat());
          }
          // jeżeli nie ma to bierzemy z serwera
          else {
            this._getAllFromServer()
              // emitujemy i zapisujemy lokalnie
              .subscribe((data: Array<T>) => {
                data.forEach((serverRecord) => {
                  if (!serverRecord.localId) {
                    serverRecord.localId = this._generateObjectId();
                  }
                });
                this._dataStore = data;
                this._saveAllToStorage(this._dataStore);
                this._records$.next(this._dataStore.concat());
              });
          }
        }

      );
  }

  // ładuje wszystkie rekordy z serwera
  private _getAllFromServer(): Observable<Array<T>> {
    if (this._dataStore) {
      const doNeedSync = this._dataStore.filter(record => record.needSync);
      if (doNeedSync.length > 0) {
        return Observable.throw("Nie można pobrać danych z serwera, dopóki istnieją lokalne dane niezsynchronizowane z serwerem.");
      }
    }
    return this.http.get<Array<T>>(this._apiUrl);
  }

  private _addToServer(record: T): Observable<T> {
    const cloneRecord = Object.assign({}, record);
    // usuwamy lokalne, tymczasowe flagi
    delete cloneRecord.needSync;
    delete cloneRecord.isNew;

    return this.http.post<T>(this._apiUrl, cloneRecord);
  }

  private _editOnServer(record: T): Observable<T> {
    const cloneRecord = Object.assign({}, record);
    // usuwamy lokalne, tymczasowe flagi
    delete cloneRecord.needSync;
    delete cloneRecord.isNew;

    // jeżeli rekord istniał tylko lokalnie, to musimy go utworzyć na serwerze
    if (record.isNew) {
      return this.http.post<T>(this._apiUrl, cloneRecord);
    }
    // w p.p. normalny edit
    return this.http.patch<T>(`${this._apiUrl}/${record.id}`, cloneRecord);
  }

  private _removeFromServer(record: T): Observable<T> {
    return this.http.delete<T>(`${this._apiUrl}/${record.id}`);
  }

  // zapis wszystkich rekordów do storage
  private _saveAllToStorage(records: Array<T>): Observable<Array<T>> {
    return Observable.fromPromise(this.storage.set(this._storageKey, records)
      .then((data) => {
        return data;
      })
    );
  }

  // ładuje wszystkie rekordy ze storage
  private _getAllFromStorage(): Observable<Array<T>> {
    return Observable.fromPromise(this.storage.get(this._storageKey)
      .then((data) => {
        return data;
      })
    );
  }

  // metody publiczne:

  public getFilteredRecords(filter: string): Observable<Array<T>> {
    return this.records$
      .map((records) => {
        if (filter) {
          return records.filter(record => {
            return record.name.toLowerCase().includes(filter.toLowerCase());
          })
        } else {
          return records;
        }
      });
  }

  public refreshRecords(): Observable<Array<T>>  {
    // bierzemy wszystkie rekordy z serwera
    return this._getAllFromServer()
      // emitujemy i zapisujemy lokalnie
      .do((data: Array<T>) => {
        this._dataStore = data;
        this._saveAllToStorage(this._dataStore);
        this._records$.next(this._dataStore.concat());
      });
  }

  // edytuje rekord, emituje zmianę
  public editRecord(record: T): Observable<T> {
    return this._editOnServer(record)
      // jeżeli błąd serwera
      .catch<T, never>((err) => {
        // ustawiamy flagę needSync na rekordzie
        record.needSync = true;
        // lokalnie aktualizujemy dane rekordu
        this._dataStore.forEach((arrayRecord, index) => {
          if (arrayRecord.localId === record.localId) {
            this._dataStore[index] = record;
          }
        });

        // rethrow obsługiwany w AppErrorHandler
        throw err;
      })
      // zarówno w przypadku błędu serwera jak i powodzenia emitujemy nowe dane
      .finally(() => {
        // Push a new copy of our records array to all Subscribers, to avoid mutations from subscriber
        // Object.assign({}, dataStore) will not work, bacause new object will still have reference to records array
        this._saveAllToStorage(this._dataStore);
        this._records$.next(this._dataStore.concat());
      })
      // jeżeli sukces serwera
      .do((serverRecord: T) => {
        // edytujemy rekord zwrócony z serwera, z id serwerowym, w store
        this._dataStore.forEach((arrayRecord, index) => {
          // szukamy po lokalnym id i podmieniamy
          if (arrayRecord.localId === record.localId) {
            this._dataStore[index] = serverRecord;
          }
        });
      })
  }

  // dodaje rekord, emituje zmianę
  public addRecord(record: T): Observable<T> {
    record.localId = this._generateObjectId();
    return this._addToServer(record)
      // jeżeli błąd serwera
      .catch<T, never>((err) => {
        // ustawiamy flagę needSync i isNew na rekordzie
        record.needSync = true;
        record.isNew = true;
        // dodajemy aktualny rekord z needSync i lokalnym id do store
        this._dataStore.push(record);

        // rethrow obsługiwany w AppErrorHandler
        throw err;
      })
      // zarówno w przypadku błędu serwera jak i powodzenia emitujemy nowe dane
      .finally(() => {
        // Push a new copy of our records array to all Subscribers, to avoid mutations from subscriber
        // Object.assign({}, dataStore) will not work, bacause new object will still have reference to records array
        this._saveAllToStorage(this._dataStore);
        this._records$.next(this._dataStore.concat());
      })
      // jeżeli sukces serwera
      .do((serverRecord: T) => {
        // dodajemy rekord zwrócony  serwera, z id serwerowym, do store
        this._dataStore.push(serverRecord);
      })
  }

  // usuwa rekord, emituję zmianę
  public removeRecord(record: T): Observable<T> {
    // jeżeli rekord jest lokalny, to usuwamy go bez łączenia z serwerem
    if (record.isNew) {
      this._dataStore.forEach((arrayRecord, index) => {
        // szukamy po lokalnym id i ususwamy
        if (arrayRecord.localId === record.localId) {
          this._dataStore.splice(index, 1);
        }
      });
      this._saveAllToStorage(this._dataStore);
      this._records$.next(this._dataStore.concat());

      return Observable.of(record);
    }

    return this._removeFromServer(record)
      // jeżeli błąd serwera
      .catch<T, never>((err) => {
        // ustawiamy flagę needSync i isRemoved na rekordzie
        record.needSync = true;
        record.isRemoved = true;
        // lokalnie aktualizujemy dane rekordu
        this._dataStore.forEach((arrayRecord, index) => {
          if (arrayRecord.localId === record.localId) {
            this._dataStore[index] = record;
          }
        });

        // rethrow obsługiwany w AppErrorHandler
        throw err;
      })
      // zarówno w przypadku błędu serwera jak i powodzenia emitujemy nowe dane
      .finally(() => {
        // Push a new copy of our records array to all Subscribers, to avoid mutations from subscriber
        // Object.assign({}, dataStore) will not work, bacause new object will still have reference to records array
        this._saveAllToStorage(this._dataStore);
        this._records$.next(this._dataStore.concat());
      })
      // jeżeli sukces serwera
      .do((serverRecord: T) => {
        // usuwamy całkowicie rekord
        this._dataStore.forEach((arrayRecord, index) => {
          // szukamy po lokalnym id i ususwamy
          if (arrayRecord.localId === record.localId) {
            this._dataStore.splice(index, 1);
          }
        });
      })
  }

  // znajduje wszystkie rekordy z flagą needSync i wysyła je na serwer
  // jeżeli ma flagę isRemoved - usuwa
  // w p.p. edytuje

  // !!! DO PRZETESTOWANIA, teoretycznie działa !!!
  public syncIfNeeded(): Observable<Array<T>> {
    const serverSyncObservables: Array<Observable<T>> = [];

    this._dataStore.forEach((arrayRecord, index) => {
      if (arrayRecord.needSync === true) {
        if (arrayRecord.isRemoved) {
          serverSyncObservables.push(this.removeRecord(arrayRecord));
        }
        else {
          serverSyncObservables.push(this.editRecord(arrayRecord));
        }
      }
    });

    return Observable.forkJoin(serverSyncObservables);
  }
}
