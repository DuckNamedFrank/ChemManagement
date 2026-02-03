import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Filter,
  X
} from 'lucide-react';
import { getBottles, getLocations, deleteBottle, updateBottle } from '../api';
import type { Bottle, Location, Pagination } from '../types';
import NFPADiamond from '../components/NFPADiamond';

export default function Bottles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    locationId: searchParams.get('locationId') || '',
    expired: searchParams.get('expired') === 'true'
  });

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchData();
  }, [page, searchParams.toString()]);

  async function fetchData() {
    setLoading(true);
    try {
      const [bottlesData, locationsData] = await Promise.all([
        getBottles({
          search: searchParams.get('search') || undefined,
          status: searchParams.get('status') || undefined,
          locationId: searchParams.get('locationId') ? parseInt(searchParams.get('locationId')!) : undefined,
          expired: searchParams.get('expired') === 'true' || undefined,
          page,
          limit: 20
        }),
        getLocations()
      ]);
      setBottles(bottlesData.bottles);
      setPagination(bottlesData.pagination);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params: Record<string, string> = { page: '1' };
    if (search) params.search = search;
    if (filters.status) params.status = filters.status;
    if (filters.locationId) params.locationId = filters.locationId;
    if (filters.expired) params.expired = 'true';
    setSearchParams(params);
  }

  function applyFilters() {
    const params: Record<string, string> = { page: '1' };
    if (search) params.search = search;
    if (filters.status) params.status = filters.status;
    if (filters.locationId) params.locationId = filters.locationId;
    if (filters.expired) params.expired = 'true';
    setSearchParams(params);
    setShowFilters(false);
  }

  function clearFilters() {
    setFilters({ status: '', locationId: '', expired: false });
    setSearch('');
    setSearchParams({});
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this bottle?')) return;
    try {
      await deleteBottle(id);
      setBottles(bottles.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting bottle:', error);
      alert('Failed to delete bottle');
    }
  }

  async function handleStatusChange(id: number, status: string) {
    try {
      const updated = await updateBottle(id, { status });
      setBottles(bottles.map(b => b.id === id ? { ...b, ...updated } : b));
    } catch (error) {
      console.error('Error updating bottle:', error);
    }
  }

  const hasActiveFilters = filters.status || filters.locationId || filters.expired || search;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage individual chemical bottles</p>
        </div>
        <Link
          to="/bottles/add"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Add Bottles
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by bottle ID, chemical name, lot number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              hasActiveFilters
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={20} />
            Filters
          </button>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="empty">Empty</option>
                  <option value="disposed">Disposed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={filters.locationId}
                  onChange={(e) => setFilters({ ...filters, locationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All locations</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.room && `(${loc.room})`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.expired}
                    onChange={(e) => setFilters({ ...filters, expired: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm">Show only expired</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Tags */}
        {hasActiveFilters && !showFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
                Search: {search}
                <button onClick={() => { setSearch(''); applyFilters(); }}>
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
                Status: {filters.status}
                <button onClick={() => setFilters({ ...filters, status: '' })}>
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.expired && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                Expired only
                <button onClick={() => setFilters({ ...filters, expired: false })}>
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : bottles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No bottles found</p>
          <Link
            to="/bottles/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            Add your first bottle
          </Link>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">NFPA</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Bottle ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Chemical</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Expiration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bottles.map((bottle) => {
                  const isExpired = bottle.expirationDate && new Date(bottle.expirationDate) < new Date();
                  return (
                    <tr key={bottle.id} className={`hover:bg-gray-50 ${isExpired ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <NFPADiamond
                          health={bottle.chemical?.nfpaHealth}
                          fire={bottle.chemical?.nfpaFire}
                          reactivity={bottle.chemical?.nfpaReactivity}
                          special={bottle.chemical?.nfpaSpecial}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-medium">
                        {bottle.bottleId}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/chemicals/${bottle.chemicalId}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {bottle.chemical?.name}
                        </Link>
                        {bottle.chemical?.casNumber && (
                          <p className="text-xs text-gray-500 font-mono">
                            {bottle.chemical.casNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {bottle.location?.name || '—'}
                        {bottle.location?.room && (
                          <span className="text-xs text-gray-400 block">
                            {bottle.location.room}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {bottle.quantity && bottle.unit
                          ? `${bottle.quantity} ${bottle.unit}`
                          : '—'}
                      </td>
                      <td className={`px-4 py-3 ${isExpired ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        {bottle.expirationDate
                          ? new Date(bottle.expirationDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={bottle.status}
                          onChange={(e) => handleStatusChange(bottle.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border-0 ${
                            bottle.status === 'active' ? 'bg-green-100 text-green-800' :
                            bottle.status === 'empty' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="empty">Empty</option>
                          <option value="disposed">Disposed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(bottle.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * pagination.limit + 1} to{' '}
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} bottles
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
