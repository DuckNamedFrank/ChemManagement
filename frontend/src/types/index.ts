export interface Chemical {
  id: number;
  casNumber: string | null;
  name: string;
  formula: string | null;
  molecularWeight: number | null;
  nfpaHealth: number | null;
  nfpaFire: number | null;
  nfpaReactivity: number | null;
  nfpaSpecial: string | null;
  sdsUrl: string | null;
  supplier: string | null;
  createdAt: string;
  updatedAt: string;
  bottles?: Bottle[];
}

export interface Bottle {
  id: number;
  bottleId: string;
  parentId: string;
  childNumber: number;
  chemicalId: number;
  chemical?: Chemical;
  locationId: number | null;
  location?: Location | null;
  quantity: number | null;
  unit: string | null;
  orderDate: string | null;
  expirationDate: string | null;
  receivedDate: string | null;
  status: 'active' | 'empty' | 'disposed' | 'expired';
  lotNumber: string | null;
  poNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  name: string;
  description: string | null;
  room: string | null;
  building: string | null;
  storageType: string | null;
  createdAt: string;
  updatedAt: string;
  bottles?: Bottle[];
  _count?: {
    bottles: number;
  };
}

export interface Stats {
  totalChemicals: number;
  totalBottles: number;
  activeBottles: number;
  expiredBottles: number;
  totalLocations: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ChemicalLookupResult {
  casNumber: string;
  name: string;
  formula?: string;
  molecularWeight?: number;
  nfpaHealth?: number;
  nfpaFire?: number;
  nfpaReactivity?: number;
  nfpaSpecial?: string;
  sdsUrl?: string;
  supplier?: string;
}
