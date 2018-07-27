import { Office } from "./office.model";
import { Person } from "./person.model";
import { LocalModel } from "./local.model";

export class PEvent extends LocalModel {
    id?: number;
    localId?: string;
    name: string;

    date?: Date;
    photoOutside?: File;
    photoInsideWaiting?: File;
    noPhotoInsideWaiting?: boolean;
    noPhotoInsideWaitingWhy?: string;
    photoInsideOffice?: File;
    noPhotoInsideOffice?: boolean;
    noPhotoInsideOfficeWhy?: string;
    isOfficeNetwork?: boolean;
    networkOfficesCount?: number;
    chairsCount?: number;
    doctorsCount?: number;
    hasOfficeHigienists?: boolean;
    higienistsCount?: number;
    isBuyingSonicare?: string;
    doQualify?: string;
    additionalInfo?: string;

    office?: Office;
    people?: Array<Person>;

    serverLastEditedDate?: number;
    needSync?: boolean;
    isNew?: boolean;
    isRemoved?: boolean;
}