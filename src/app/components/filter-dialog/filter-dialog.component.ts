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
import { BehaviorSubject, debounceTime, filter, map, Observable, startWith, switchMap, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
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
  selectedCity: string = '';
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
  filteredPinList: AddressArray[] = [];
  filteredNameList: AddressArray[] = [];
  filteredMem_No: AddressArray[] = [];
  filteredMobile_no: AddressArray[] = [];

  nameCtrl: FormControl = new FormControl('');
  pin: FormControl = new FormControl('');
  memNoCtrl: FormControl = new FormControl('');
  mobile_no: FormControl = new FormControl('');
  alternate_mobile_no: FormControl = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private matDialogref: MatDialogRef<FilterDialogComponent>,
    private commonServ: CommonService,
    private filterDataService: FilterDataService,
    private loader: NgxUiLoaderService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.buildFilterForm();
    this.filteredCountries = this.countryControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        // Set the selected country whenever the value changes
        this.selectedCountry = value;
        return this._filter(value || this.countries, this.countries);
      })
    );
    this.stateFormCtrl.valueChanges
      .pipe(
        startWith(''),
        map((value) => {
          this.selectedState = value;
          // this.cityCtrl.reset()
          return this._filter(value, this.states)
        })
      )
      .subscribe((filtered) => this.stateSubject.next(filtered));
    this.cityCtrl.valueChanges
      .pipe(
        startWith(''),
        map((value) =>
          this._filter(value, this.cities))
      )
      .subscribe((filtered) => this.citySubject.next(filtered));

    const country = localStorage.getItem('country');
    const pincodeLocal = localStorage.getItem('pincode')!;
    if (pincodeLocal) {
      this.pin.patchValue(pincodeLocal);
    }
    this.nameCtrl.patchValue(localStorage.getItem('name') ?? '');
    this.memNoCtrl.patchValue(localStorage.getItem('mem_no') ?? '');
    this.mobile_no.patchValue(localStorage.getItem('mobile') ?? '');
    if (country) {
      this.filterForm.patchValue({ country: country });
      this.selectedCountry = country;
      this.getStates();
    }
    this.searchDebounce()
    this.getCountries();
  }

  private _filter(value: string | any[], field?: AddressArray[]): any[] {
    if (Array.isArray(value)) {
      return value; // Return the entire countries list initially
    }
    const filterValue = value?.toLowerCase();
    return field!.filter((field) =>
      field.name.toLowerCase().includes(filterValue)
    );
  }


  searchDebounce() {
    this.pin.valueChanges.pipe(
      debounceTime(500),
      filter((value) => value !== ''),
      tap((value) => {
        console.log(value)
        if (value === '') {
          this.clearOnPin();
        }
      }),
      switchMap((value) => {
        return this.commonServ.pinSearch(value ?? "", this.countryControl.value, this.stateFormCtrl.value, this.cityCtrl.value, this.nameCtrl.value!, this.memNoCtrl.value!, this.mobile_no.value!)
      })
    ).subscribe({
      next: (res) => {
        this.filteredPinList = res.pins;
      }
    })

    this.nameCtrl.valueChanges.pipe(
      debounceTime(500),
      tap((value) => {
        if (value === '') {
          this.clearOnName();
        }
      }),
      filter((value) => value !== ''),
      switchMap((value) => {
        return this.commonServ.nameSearch(value ?? "", this.countryControl.value, this.stateFormCtrl.value, this.cityCtrl.value, this.pin.value!, this.memNoCtrl.value!, this.mobile_no.value!)
      })
    ).subscribe({
      next: (res) => {
        this.filteredNameList = res.names;
      }
    })

    this.memNoCtrl.valueChanges.pipe(
      debounceTime(500),
      tap((value) => {
        if (value === '') {
          this.memNoCtrl.setValue('');
        }
      }),
      filter((value) => value !== ''),
      switchMap((value) => {
        return this.commonServ.memNoSearch(value ?? "", this.countryControl.value, this.stateFormCtrl.value, this.cityCtrl.value, this.pin.value!, this.mobile_no.value!, this.nameCtrl.value!)
      })
    ).subscribe({
      next: (res) => {
        this.filteredMem_No = res.mem_numbers;
      }
    })

    this.mobile_no.valueChanges.pipe(
      debounceTime(500),
      filter((value) => value !== ''),
      switchMap((value) => {
        return this.commonServ.mobileNoSearch(value ?? "", this.countryControl.value, this.stateFormCtrl.value, this.cityCtrl.value, this.nameCtrl.value!, this.pin.value!, this.memNoCtrl.value!)
      })
    ).subscribe({
      next: (res) => {
        this.filteredMobile_no = res.mobile_numbers;
      }
    })
  }

  onFocusState() {
    this.stateSubject.next(this.states); // Show full list on focus
  }

  clearValue(formCtrl: FormControl) {
    formCtrl.setValue('');
    if (formCtrl == this.countryControl) {
      this.clearOnCountry();
      this.stateSubject.next([])
      this.cities = [];
      this.citySubject.next([]);
    }
    if (formCtrl == this.stateFormCtrl) {
      this.clearOnState();
      this.cities = [];
      this.citySubject.next([]);
    }
    if (formCtrl == this.cityCtrl) {
      this.clearOnCity()
    }
    if (formCtrl == this.pin) {
      this.clearOnPin()
    }
    if (formCtrl == this.nameCtrl) {
      this.clearOnName();
    }
    if (formCtrl == this.memNoCtrl) {
      this.mobile_no.setValue('');
    }
  }

  clearOnState() {
    this.cityCtrl.setValue('');
    this.pin.setValue('');
    this.memNoCtrl.setValue('');
    this.nameCtrl.setValue('');
    this.mobile_no.setValue('');
  }

  clearOnCity() {
    this.pin.setValue('');
    this.memNoCtrl.setValue('');
    this.nameCtrl.setValue('');
    this.mobile_no.setValue('');
  }

  clearOnPin() {
    this.memNoCtrl.setValue('');
    this.nameCtrl.setValue('');
    this.mobile_no.setValue('');
  }

  clearOnName() {
    this.memNoCtrl.setValue('');
    this.mobile_no.setValue('');
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
          // Validators.pattern('^[0-9-]*$'),
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

  selectCountry(event: MatAutocompleteSelectedEvent) {
    this.selectedCountry = this.countryControl.value;
    if (this.selectedCountry) {
      localStorage.removeItem('city');
      localStorage.removeItem('state');
      this.selectedState = '';
      this.clearOnCountry()
      this.getStates();
    }
  }

  clearOnCountry() {
    this.stateFormCtrl.setValue('');
    this.cityCtrl.setValue('');
    this.pin.setValue('');
    this.memNoCtrl.setValue('');
    this.nameCtrl.setValue('');
    this.mobile_no.setValue('');
  }

  selectState(event: MatAutocompleteSelectedEvent) {
    if (event.option.value) {
      this.selectedState = event.option.value;
      this.clearOnState();
      this.getCities();
    }
  }
  selectMem_no() {
    this.mobile_no.setValue('');
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
    localStorage.setItem('country', this.countryControl.value);
    localStorage.setItem('state', this.selectedState);
    localStorage.setItem('city', this.cityCtrl.value);
    localStorage.setItem('pincode', this.pin.value);
    localStorage.setItem('name', this.nameCtrl.value!);
    localStorage.setItem('mem_no', this.memNoCtrl.value!);
    localStorage.setItem('mobile', this.mobile_no.value!);
    this.loader.start();
    const searchItem = localStorage.getItem('search');
    const loacalSearchData = searchItem ? JSON.parse(searchItem) : '';
    this.commonServ
      .filter(
        this.countryControl.value,
        this.selectedState,
        this.cityCtrl.value,
        this.pin.value!,
        loacalSearchData,
        1,
        this.nameCtrl.value!,
        this.memNoCtrl.value!,
        this.mobile_no.value!,
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
    localStorage.removeItem('mobile');
    localStorage.removeItem('mem_no');
    localStorage.removeItem('name');
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
    return this.cityCtrl.value || this.pin.value ||
      this.stateFormCtrl.value ||
      this.countryControl.value || this.nameCtrl.value || this.memNoCtrl.value || this.mobile_no.value;
  }
}
