import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from '../../services/commonservices';
import { MatIconModule } from '@angular/material/icon';
import { NoSpacesValidator } from '../../commonFunc/onlyspaceValidations';


@Component({
  selector: 'app-login-page',
  standalone: true,
  providers: [CommonService, NgxUiLoaderService],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
    NgxUiLoaderModule,
    MatIconModule
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  loginForm: FormGroup = new FormGroup({});
  hide = true;

  constructor(
    private fb: FormBuilder,
    private commonServ: CommonService,
    private router: Router,
    private toastrServ: ToastrService,
    private loader : NgxUiLoaderService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      user_name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15),NoSpacesValidator]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(15),
          NoSpacesValidator
        ],
      ],
    });
    this.loginForm.get('user_name')?.valueChanges.subscribe(value => {
      const trimmedValue = value.trim();
      if (value !== trimmedValue) {
        this.loginForm.get('user_name')?.setValue(trimmedValue, { emitEvent: false });
      }
    });
    this.loginForm.get('password')?.valueChanges.subscribe(value => {
      const trimmedValue = value.trim();
      if (value !== trimmedValue) {
        this.loginForm.get('password')?.setValue(trimmedValue, { emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loader.start()
      this.commonServ.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.loader.stop()
          this.toastrServ.success('Logged In Successfully');
          if (res.access && res.refresh) {
            localStorage.setItem('access_token', res.access);
            localStorage.setItem('refresh_token', res.refresh);
            this.router.navigate(['/users']);
          } else {
            window.alert('token not found');
          }
        },
        error: (err) => {
          this.loader.stop()
          this.toastrServ.error('Invalid username or password');
        },
      });
    } else {
    }
  }
}

