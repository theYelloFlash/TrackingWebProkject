export interface ApiPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Feedback {
  remark1: string;
  remark2: string;
  rating: string;
  reference_by: string;
}

export interface CharteredAccountant {
  id: number;
  name: string;
  sex: string;
  mem_no: string;
  address: string
  address_1: string;
  address_2: string;
  address_3: string;
  address_4: string | null;
  city: string;
  state: string;
  country: string;
  pin: string;
  af: string;
  cop: string;
  emp: string;
  nri: string;
  ass_year: string;
  fel_year: string;
  booth_no: string;
  mobile_no: string;
  email: string;
  profile_pic: string | null;
  feedbacks: Feedback[];
  job_type: string;
  company_name: string;
  designation: string;
  alternate_mobile_no: string;
}
