import { AbstractControl } from "@angular/forms";

export function NoSpacesValidator(control: AbstractControl) {
  if (control.value) {
    const value = control.value;
    const isValid = value.trim().length > 0; // Valid if trimmed length is greater than 0
    return isValid ? null : { onlySpaces: true }; // Return null if valid, or an error object if invalid
  }
  return null
}