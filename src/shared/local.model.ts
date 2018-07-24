export abstract class LocalModel {
    id?: number;
    localId?: string;
    name: string;
    serverLastEditedDate?: number;
    needSync?: boolean;
    isNew?: boolean;
    isRemoved?: boolean;
}