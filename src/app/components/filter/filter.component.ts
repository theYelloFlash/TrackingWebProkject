import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [FormsModule, MatButtonModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css',
})
export class FilterComponent {
  searchTerm: string = '';

  constructor(private dialog: MatDialog) { }

  onFilter() { }

  onAddNew() { }

  openDialog() {
    this.dialog.open(FilterDialogComponent, {
      autoFocus: false,
      maxWidth: '400px',
      height: '600px',
      width: '90%',
    });
  }
}
