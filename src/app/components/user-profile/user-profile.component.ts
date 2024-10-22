import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonService } from '../../services/commonservices';
import { CharteredAccountant } from '../../Interface/apiResponse';
import { UserDataService } from '../../services/sharedUserDataService';
import { CommonModule, Location } from '@angular/common';


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [HttpClientModule, NgxUiLoaderModule, CommonModule],
  providers : [CommonService],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  userData! : CharteredAccountant
  userId! : string;
  selectedFile: File | null = null;

  constructor(private userDataSharedServ : UserDataService,
    private route : ActivatedRoute,
    private router : Router,
    private commonServ : CommonService,
    private ngxLoader : NgxUiLoaderService,
    private location: Location,
  ){

  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.userData = this.userDataSharedServ.getUserData();
    this.userId = this.route.snapshot.paramMap.get('id')!;
    if(!this.userData){
      this.getUserbyId();
    }
  }

  getUserbyId(){
    this.ngxLoader.start()
    this.commonServ.getUserByid(this.userId).subscribe({
      next : (res)=> {
        this.userData = res;
        this.ngxLoader.stop()
      },
      error : (err) => {
        // window.alert('error in api')
        this.ngxLoader.stop()
      },
      complete : ()=>{
        this.ngxLoader.stop();
      }
    })
  }

  getSAddress() {
    const ca = this.userData;
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

  openUpdateForm(event : Event){
    event.stopPropagation();
    this.userDataSharedServ.setUserData(this.userData);
    this.router.navigate([`user-form/${this.userData.id}`]);
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  goBack() {
    this.location.back();
  }

  callPerson(){
    window.location.href =  `tel:${this.userData.mobile_no}`;
  }

  openWhatsApp(){
    window.location.href = `https://wa.me/+91${this.userData.mobile_no}?text=Hello%20there`
  }
}
