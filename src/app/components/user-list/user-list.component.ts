import { Component, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FilterComponent } from '../filter/filter.component';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator'; // Import MatPaginatorModule
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from '../../services/commonservices';
import {
  ApiPaginatedResponse,
  CharteredAccountant,
} from '../../Interface/apiResponse';
import { UserDataService } from '../../services/sharedUserDataService';
import { debounceTime,distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { FilterDataService } from '../../services/filter-data-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { resetFormServ } from '../../services/resetDataService';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    FilterComponent,
    HttpClientModule,
    CommonModule,
    MatPaginatorModule,
    NgxUiLoaderModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
  providers: [CommonService],
})
export class UserListComponent {
  chartedAccountant: CharteredAccountant[] = [];
  metaData!: ApiPaginatedResponse<CharteredAccountant>;
  totalItemsCount = 0;
  currentPage = 1;
  searchFormControl: FormControl = new FormControl('');
  searchResults: CharteredAccountant[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  filteredDataList: CharteredAccountant[] = [];
  isLoaded = false;

  constructor(
    private commonServ: CommonService,
    private router: Router,
    private userDataServ: UserDataService,
    private loaderServ: NgxUiLoaderService,
    private filteredDataServ: FilterDataService,
    private matDialog: MatDialog,
    private toastr: ToastrService,
    private resetDataServ: resetFormServ
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getUsers();
    this.searchDebounce();
    this.searchFormControl?.valueChanges.subscribe((value) => {
      if (value.length == 0) {
        this.getAllUsersList();
      }
    });
    this.resetDataServ.getReset().subscribe({
      next: (res) => {
        if (res) {
          this.callgetApi();
        }
      },
    });
  }

  getUsers() {
    this.filteredDataServ
      .getFilterData()
      .pipe(
        debounceTime(300), // Add a small delay to avoid rapid triggering
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ) // Trigger only if the data is different
      )
      .subscribe({
        next: (res) => {
          this.filteredDataList = res?.data?.results || [];
          if (res && !res.reset) {
            this.chartedAccountant = res?.data?.results;
            this.totalItemsCount = res?.data?.count;
          } else {
            this.getAllUsersList(); // Call your method (even if it's void)
          }
        },
        error: (err) => {
          alert('Api error in filter api');
        },
      });
  }

  searchDebounce() {
    this.searchFormControl?.valueChanges
      .pipe(
        // Trim the input value
        map((value) => value.trimStart()),
        // Avoid emitting events when trimming the value
        tap((trimmedValue) => {
          if (this.searchFormControl.value !== trimmedValue) {
            this.searchFormControl.setValue(trimmedValue, { emitEvent: false });
          }
        }),
        // Proceed only if the value is non-empty after trimming
        filter((trimmedValue) => trimmedValue.length > 0),
        // Apply debounce to avoid unnecessary API calls
        debounceTime(400),
        // Proceed only if the length of the trimmed value is at least 3
        filter((trimmedValue) => trimmedValue.length > 2),
        switchMap((trimmedValue) => {
          this.loaderServ.start();
          // Call the API with the search text
          return this.commonServ.searchApi(trimmedValue, this.currentPage);
        })
      )
      .subscribe({
        next: (result) => {
          this.loaderServ.stop();
          this.currentPage = 1;
          this.paginator.firstPage();
          this.totalItemsCount = result.count;
          this.isLoaded = true;
          this.chartedAccountant = result.results;
        },
        error: (error) => {
          this.loaderServ.stop();
          console.error('Search error:', error);
        },
      });
  }

  getAllUsersList() {
    if (this.filteredDataList.length > 0) {
      this.chartedAccountant = this.filteredDataList;
      this.isLoaded = true;
    } else {
      this.callgetApi();
    }
  }

  callgetApi() {
    this.loaderServ.start();
    this.commonServ.getAllUsers(this.currentPage, this.searchFormControl.value).subscribe({
      next: (res) => {
        this.totalItemsCount = res.count;
        this.chartedAccountant = res.results;
        this.isLoaded = true;
        this.loaderServ.stop();
      },
      error: (err) => {
        if (err.status == 401) {
          localStorage.clear();
          this.toastr.error('Token Expired, Login again');
          this.router.navigate(['login']);
        }
        this.loaderServ.stop();
      },
    });
  }

  openUserProfile(ca: CharteredAccountant) {
    this.userDataServ.setUserData(ca);
    this.router.navigate([`user-profile/${ca.id}`]);
  }

  getSAddress(ca: CharteredAccountant) {
    let address = [
      ca.address_1 ?? '',
      ca.address_2 ?? '',
      ca.address_3 ?? '',
      ca.address_4 ?? '',
      ca.city ?? '',
      ca.state ?? '',
      ca.country ?? '',
    ];
    address = address.filter((item) => item !== '');
    return address.join(',');
  }

  onPageChange(event: PageEvent) {
    this.loaderServ.start();
    this.currentPage = event.pageIndex + 1;
    if (this.filteredDataList.length > 0) {
      this.getAllFilteredUsers();
    } else if (this.searchFormControl.value) {
      this.searchResult();
    } else {
      this.getAllUsersList();
    }
    this.loaderServ.stop();
  }

  getAllFilteredUsers() {
    const country = localStorage.getItem('country') ?? '';
    const state = localStorage.getItem('state') ?? '';
    const city = localStorage.getItem('city') ?? '';
    const pinCode = localStorage.getItem('pincode') ?? '';
    this.commonServ
      .filter(
        country,
        state,
        city,
        pinCode,
        this.searchFormControl.value,
        this.currentPage
      )
      .subscribe({
        next: (res) => {
          this.chartedAccountant = res.results;
        },
        error: (err) => {
          alert('api error');
        },
      });
  }

  searchResult() {
    this.loaderServ.start();
    this.commonServ
      .searchApi(this.searchFormControl.value, this.currentPage)
      .subscribe({
        next: (res) => {
          this.totalItemsCount = res.count;
          this.chartedAccountant = res.results;
          this.loaderServ.stop();
        },
        error: (err) => {
          alert('api error');
          this.loaderServ.stop();
        },
      });
  }

  userUpdate(event: Event, ca: CharteredAccountant) {
    event.stopPropagation();
    this.userDataServ.setUserData(ca);
    this.router.navigate([`user-form/${ca.id}`]);
  }

  logOut() {
    const matDialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      width: '320px', // Set width
      height: '160px', // Set height (optional)
      maxWidth: '80vw', // Set maximum width (optional)
      minWidth: '300px', // Set minimum width (optional)
      data: {
        message: 'Do you really want to log out..?',
      },
    });

    matDialogRef.afterClosed().subscribe({
      next: (res) => {
        if (res.data == 'Yes') {
          localStorage.clear();
          this.router.navigate(['login']);
        }
      },
    });
  }
}
