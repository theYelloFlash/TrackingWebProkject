import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css',
})
export class ConfirmationDialogComponent {
  message : string = ""
  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private matDialogRef: MatDialogRef<ConfirmationDialogComponent>
  ) {
    this.message = data.message;
  }

  modelAction(data : string){
    this.matDialogRef.close({data : data});
  }

}
