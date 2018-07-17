export enum Gender {
    Pani,
    Pan
}

export class Person {
    id: number;
    name: string;
    gender?: Gender;
    email?: string;
    phone?: string;
    officesNo?: number;
    sonicareUser?: boolean;
    sonicareRecom?: boolean;
    wantCodes?: boolean;
    gotStarter?: boolean;
    starterNo?: string;
    gotExpositor?: boolean;
    agreeReg?: boolean;
    agreeMark1?: boolean;
    agreeMark2?: boolean;
    agreeMark3?: boolean;
    agreeMark4?: boolean;
    additionalData?: string;
}