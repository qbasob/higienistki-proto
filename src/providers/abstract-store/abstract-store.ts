import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { ENV } from '@app/env';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/forkJoin';
import { LocalModel } from '../../shared/local.model';

/**
 * Observable Data Service, "PeopleStore"
 * zmiana danych emituje zmianę na wszystkich zasukbskrybowanych komponentach;
 */
export abstract class AbstractStore<T extends LocalModel> {
  public records$: Observable<Array<T>>;
  private _apiUrl: string;
  private _apiSuffix: string;
  private _storageKey: string;
  private _records$: BehaviorSubject<Array<T>>;
  private _dataStore: Array<T>;

  constructor(
    modelName: string,
    public http: HttpClient,
    public storage: Storage
  ) {
    this._apiUrl = `${ENV.endpoint}/${modelName}`;
    this._apiSuffix = ENV.endpointSuffix;
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
    return this.http.get<Array<T>>(this._apiUrl + this._apiSuffix)
      // dane pobierane z serwera mogą nie mieć localId (np. jeżeli nigdy nie były edytowane lokalnie)
      // w takiej sytuacji musimy go przypisać
      .map((serverRecords: T[]) => {
        serverRecords.forEach((serverRecord) => {
          if (!serverRecord.localId) {
            serverRecord.localId = this._generateObjectId();
          }
        });
        return serverRecords;
      })
  }

  private _addToServer(record: T): Observable<T> {
    const cloneRecord = Object.assign({}, record);
    // usuwamy lokalne, tymczasowe flagi
    delete cloneRecord.needSync;
    delete cloneRecord.isNew;

    return this.http.post<T>(this._apiUrl + this._apiSuffix, cloneRecord);
  }

  private _editOnServer(record: T): Observable<T> {
    const cloneRecord = Object.assign({}, record);
    // usuwamy lokalne, tymczasowe flagi
    delete cloneRecord.needSync;
    delete cloneRecord.isNew;

    // jeżeli rekord istniał tylko lokalnie, to musimy go utworzyć na serwerze
    if (record.isNew) {
      return this.http.post<T>(this._apiUrl + this._apiSuffix, cloneRecord);
    }
    // w p.p. normalny edit
    return this.http.put<T>(`${this._apiUrl}/${record.id}${this._apiSuffix}`, cloneRecord);
  }

  private _removeFromServer(record: T): Observable<T> {
    return this.http.delete<T>(`${this._apiUrl}/${record.id}${this._apiSuffix}`);
  }

  // zapis wszystkich rekordów do storage
  private _saveAllToStorage(records: Array<T>): Observable<Array<T>> {
    return Observable.fromPromise(this.storage.set(this._storageKey, records)
      .then((savedRecords) => {
        return savedRecords;
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
  // zawsze zwraca Observable<T>, obojętnie czy powiedzie się zapis online
  // w ten sposób w komponencie na subscribe dostaniemy dane rekordu, które będzie można odesłać
  // np. do event wizarda/ event edita, czyli powiedzmy:
  // event edit -> add person -> (save, callback) -> add person c.d. -> nowy person na liście
  public editRecord(record: T): Observable<T> {
    return this._editOnServer(record)
      .catch<T, never>((err) => {
        // jeżeli błąd serwera, ustawiamy flagę rekordowi
        record.needSync = true;

        // jeżeli błąd serwera to kontynuujemy, zapisze się lokalnie i oznaczy do synchronizacji
        // w takiej sytuacji przekazujemy do switchMap rekord który chcieliśmy wysłać
        return Observable.of(record);
      })
      .switchMap((serverRecord: T) => {
        // jeżeli dane zapisane na serwerze (lub błąd serwera), to edytujemy rekord w store
        this._dataStore.forEach((arrayRecord, index) => {
          // szukamy po lokalnym id i aktualizujemy
          if (arrayRecord.localId === serverRecord.localId) {
            this._dataStore[index] = serverRecord;
          }
        });

        // emitujemy zmianę
        this._records$.next(this._dataStore.concat());

        // na koniec zapisujemy zawartość store (wszystkie rekordy) do storage
        return this._saveAllToStorage(this._dataStore)
          // _saveAllToStorage zwraca po poprawnym zapisie cały array rekordów
          // my chcemy zwrócić tylko ten przed chwilą edytowany, więc zwracamy wcześniejszy serverRecord
          .map(_ => serverRecord);
      });
  }

  // dodaje rekord, emituje zmianę
  public addRecord(record: T): Observable<T> {
    record.localId = this._generateObjectId();
    record.isNew = true;
    return this._addToServer(record)
      .catch<T, never>((err) => {
        // jeżeli błąd serwera, ustawiamy flagę rekordowi
        record.needSync = true;

        // jeżeli błąd serwera to kontynuujemy, zapisze się lokalnie i oznaczy do synchronizacji
        // w takiej sytuacji przekazujemy do switchMap rekord który chcieliśmy wysłać
        return Observable.of(record);
      })
      .switchMap((serverRecord: T) => {
        // jeżeli dane zapisane na serwerze (lub błąd serwera), to dodajemy rekord do store
        this._dataStore.push(serverRecord);

        // emitujemy zmianę
        this._records$.next(this._dataStore.concat());

        // na koniec zapisujemy zawartość store (wszystkie rekordy) do storage
        return this._saveAllToStorage(this._dataStore)
          // _saveAllToStorage zwraca po poprawnym zapisie cały array rekordów
          // my chcemy zwrócić tylko ten przed chwilą edytowany, więc zwracamy wcześniejszy serverRecord
          .map(_ => serverRecord);
      });
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

      // i zwracamy dane właśnie usuniętego rekordu
      return Observable.of(record);
    }

    // w p.p. usuwamy go z serwera, i jeżeli sukces to lokalnie
    return this._removeFromServer(record)
      .catch<T, never>((err) => {
        // jeżeli błąd serwera, ustawiamy flagi rekordowi
        record.needSync = true;
        record.isRemoved = true;

        // jeżeli błąd serwera to kontynuujemy, zapisze się lokalnie i oznaczy do synchronizacji
        // w takiej sytuacji przekazujemy do switchMap rekord który chcieliśmy wysłać
        return Observable.of(record);
      })
      .switchMap((serverRecord: T) => {
        // jeżeli dane zapisane na serwerze to usuwamy rekord ze store
        // remove zwraca z serwera pusty obiekt/null, więc używamy ten który wysyłaliśmy
        if (serverRecord == null || Object.keys(serverRecord).length === 0) {
          this._dataStore.forEach((arrayRecord, index) => {
            // szukamy po lokalnym id i ususwamy
            if (arrayRecord.localId === record.localId) {
              this._dataStore.splice(index, 1);
            }
          });
        }
        // jeżeli błąd serwera, to zapisujemy flagi
        else {
          this._dataStore.forEach((arrayRecord, index) => {
            // szukamy po lokalnym id i aktualizujemy
            if (arrayRecord.localId === serverRecord.localId) {
              this._dataStore[index] = serverRecord;
            }
          });
        }

        // emitujemy zmianę
        this._records$.next(this._dataStore.concat());

        // na koniec zapisujemy zawartość store (wszystkie rekordy) do storage
        return this._saveAllToStorage(this._dataStore)
          // _saveAllToStorage zwraca po poprawnym zapisie cały array rekordów
          // my chcemy zwrócić tylko ten przed chwilą edytowany, więc zwracamy wcześniejszy serverRecord
          .map(_ => serverRecord);
      });
  }

  // znajduje wszystkie rekordy z flagą needSync i wysyła je na serwer
  // jeżeli ma flagę isRemoved - usuwa
  // w p.p. edytuje
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
