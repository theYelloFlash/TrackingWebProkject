import { Injectable } from '@angular/core';
import { CharteredAccountant } from '../Interface/apiResponse';

@Injectable({
  providedIn: 'root', // Make the service available globally
})
export class UserDataService {
  private userData! : CharteredAccountant;

  setUserData(data: CharteredAccountant) {
    this.userData = data;
  }

  getUserData() {
    return this.userData;
  }
}
