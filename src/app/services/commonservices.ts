import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApiPaginatedResponse,
  CharteredAccountant,
} from '../Interface/apiResponse';
import { LoginCredentials, Tokens } from '../Interface/loginCredentials';
import { Cities, Countries, States } from '../Interface/countries';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  access_token = '';
  // access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI5MDczMzc3LCJpYXQiOjE3MjkwNjI1NzcsImp0aSI6IjY5Mzg4YTdhNmM5MzQzNzg4MGJmYjJkNGQ5ZGVjODI0IiwidXNlcl9pZCI6MTF9.IDfaCdISqZR0MWwXCkN6b5YM57Cy5tdqxDjbO4wLtNw";
  headers!: HttpHeaders;
  environment: string = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.environment = environment.Api;
    if (isPlatformBrowser(this.platformId)) {
      this.access_token = localStorage.getItem('access_token')!;
    }
    this.headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.access_token}`
    );
  }

  getAllUsers(
    currentPage: number,
    searchString: string
  ): Observable<ApiPaginatedResponse<CharteredAccountant>> {
    return this.http.get<ApiPaginatedResponse<CharteredAccountant>>(
      `${this.environment}chartered-accountants?search_query=${searchString}&page=${currentPage}`,
      { headers: this.headers }
    );
  }

  login(creadentials: LoginCredentials): Observable<Tokens> {
    return this.http.post<Tokens>(
      `${this.environment}api/login/`,
      creadentials
    );
  }

  getUserByid(id: string): Observable<CharteredAccountant> {
    return this.http.get<CharteredAccountant>(
      `${this.environment}chartered-accountants/${id}`,
      { headers: this.headers }
    );
  }

  commonGetAllUsers(
    searchString: string,
    currentPage: number,
    city?: string,
    state?: string,
    country?: string,
    pincode?: string
  ): Observable<ApiPaginatedResponse<CharteredAccountant>> {
    console.log('api hit')
    return this.http.get<ApiPaginatedResponse<CharteredAccountant>>(`${this.environment}chartered-accountants?search_query=${searchString}&page=${currentPage}&city=${city}&state=${state}&country=${country}&pin=${pincode}`,
      { headers: this.headers }
    );
  }

  getCountries(): Observable<Countries> {
    return this.http.get<Countries>(`${this.environment}api/countries/`, {
      headers: this.headers,
    });
  }

  getStates(country: string): Observable<States> {
    return this.http.get<States>(
      `${this.environment}api/states/?country=${country}`,
      { headers: this.headers }
    );
  }

  getCities(country: string, state: string): Observable<Cities> {
    return this.http.get<Cities>(
      `${this.environment}api/cities/?state=${state}&country=${country}`,
      { headers: this.headers }
    );
  }

  filter(
    country: string,
    state: string,
    city: string,
    pincode: string,
    searchString?: string,
    page?: number,
    name?: string, mem_no?: string, mobile?: string
  ): Observable<ApiPaginatedResponse<CharteredAccountant>> {
    return this.http.get<ApiPaginatedResponse<CharteredAccountant>>(
      `${this.environment}chartered-accountants/?search_query=${searchString}&page=${page}&city=${city}&state=${state}&country=${country}&pin=${pincode}&name=${name}&mem_no=${mem_no}&mobile_no=${mobile}`,
      { headers: this.headers }
    );
  }

  updateCharterdAccountant(
    id: string,
    data: any
  ): Observable<CharteredAccountant> {
    return this.http.patch<CharteredAccountant>(
      `${this.environment}chartered-accountants/${id}/`,
      data,
      { headers: this.headers }
    );
  }

  pinSearch(value: string, country: string, state: string, city: string, name?: string, mem_no?: string, mobile_no?: string): Observable<any> {
    return this.http.get<any>(`${this.environment}api/pins/?pin=${value}&city=${city}&state=${state}&country=${country}&name=${name}&mem_no=${mem_no}&mobile_no=${mobile_no}`, { headers: this.headers });
  }

  nameSearch(value: string, country: string, state: string, city: string, pin: string, mem_no: string, mobile_no: string): Observable<any> {
    return this.http.get<any>(`${this.environment}api/names/?name=${value}&city=${city}&state=${state}&country=${country}&mem_no=${mem_no}&mobile_no=${mobile_no}&pin=${pin}`, { headers: this.headers });
  }

  memNoSearch(value: string, country: string, state: string, city: string, pin: string, mobile_no: string, name: string): Observable<any> {
    return this.http.get<any>(`${this.environment}api/memnumbers/?mem_no=${value}&city=${city}&state=${state}&country=${country}&mobile_no=${mobile_no}&name=${name}&pin=${pin}`, { headers: this.headers });
  }

  mobileNoSearch(value: string, country: string, state: string, city: string, name: string, pin: string, mem_no: string): Observable<any> {
    return this.http.get<any>(`${this.environment}api/mobilenumbers/?mobile_no=${value}&city=${city}&state=${state}&country=${country}&name=${name}&pin=${pin},&mem_no=${mem_no}`, { headers: this.headers });
  }
}
