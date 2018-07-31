import { FormControl, Validators } from '@angular/forms';

export class CustomValidators extends Validators {

	static validAaa(fc: FormControl) {
		// console.log('fcfcfcfcfcfcfcfc', fc.value);
		// let val = fc.value?.toLowerCase();
		// console.log(fc.errors);
		// return (null);
		if (fc.value === "tttta" || fc.value === "123abc") {
			return ({ validData: true });
		// 	return true;
		} else {
			return null;
		}
	}
}