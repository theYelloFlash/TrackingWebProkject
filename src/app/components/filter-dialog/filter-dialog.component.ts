import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CommonService } from '../../services/commonservices';
import { AddressArray } from '../../Interface/countries';
import { HttpClientModule } from '@angular/common/http';
import { FilterDataService, IFilterData } from '../../services/filter-data-service.service';
import { ApiPaginatedResponse, CharteredAccountant } from '../../Interface/apiResponse';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { ResolveData } from '@angular/router';
import { resetFormServ } from '../../services/resetDataService';


@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,MatFormFieldModule, NgIf,MatInputModule, MatSelectModule, HttpClientModule],
  providers : [CommonService],
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.css'
})
export class FilterDialogComponent {
  filterForm : FormGroup = new FormGroup({});
  countries : AddressArray[] = [];
  states : AddressArray[] = [];
  cities : AddressArray[] = [];
  selectedCountry : string = "";
  selectedState : string = "";
  cityCtrl : FormControl = new FormControl('');
  pinCode = "";
  resetData : ApiPaginatedResponse<CharteredAccountant> = {
    count: 0,
    next: null,
    previous: null,
    results: []
  }

  constructor(private fb : FormBuilder, private matDialogref : MatDialogRef<FilterDialogComponent>,
    private commonServ : CommonService, private filterDataService : FilterDataService,
    private loader : NgxUiLoaderService,
    private toastr : ToastrService,
    private resetFormServ : resetFormServ
  ){}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.buildFilterForm()
    // this.filterForm.patchValue({})
    const country = localStorage.getItem('country');
    const pincodeLocal = localStorage.getItem('pincode')!;
    if(pincodeLocal){
      this.filterForm.patchValue({'pincode' : pincodeLocal})
    }
    if(country){
      this.filterForm.patchValue({'country' : country});
      this.selectedCountry = country;
      this.getStates()
    }
    this.getCountries();
  }

  buildFilterForm(){
    this.filterForm = this.fb.group({
      city : this.cityCtrl,
      state : ['', []],
      country : ['', []],
      pincode : ['', [Validators.maxLength(6),Validators.minLength(6),Validators.pattern('^[0-9]*$')]]
    })
  }

  getCountries(){
    this.commonServ.getCountries().subscribe({
      next : (res)=> {
        this.countries = res.countries;
      },
      error : (err) => {
        alert('api error');
      }
    })
  }

  selectCountry(event : MatSelectChange){
    this.selectedCountry = event.value;
    localStorage.removeItem('city')
    localStorage.removeItem('state')
    this.selectedState = '';
    this.cityCtrl.setValue('')
    this.getStates()
  }

  
  getStates(){
    this.commonServ.getStates(this.selectedCountry).subscribe({
      next : (res) => {
        this.states = res.states;
        this.cities = []
        const localState = localStorage.getItem('state');
        if(localState){
          this.filterForm.patchValue({'state' : localState})
          this.selectedState = localState;
          this.getCities()
        }
      },
      error : (err) => {
        alert('Api Error');
      }
    })
  }

  selectState(event : MatSelectChange){
    this.selectedState = event.value;
    this.getCities()
  }

  getCities(){
    this.commonServ.getCities( this.selectedCountry ,this.selectedState).subscribe({
      next : (res) => {
        this.cities = res.cities;
        const localCity = localStorage.getItem('city');
        if(localCity){
          this.filterForm.patchValue({'city' : localCity});
        }
      },
      error : (err) => {
        alert('Api Error');
      }
    })
  }

  onSubmit(){
    localStorage.setItem('country', this.selectedCountry)
    localStorage.setItem('state', this.selectedState)
    localStorage.setItem('city', this.cityCtrl.value)
    this.pinCode = this.filterForm.controls['pincode'].value;
    localStorage.setItem('pincode', this.pinCode)
    this.loader.start()
    this.commonServ.filter(this.selectedCountry, this.selectedState, this.cityCtrl.value,this.pinCode, "",1).subscribe({
      next : (res)=> {
        this.loader.stop()
        if(res.results.length == 0){
          this.toastr.error('No result for this filter')
        }else{
          const filterObject : IFilterData = {
            data: res,
            reset: false
          }
          this.filterDataService.setFilterData(filterObject);
          this.toastr.success('Filter Applied')
          this.matDialogref.close()
        }
      },
      error : (err)=>{
        alert('api error in filter api')
        this.loader.stop()
        this.matDialogref.close()
      }
    })
  }

  resetFilters(){
    this.loader.start()
    localStorage.removeItem("country")
    localStorage.removeItem("state")
    localStorage.removeItem("city")
    localStorage.removeItem("pincode")
    this.resetFormServ.setReset(true);
    this.loader.stop();
    this.closeDialog();
  }

  closeDialog(){
    this.matDialogref.close()
  }

  get isFormValid() : boolean{
    return this.filterForm.controls['pincode'].value ? this.filterForm.controls['pincode'].valid : this.cityCtrl.value || this.filterForm.controls['state'].value || this.filterForm.controls['country'].value;
  }
  
}
