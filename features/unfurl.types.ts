export interface UserData {
  user_id: string;
  from: Date;
  to: Date;
  projects: Category[];
  languages: Category[];
  editors: Category[];
  operating_systems: Category[];
  machines: Category[];
  labels: Category[];
  branches: null;
  entities: null;
  categories: Category[];
}

export interface Category {
  key: string;
  total: number;
}
