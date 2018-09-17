import { HttpClient } from '@angular/common/http';
// import { HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/observable/of'
import { ENV } from '@app/env';
import { Platform } from 'ionic-angular'
import { File as CFile, FileEntry } from '@ionic-native/file';

export class PhotoObject {
  photoId: string;
  file?: File;
  fileUri?: string;
  needSync?: boolean;
}

@Injectable()
export class PhotoService {
  protected _apiUrl: string;
  protected _apiSuffix: string;
  private _cordovaPhotoDirectory = this.file.externalCacheDirectory;

  constructor(
    public http: HttpClient,
    private domSanitizer: DomSanitizer,
    public storage: Storage,
    private platform: Platform,
    private file: CFile
  ) {
    this._apiUrl = `${ENV.endpoint}/photos`;
    this._apiSuffix = ENV.endpointSuffix;
  }

  private _generatePhotoId(): string {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return 'local_' +timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
      return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
  }

  private _uploadToServer(photo: PhotoObject): Observable<PhotoObject> {
    const formData = new FormData();

    // jeżeli cordova
    if (this.platform.is('cordova')) {
      return Observable.fromPromise(this.file.resolveLocalFilesystemUrl(photo.fileUri)
        .then((fileEntry: FileEntry): Promise<ArrayBuffer> => {
          return new Promise(function (resolve, reject) {
            fileEntry.file(
              (fileSelected: any) => {
                let reader = new FileReader();

                reader.onloadend = function () {
                  if (this.result instanceof ArrayBuffer) {
                    return resolve(this.result);
                  } else {
                    return reject(this.result);
                  }
                };

                reader.readAsArrayBuffer(fileSelected);
              },
              (err: any) => {
                return reject(err);
              }
            );
          });
        })
      )
      .switchMap((fileToUpload: ArrayBuffer) => {
        const realFile = new window['OrigFile']([fileToUpload], photo.fileUri.split("/").pop());

        formData.append('photoId', photo.photoId);
        formData.append('file', realFile);
        const tmpName = photo.fileUri.split("/").pop();

        return this.http.post(this._apiUrl + this._apiSuffix, formData, { responseType: 'blob' })
          .map((serverBlob: Blob) => {
            const newFile = new window['OrigFile']([serverBlob], tmpName);
            const updatedPhoto = Object.assign({}, photo);
            updatedPhoto.file = newFile;
            delete updatedPhoto.needSync;
            return updatedPhoto;
          })
      })
    }
    // jeżeli PWA/website
    else {
      formData.append('photoId', photo.photoId);
      formData.append('file', photo.file);
      const tmpName = photo.file.name;

      return this.http.post(this._apiUrl + this._apiSuffix, formData, { responseType: 'blob' })
        .map((serverBlob: Blob) => {
          const newFile = new File([serverBlob], tmpName);
          const updatedPhoto = Object.assign({}, photo);
          updatedPhoto.file = newFile;
          delete updatedPhoto.needSync;
          return updatedPhoto;
        })
    }
  }

  private _downloadFromServer(photoId: string): Observable<PhotoObject> {
    // plik z serwera nie będzie mieć nazwy, więc dajemy mu własną
    const tmpName = `${photoId}.jpg`;
    return this.http.get(`${this._apiUrl}/${photoId}${this._apiSuffix}`, { responseType: 'blob' })
      .map((serverBlob: Blob) => {
        const file = new window['OrigFile']([serverBlob], tmpName);
        const photo: PhotoObject = {
          photoId,
          file
        }
        return photo;
      })
  }

  private _getFromStorage(photoId: string): Observable<PhotoObject> {
    return Observable.fromPromise(this.storage.get(`photo_${photoId}${this._apiSuffix}`)
      .then((data: PhotoObject) => {
        return data;
      })
    );
  }

  private _setToStorage(photo: PhotoObject, originalPhoto: PhotoObject | string = null): Observable<PhotoObject> {
    // jeżeli cordova, chce się zapisać obiekt File i istnieje originalPhoto, tzn że idzie resize z serwera
    // musimy zapisać zresizowany obrazek pod ścieżką originalPhoto
    if (this.platform.is('cordova') && photo.file !== undefined && originalPhoto && typeof originalPhoto === 'object') {
      const updatedPhoto = Object.assign({}, photo);
      delete updatedPhoto.file;
      updatedPhoto.fileUri = originalPhoto.fileUri;
      return Observable.fromPromise(
        this.file.writeExistingFile(this._cordovaPhotoDirectory, photo.file.name, photo.file)
        // na koniec zapis do bazy
        .then(_ => {
          return this.storage.set(`photo_${photo.photoId}${this._apiSuffix}`, updatedPhoto)
        })
        .then((data: PhotoObject) => {
          return data;
        })
      );
    }
    // jeżeli cordova, chce się zapisać obiekt File i originalPhoto === create, tzn że przyszedł z serwera a nigdy nie istniał
    // musimy zapisać obrazek pod jakąś nową ścieżką
    else if (this.platform.is('cordova') && photo.file !== undefined && originalPhoto === 'create') {
      const updatedPhoto = Object.assign({}, photo);
      delete updatedPhoto.file;

      return Observable.fromPromise(
        this.file.writeFile(this._cordovaPhotoDirectory, photo.file.name, photo.file, { replace: true })
          // na koniec zapis do bazy
          .then(_ => {
            const photoPath = this._cordovaPhotoDirectory + photo.file.name;
            updatedPhoto.fileUri = photoPath;
            return this.storage.set(`photo_${photo.photoId}${this._apiSuffix}`, updatedPhoto)
          })
          .then((data: PhotoObject) => {
            return data;
          })
      );
    }
    // jeżeli PWA/website
    else {
      return Observable.fromPromise(this.storage.set(`photo_${photo.photoId}${this._apiSuffix}`, photo)
        .then((data: PhotoObject) => {
          return data;
        })
      );
    }
  }

  private _getSanitizedUrl(photo: PhotoObject): SafeUrl {
    let objectURL: string;
    // jeżeli cordova
    if (this.platform.is('cordova')) {
      objectURL = photo.fileUri;
    }
    // jeżeli PWA/website
    else {
      // bez poniższego domSanitizer.bypass... było:
      // WARNING: sanitizing unsafe URL value blob:http://localhost:8100/08016aa0-4de9-4b52-ab5b-db0bb091f347 (see http://g.co/ng/security#xss)
      objectURL = URL.createObjectURL(photo.file);
    }

    const sanitizedObjectURL = this.domSanitizer.bypassSecurityTrustUrl(objectURL);
    return sanitizedObjectURL;
  }

  public addPhoto(file: File): Observable<string> {
    const photoId = this._generatePhotoId();
    const photo: PhotoObject = {
      photoId,
      file
    }

    return this._uploadToServer(photo)
      .catch<PhotoObject, never>((err) => {
        // jeżeli błąd serwera, ustawiamy flagę rekordowi
        photo.needSync = true;
        // jeżeli błąd serwera to kontynuujemy, zapisze się lokalnie i oznaczy do synchronizacji
        // w takiej sytuacji przekazujemy do switchMap zdjęcie które chcemy wysłać
        return Observable.of(photo);
      })
      .switchMap((resizedPhoto: PhotoObject) => {
        return this._setToStorage(resizedPhoto);
      })
      // po dodaniu zdjęcia interesuje nas tylko photoId, więc je zwracamy
      .map((storagePhoto: PhotoObject) => {
        return storagePhoto.photoId
      });
  }

  public addPhotoCordova(fileUri: string): Observable<string> {
    const photoId = this._generatePhotoId();
    const photo: PhotoObject = {
      photoId,
      fileUri
    }

    return this._uploadToServer(photo)
      .catch<PhotoObject, never>((err) => {
        // jeżeli błąd serwera, ustawiamy flagę rekordowi
        photo.needSync = true;
        // jeżeli błąd serwera to kontynuujemy, zapisze się lokalnie i oznaczy do synchronizacji
        // w takiej sytuacji przekazujemy do switchMap zdjęcie które chcemy wysłać
        return Observable.of(photo);
      })
      .switchMap((resizedPhoto: PhotoObject) => {
        return this._setToStorage(resizedPhoto, photo);
      })
      // po dodaniu zdjęcia interesuje nas tylko photoId, więc je zwracamy
      .map((storagePhoto: PhotoObject) => {
        return storagePhoto.photoId
      });
  }

  public getPhotoUrl(photoId: string): Observable<SafeUrl> {
    return this._getFromStorage(photoId)
      .switchMap((photo: PhotoObject): Observable<SafeUrl>  => {
        if (photo) {
          // jeżeli jest needSync, to próbujemy zapisać na serwerze
          if (photo.needSync) {
            return this._uploadToServer(photo)
              // jeżeli się uda, to zapisujemy obrazek z serwera i go zwracamy
              .switchMap((resizedPhoto: PhotoObject): Observable<PhotoObject> => {
                return this._setToStorage(resizedPhoto, photo);
              })
              // jeśli się nie uda to zwracamy co mamy ze storage
              .catch<PhotoObject, never>((_err) => {
                return Observable.of(photo);
              })
              // i w obu przypadkach zwracamy wygenerowany url zdjęcia
              .map((storagePhoto: PhotoObject): SafeUrl => {
                const sanitizedUrl = this._getSanitizedUrl(storagePhoto);
                return sanitizedUrl;
              })
          }
          // jeżeli nie ma needSync to generujemy url zdjęcia z danych ze storage
          else {
            return Observable.of(this._getSanitizedUrl(photo));
          }
        }
        // jeżeli nie znalazł zdjęcia to próbujemy pobrać je z serwera
        else {
          return this._downloadFromServer(photoId)
            // jeżeli się uda, to zapisujemy obrazek z serwera i go zwracamy
            .switchMap((serverPhoto: PhotoObject): Observable<PhotoObject> => {
              return this._setToStorage(serverPhoto, 'create');
            })
            // jeżeli nie uda się pobrać z serwera to zwracamy pusty obiekt
            .catch<PhotoObject, never>((_err) => {
              return Observable.of(null);
            })
            // i w obu przypadkach zwracamy wygenerowany url zdjęcia
            .map((storagePhoto: PhotoObject): SafeUrl => {
              if (storagePhoto) {
                return this._getSanitizedUrl(storagePhoto);
              }
              else {
                return 'assets/imgs/error-image.jpg';
              }
            })
        }
      })


  }
}
