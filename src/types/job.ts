export interface IJobCompany {
  _id: string;
  name: string;
  dp?: string;
  responsive?: boolean;
  joinedYear?: number;
}

export interface IJobListing {
  _id: string;
  salary: number;
  isFree?: boolean;
  title: string;
  location: string;
  image: string;
  images?: string[];
  category: string;
  contractType?: string;
  description?: string;
  listedAgo?: string;
  company?: IJobCompany;
}
