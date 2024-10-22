import { Injectable } from '@angular/core';
import { ApiPaginatedResponse, CharteredAccountant } from '../Interface/apiResponse';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterDataService {
  paginatedData! : IFilterData
  private filterDataSubject =  new BehaviorSubject<IFilterData>(this.paginatedData);

  setFilterData(filterData : IFilterData){
    this.filterDataSubject.next(filterData);
  }

  getFilterData(): Observable<IFilterData> {
    return this.filterDataSubject.asObservable();
  }
}

export interface IFilterData{
   data : ApiPaginatedResponse<CharteredAccountant>
   reset : boolean, 
}
