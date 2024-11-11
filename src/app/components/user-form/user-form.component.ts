import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { UserDataService } from '../../services/sharedUserDataService';
import { CharteredAccountant } from '../../Interface/apiResponse';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/commonservices';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { MatRadioModule } from '@angular/material/radio';
import { NoSpacesValidator as NoSpacesValidator } from '../../commonFunc/onlyspaceValidations';
import { MatOptionModule } from '@angular/material/core';
import CountryList, { Country } from 'country-list-with-dial-code-and-flag';
import { RatingModule } from 'ng-starrating';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    NgxUiLoaderModule,
    MatRadioModule,
    MatOptionModule,
    CommonModule,
  ],
  providers: [CommonService],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent {
  userForm: FormGroup = new FormGroup([]);
  userData!: CharteredAccountant;
  userId: string = '';
  selectedFile: File | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  formData!: FormData;
  profile_pic: string | null = '';
  countryList: Array<Country> = [];
  rating: number = 0;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private userDataServ: UserDataService,
    private route: ActivatedRoute,
    private commonServ: CommonService,
    private loader: NgxUiLoaderService,
    private router: Router,
    private toastrServ: ToastrService
  ) {
    this.buildUserForm();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getAllcountriesCode();
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.formData = new FormData();
    this.userForm.get('full_address')?.disable();
    this.userForm.get('city')?.disable();
    this.userForm.get('state')?.disable();
    this.userForm.get('country')?.disable();
    this.userForm.get('pin')?.disable();
    this.userForm.get('mem_no')?.disable();
    this.getFormData();
  }

  getAllcountriesCode() {
    this.countryList = CountryList.getAll();
    console.log(this.countryList[0]);
  }

  setRating(value: number): void {
    this.rating = value;
    this.userForm.get('rating')?.setValue(value);
  }

  getFormData() {
    this.userData = this.userDataServ.getUserData();
    this.profile_pic = this.userData ? this.userData.profile_pic : '';
    if (!this.userData) {
      this.loader.start();
      this.commonServ.getUserByid(this.userId).subscribe({
        next: (res) => {
          this.userData = res;
          this.profile_pic = this.userData.profile_pic;
          this.loader.stop();
          this.patchDatailsForm();
        },
        error: (err) => {
          this.loader.stop();
          console.log('err', err);
        },
      });
    } else {
      this.patchDatailsForm();
    }
  }

  patchDatailsForm() {
    this.userForm.patchValue(this.userData);
    this.userForm.patchValue(this.userData.feedbacks[0]);
    this.rating = parseInt(this.userData.feedbacks[0]?.rating);
    this.userForm.patchValue({
      rating: this.userData.feedbacks[0]?.rating,
      remark1: this.userData.feedbacks[0]?.remark1,
      remark2: this.userData.feedbacks[0]?.remark2,
      reference: this.userData.feedbacks[0]?.reference_by,
    });
    if (!this.userData.job_type) {
      this.userForm.patchValue({
        job_type: 'practice',
      });
    }
    console.log(this.userForm);
  }

  buildUserForm() {
    this.userForm = this.fb.group({
      mem_no: ['', [Validators.pattern('^\\S+$'), Validators.maxLength(20)]],
      ass_year: ['', [Validators.max(4000), Validators.min(1800)]],
      email: ['', [Validators.email]],
      name: [
        '',
        [
          Validators.pattern('^[a-zA-Z\\s]+$'),
          NoSpacesValidator,
          Validators.maxLength(40),
        ],
      ],
      // dob :  ['', []],
      mobile_no: ['', [Validators.pattern('^[1-9]{1}[0-9]{9}$')]],
      alternate_mobile_no: ['', []],
      professional_city: ['', []],
      professional_address: ['', []],
      // whatsapp :  ['', []],
      job_type: ['practice'],
      full_address: ['', [NoSpacesValidator]],
      // address_2: ['', [Validators.required]],
      city: ['', [NoSpacesValidator]],
      state: ['', [NoSpacesValidator]],
      country: ['', [NoSpacesValidator]],
      pin: ['', [Validators.max(999999)]],
      company_name: ['', [NoSpacesValidator]],
      designation: ['', [NoSpacesValidator]],
      rating: [0, [Validators.max(5), this.emptyToZeroValidator]],
      remark1: ['', [NoSpacesValidator]],
      remark2: ['', [NoSpacesValidator]],
      reference_by: ['', [NoSpacesValidator]],
    });
  }

  getElement(ctrl: string): FormControl {
    return this.userForm.get(ctrl) as FormControl;
  }

  submitForm() {
    this.loader.start();
    // getting form fields and apending those values in formdata
    Object.keys(this.userForm.controls).forEach((field) => {
      this.formData.append(field, this.userForm.controls[field].value);
    });
    this.commonServ
      .updateCharterdAccountant(this.userId, this.formData)
      .subscribe({
        next: (res) => {
          this.router.navigate(['users']);
          this.toastrServ.success('updated');
          this.loader.stop();
        },
        error: (err) => {
          this.toastrServ.error('Api error');
          this.loader.stop();
        },
      });
  }

  noStartingZeroValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (value && value.length > 0 && value.startsWith('0')) {
        return { startsWithZero: true }; // Validation error
      }
      return null; // No error
    };
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  emptyToZeroValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value === null || control.value === '') {
      control.setValue(0, { emitEvent: false }); // Set value to 0 without emitting change event
      return null; // Validation passed
    }
    return null; // No errors
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];

      // Check if the file type is JPEG, PNG, or JPG
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(this.selectedFile!.type)) {
        this.toastrServ.error('Invalid file format');
        return;
      }

      // If you want to show the selected image instantly
      const reader = new FileReader();
      reader.onload = () => {
        // this.userData.profile_pic = reader.result as string;
        this.profile_pic = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile!);
      this.formData.append('profile_pic', this.selectedFile!);
    }
  }

  goBack() {
    console.log(this.userDataServ.getUserData());
    this.location.back();
  }
}
