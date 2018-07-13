import { Office } from "./office.model";
import { Person } from "./person.model";

export class PEvent {
    name: string;
    date: Date;
    photoOutside: File;
    photoInsideWaiting: File;
    noPhotoInsideWaiting: boolean;
    noPhotoInsideWaitingWhy: string;
    photoInsideOffice: File;
    noPhotoInsideOffice: boolean;
    noPhotoInsideOfficeWhy: string;
    isOfficeNetwork: boolean;
    networkOfficesCount: number;
    chairsCount: number;
    doctorsCount: number;
    hasOfficeHigienists: boolean;
    higienistsCount: number;
    isBuyingSonicare: string;
    doQualify: string;
    office: Office;
    people: Array<Person>;
}