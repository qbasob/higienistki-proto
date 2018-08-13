import { FormControl, Validators } from '@angular/forms';

export class CustomValidators extends Validators {

	static validAaa(fc: FormControl) {
		const fg = fc.parent;
		if (fg) {
			console.log("NAME VALUE:", fg.get('name').value);
		}

		if (fc.value === "tttta" || fc.value === "123abc") {
			return { validData: true };
		} else {
			return null;
		}
	}
}