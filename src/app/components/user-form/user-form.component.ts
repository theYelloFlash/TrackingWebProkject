import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Location } from '@angular/common';
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
  profile_pic : string | null = ""

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
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.formData = new FormData();
    this.userForm.get('full_address')?.disable();
    this.getFormData();
  }

  getFormData() {
    this.userData = this.userDataServ.getUserData();
    this.profile_pic = this.userData ? this.userData.profile_pic : "";
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
        },
      });
    }else {
      this.patchDatailsForm();
    }
  }

  patchDatailsForm() {
    this.userForm.patchValue(this.userData);
    this.userForm.patchValue(this.userData.feedbacks[0]);
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
  }

  buildUserForm() {
    this.userForm = this.fb.group({
      mem_no: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.minLength(7),
          Validators.pattern('^\\S+$'),
        ],
      ],
      ass_year: ['', [Validators.max(9999)]],
      email: ['', [Validators.email, Validators.required]],
      name: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z\\s]+$'),
          NoSpacesValidator,
          Validators.maxLength(25),
        ],
      ],
      // dob :  ['', []],
      mobile_no: [
        '',[Validators.required, Validators.pattern('^[1-9]{1}[0-9]{9}$')],
      ],
      // whatsapp :  ['', []],
      job_type: ['practice'],
      full_address: ['', [Validators.required, NoSpacesValidator]],
      // address_2: ['', [Validators.required]],
      city: ['', [Validators.required, NoSpacesValidator]],
      state: ['', [Validators.required, NoSpacesValidator]],
      country: ['', [Validators.required, NoSpacesValidator]],
      pin: ['', [Validators.max(999999)]],
      company_name: ['', [NoSpacesValidator]],
      designation: ['', [NoSpacesValidator]],
      rating: ['', [Validators.min(1), Validators.max(5)]],
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
    this.formData.append('name', this.userForm.controls['name'].value);
    this.formData.append('mem_no', this.userForm.controls['mem_no'].value);
    this.formData.append('ass_year', this.userForm.controls['ass_year'].value);
    this.formData.append('email', this.userForm.controls['email'].value);
    this.formData.append('mobile_no',this.userForm.controls['mobile_no'].value);
    this.formData.append('full_address',this.userForm.controls['full_address']?.value);
    this.formData.append('city', this.userForm.controls['city'].value);
    this.formData.append('state', this.userForm.controls['state'].value);
    this.formData.append('country', this.userForm.controls['country'].value);
    this.formData.append('company_name',this.userForm.controls['company_name'].value);
    this.formData.append('designation',this.userForm.controls['designation'].value);
    this.formData.append('rating', this.userForm.controls['rating'].value);
    this.formData.append('remark1', this.userForm.controls['remark1'].value);
    this.formData.append('remark2', this.userForm.controls['remark2'].value);
    this.formData.append('reference_by',this.userForm.controls['reference_by'].value);
    this.formData.append('job_type', this.userForm.controls['job_type'].value);
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

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];

      // Check if the file type is JPEG, PNG, or JPG
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(this.selectedFile!.type)) {
        this.toastrServ.error('Invalid file format')
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
    this.location.back();
  }
}

