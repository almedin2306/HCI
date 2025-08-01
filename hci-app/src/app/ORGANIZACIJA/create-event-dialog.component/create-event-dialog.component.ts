import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatStep, MatStepLabel, MatStepper} from '@angular/material/stepper';
import {MatIconButton} from '@angular/material/button';
import {MatFormField, MatLabel, MatFormFieldModule} from '@angular/material/form-field'; // Import MatFormFieldModule
import {MatInputModule} from '@angular/material/input'; // Import MatInputModule
import {MatIcon} from '@angular/material/icon';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';

@Component({
  selector: 'app-create-event-dialog.component',
  imports: [
    MatStep,
    ReactiveFormsModule,
    MatStepper,
    MatDialogTitle,
    MatIconButton,
    MatStepLabel,
    MatFormField,
    MatLabel,
    MatIcon,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatInputModule, // Add MatInputModule here
    MatFormFieldModule,
  ],
  templateUrl: './create-event-dialog.component.html',
  standalone: true,
  styleUrl: './create-event-dialog.component.css'
})
export class CreateEventDialogComponent {
  basicInfoFormGroup: FormGroup;
  detailsFormGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder
  ) {
    // Inicijalizacija form grupe za prvi korak
    this.basicInfoFormGroup = this.formBuilder.group({
      naziv: ['', Validators.required],
      datum: ['', Validators.required],
      pocetak: ['09:00', Validators.required],
      kraj: ['17:00', Validators.required],
      mjesto: ['', Validators.required],
    });

    // Inicijalizacija form grupe za drugi korak
    this.detailsFormGroup = this.formBuilder.group({
      opis: [''],
      brojVolontera: [null]
    });
  }

  /**
   * Metoda za zatvaranje dijaloga.
   */
  onNoClick(): void {
    this.dialogRef.close();
  }
}
