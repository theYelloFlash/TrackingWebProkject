export interface Countries {
  countries: AddressArray[];
}

export interface States {
  states : AddressArray[];
}

export interface Cities {
  cities: AddressArray[];
}

export interface AddressArray {
  id: string; 
  name: string 
}
