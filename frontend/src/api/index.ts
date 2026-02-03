import axios from 'axios';
import type { Chemical, Bottle, Location, Stats, Pagination, ChemicalLookupResult } from '../types';

const api = axios.create({
  baseURL: '/api',
});

// Stats
export const getStats = async (): Promise<Stats> => {
  const { data } = await api.get('/stats');
  return data;
};

// Chemicals
export const getChemicals = async (params?: { search?: string; page?: number; limit?: number }): Promise<{ chemicals: Chemical[]; pagination: Pagination }> => {
  const { data } = await api.get('/chemicals', { params });
  return data;
};

export const getChemical = async (id: number): Promise<Chemical> => {
  const { data } = await api.get(`/chemicals/${id}`);
  return data;
};

export const createChemical = async (chemical: Partial<Chemical>): Promise<Chemical> => {
  const { data } = await api.post('/chemicals', chemical);
  return data;
};

export const updateChemical = async (id: number, chemical: Partial<Chemical>): Promise<Chemical> => {
  const { data } = await api.put(`/chemicals/${id}`, chemical);
  return data;
};

export const deleteChemical = async (id: number): Promise<void> => {
  await api.delete(`/chemicals/${id}`);
};

// Bottles
export const getBottles = async (params?: {
  search?: string;
  chemicalId?: number;
  locationId?: number;
  status?: string;
  expired?: boolean;
  page?: number;
  limit?: number
}): Promise<{ bottles: Bottle[]; pagination: Pagination }> => {
  const { data } = await api.get('/bottles', { params });
  return data;
};

export const getBottle = async (id: number): Promise<Bottle> => {
  const { data } = await api.get(`/bottles/${id}`);
  return data;
};

export const createBottles = async (bottleData: {
  chemicalId: number;
  numberOfBottles?: number;
  locationId?: number;
  quantity?: number;
  unit?: string;
  orderDate?: string;
  expirationDate?: string;
  receivedDate?: string;
  lotNumber?: string;
  poNumber?: string;
  notes?: string;
}): Promise<{ message: string; bottles: Bottle[] }> => {
  const { data } = await api.post('/bottles', bottleData);
  return data;
};

export const updateBottle = async (id: number, bottle: Partial<Bottle>): Promise<Bottle> => {
  const { data } = await api.put(`/bottles/${id}`, bottle);
  return data;
};

export const deleteBottle = async (id: number): Promise<void> => {
  await api.delete(`/bottles/${id}`);
};

export const bulkUpdateBottleStatus = async (bottleIds: number[], status: string): Promise<void> => {
  await api.post('/bottles/bulk-status', { bottleIds, status });
};

// Locations
export const getLocations = async (): Promise<Location[]> => {
  const { data } = await api.get('/locations');
  return data;
};

export const getLocation = async (id: number): Promise<Location> => {
  const { data } = await api.get(`/locations/${id}`);
  return data;
};

export const createLocation = async (location: Partial<Location>): Promise<Location> => {
  const { data } = await api.post('/locations', location);
  return data;
};

export const updateLocation = async (id: number, location: Partial<Location>): Promise<Location> => {
  const { data } = await api.put(`/locations/${id}`, location);
  return data;
};

export const deleteLocation = async (id: number): Promise<void> => {
  await api.delete(`/locations/${id}`);
};

// CAS Lookup
export const lookupByCAS = async (casNumber: string): Promise<ChemicalLookupResult> => {
  const { data } = await api.get(`/lookup/cas/${casNumber}`);
  return data;
};

export const searchChemicals = async (query: string): Promise<ChemicalLookupResult[]> => {
  const { data } = await api.get('/lookup/search', { params: { q: query } });
  return data;
};

export const getSdsUrls = async (casNumber: string): Promise<Record<string, string>> => {
  const { data } = await api.get(`/lookup/sds/${casNumber}`);
  return data;
};
