import { LocalModel } from "./local.model";

export class Office extends LocalModel {
    id?: number;
    localId?: string;
    name: string;
    nip?: string;
    street?: string;
    buildingNo?: string;
    localNo?: string;
    postal?: string;
    city?: string;
    // county?: string;
    voivodeship?: string;

    phone?: string;
    krsName?: string;
    locationInfo?: string;

    serverLastEditedDate?: number;
    needSync?: boolean;
    isNew?: boolean;
    isRemoved?: boolean;
}