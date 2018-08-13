import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Office } from '../../../../shared/office.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'office-edit-form',
  templateUrl: 'office-edit-form.html',
})
export class OfficeEditFormComponent implements OnInit {
  @Input('officeData')
  public office: Office = { id: null, name: '' }; //default value

  @Output()
  onFormInit = new EventEmitter<FormGroup>();

  public officeFormGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.officeFormGroup = this.formBuilder.group({
      id: null,
      name: [null, [Validators.required, Validators.minLength(5)]],
      nip: [null, Validators.required],
      street: [null, Validators.required],
      buildingNo: [null, Validators.required],
      localNo: null,
      postal: [null, Validators.required],
      city: [null, Validators.required],
      // county: null,
      voivodeship: [null, Validators.required],
      phone: [null, Validators.required],
      krsName: [null, Validators.required],
      locationInfo: null
    });
    this.officeFormGroup.patchValue(this.office);

    this.onFormInit.emit(this.officeFormGroup);
  }
}
