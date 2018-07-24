import { LocalModel } from "./local.model";

export class Office extends LocalModel {
    id?: number;
    localId?: string;
    name: string;

    street?: string;
    buildingNo?: string;
    localNo?: string;
    postal?: string;
    city?: string;
    county?: string;

    serverLastEditedDate?: number;
    needSync?: boolean;
    isNew?: boolean;
    isRemoved?: boolean;
}