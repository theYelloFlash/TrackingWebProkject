import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CommonService } from '../../services/commonservices';
import { AddressArray } from '../../Interface/countries';
import { HttpClientModule } from '@angular/common/http';
import {
  FilterDataService,
  IFilterData,
} from '../../services/filter-data-service.service';
import {
  ApiPaginatedResponse,
  CharteredAccountant,
} from '../../Interface/apiResponse';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { BehaviorSubject, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    NgIf,
    MatInputModule,
    CommonModule,
    MatSelectModule,
    HttpClientModule,
    MatAutocompleteModule,
  ],
  providers: [CommonService],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.css',
})
export class FilterDialogComponent {
  filterForm: FormGroup = new FormGroup({});
  countries: AddressArray[] = [];
  states: AddressArray[] = [];
  cities: AddressArray[] = [];
  selectedCountry: string = '';
  selectedState: string = '';
  cityCtrl: FormControl = new FormControl('');
  pinCode = '';
  resetData: ApiPaginatedResponse<CharteredAccountant> = {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
  countryControl: FormControl = new FormControl('');
  countriesSubject = new BehaviorSubject<AddressArray[]>(this.countries);
  filteredCountries = this.countriesSubject.asObservable();

  stateFormCtrl: FormControl = new FormControl('');
  stateSubject = new BehaviorSubject<AddressArray[]>(this.states ?? []);
  filteredStates = this.stateSubject.asObservable();

  citySubject = new BehaviorSubject<AddressArray[]>(this.cities ?? []);
  filteredCities = this.citySubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private matDialogref: MatDialogRef<FilterDialogComponent>,
    private commonServ: CommonService,
    private filterDataService: FilterDataService,
    private loader: NgxUiLoaderService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.buildFilterForm();
    this.filteredCountries = this.countryControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || this.countries, this.countries))
    );
    this.stateFormCtrl.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._filter(value, this.states))
      )
      .subscribe((filtered) => this.stateSubject.next(filtered));

    this.cityCtrl.valueChanges
      .pipe(
        startWith(''),
        map((value) => this._filter(value, this.cities))
      )
      .subscribe((filtered) => this.citySubject.next(filtered));

    const country = localStorage.getItem('country');
    const pincodeLocal = localStorage.getItem('pincode')!;
    if (pincodeLocal) {
      this.filterForm.patchValue({ pincode: pincodeLocal });
    }
    if (country) {
      this.filterForm.patchValue({ country: country });
      this.selectedCountry = country;
      this.getStates();
    }
    this.getCountries();
  }

  private _filter(value: string | any[], field?: AddressArray[]): any[] {
    if (Array.isArray(value)) {
      return value; // Return the entire countries list initially
    }
    const filterValue = value.toLowerCase();
    return field!.filter((field) =>
      field.name.toLowerCase().includes(filterValue)
    );
  }

  onFocusState() {
    this.stateSubject.next(this.states); // Show full list on focus
  }

  onFocusCity() {
    this.citySubject.next(this.cities); // Show full list on focus
  }

  buildFilterForm() {
    this.filterForm = this.fb.group({
      city: this.cityCtrl,
      state: this.stateFormCtrl,
      country: this.countryControl,
      pincode: [
        '',
        [
          Validators.maxLength(10),
          Validators.minLength(4),
          Validators.pattern('^[0-9-]*$'),
        ],
      ],
    });
  }

  getCountries() {
    this.commonServ.getCountries().subscribe({
      next: (res) => {
        // this.filteredCountries = res.countries as Observable<any[]>;
        this.addCountry(res.countries);
        this.countries = res.countries;
      },
      error: (err) => {
        alert('api error');
      },
    });
  }

  addCountry(newCountries: AddressArray[]): void {
    this.countries.push(...newCountries); // Add the new country to the array
    this.countriesSubject.next([...this.countries]); // Emit the updated array
  }

  // addStates(newStates: AddressArray[]): void {
  //   this.states.push(...newStates); // Add the new country to the array
  //   this.statesSubject.next([...this.states]); // Emit the updated array
  // }

  selectCountry(event: MatAutocompleteSelectedEvent) {
    this.selectedCountry = event.option.value;
    if (this.selectedCountry) {
      localStorage.removeItem('city');
      localStorage.removeItem('state');
      this.selectedState = '';
      this.cityCtrl.setValue('');
      this.getStates();
    }
  }

  selectState(event: MatAutocompleteSelectedEvent) {
    if (event.option.value) {
      this.selectedState = event.option.value;
      this.getCities();
    }
  }

  getStates() {
    this.commonServ.getStates(this.selectedCountry).subscribe({
      next: (res) => {
        this.states = res.states;
        this.cities = [];
        this.stateSubject.next(this.states);
        const localState = localStorage.getItem('state');
        if (localState) {
          this.filterForm.patchValue({ state: localState });
          this.selectedState = localState;
          this.getCities();
        }
      },
      error: (err) => {
        alert('Api Error');
      },
    });
  }

  getCities() {
    this.commonServ
      .getCities(this.selectedCountry, this.selectedState)
      .subscribe({
        next: (res) => {
          this.citySubject.next(this.cities);
          this.cities = res.cities;
          const localCity = localStorage.getItem('city');
          if (localCity) {
            this.filterForm.patchValue({ city: localCity });
          }
        },
        error: (err) => {
          alert('Api Error');
        },
      });
  }

  onSubmit() {
    localStorage.setItem('country', this.selectedCountry);
    localStorage.setItem('state', this.selectedState);
    localStorage.setItem('city', this.cityCtrl.value);
    this.pinCode = this.filterForm.controls['pincode'].value;
    localStorage.setItem('pincode', this.pinCode);
    this.loader.start();
    const searchItem = localStorage.getItem('search');
    const loacalSearchData = searchItem ? JSON.parse(searchItem) : '';
    this.commonServ
      .filter(
        this.selectedCountry,
        this.selectedState,
        this.cityCtrl.value,
        this.pinCode,
        loacalSearchData,
        1
      )
      .subscribe({
        next: (res) => {
          this.loader.stop();
          if (res.results.length == 0) {
            this.toastr.error('No result for this filter');
          } else {
            const filterObject: IFilterData = {
              data: res,
              reset: false,
            };
            this.filterDataService.setFilterData(filterObject);
            this.toastr.success('Filter Applied');
            this.matDialogref.close();
          }
        },
        error: (err) => {
          alert('api error in filter api');
          this.loader.stop();
          this.matDialogref.close();
        },
      });
  }

  resetFilters() {
    this.loader.start();
    localStorage.removeItem('country');
    localStorage.removeItem('state');
    localStorage.removeItem('city');
    localStorage.removeItem('pincode');
    const filterObject: IFilterData = {
      data: this.resetData,
      reset: true,
    };
    this.filterDataService.setFilterData(filterObject);
    this.loader.stop();
    this.closeDialog();
  }

  closeDialog() {
    this.matDialogref.close();
  }

  get isFormValid(): boolean {
    return this.filterForm.controls['pincode'].value
      ? this.filterForm.controls['pincode'].valid
      : this.cityCtrl.value ||
          this.filterForm.controls['state'].value ||
          this.filterForm.controls['country'].value;
  }
}
