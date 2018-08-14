import { AbstractControl, Validators, ValidatorFn } from '@angular/forms';

export class CustomValidators extends Validators {

	static requireIfOther(otherFieldName: string, otherFieldValue: any = true): ValidatorFn {
		return (control: AbstractControl): {[key: string]: any} => {
			const group = control.parent;
			if (!group) {
				return null;
			}

			const otherField = group.get(otherFieldName);
			if (otherField.value === otherFieldValue) {
				return Validators.required(control);
			}

			return null;
		}
	}
}